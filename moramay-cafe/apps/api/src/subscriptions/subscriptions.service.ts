import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  Subscription,
  SubscriptionBillingHistoryEntry,
  SubscriptionBillingHistoryRow,
  SubscriptionItem,
  SubscriptionItemRow,
  SubscriptionRow,
  SubscriptionWithItems,
} from './interfaces/subscription.interface';

/**
 * Data access + business rules for customer subscriptions
 * (data-model.md: `subscriptions`, `subscription_items`,
 * `subscription_billing_history`). Uses the Supabase JS query builder
 * exclusively — no raw/concatenated SQL.
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(customerId: string, dto: CreateSubscriptionDto): Promise<SubscriptionWithItems> {
    try {
      if (dto.billingMode === 'automatic' && !dto.paymentSourceReference) {
        throw new ForbiddenException(
          'Se requiere un método de pago tokenizado para suscripciones con cobro automático.',
        );
      }

      const client = this.supabaseService.getClient();
      const nextBillingDate = this.computeNextBillingDate(new Date());

      const { data: subscriptionRow, error: subscriptionError } = await client
        .from('subscriptions')
        .insert({
          customer_id: customerId,
          status: dto.billingMode === 'automatic' ? 'active' : 'pending_confirmation',
          billing_mode: dto.billingMode,
          frequency: 'monthly',
          next_billing_date: nextBillingDate,
          payment_source_reference: dto.paymentSourceReference ?? null,
        })
        .select('*')
        .single();

      if (subscriptionError || !subscriptionRow) {
        throw new Error(subscriptionError?.message ?? 'No se pudo crear la suscripción.');
      }

      const itemsPayload = dto.items.map((item) => ({
        subscription_id: (subscriptionRow as SubscriptionRow).id,
        product_variant_id: item.productVariantId,
        quantity: item.quantity,
      }));

      const { data: itemRows, error: itemsError } = await client
        .from('subscription_items')
        .insert(itemsPayload)
        .select('*');

      if (itemsError || !itemRows) {
        throw new Error(itemsError?.message ?? 'No se pudieron crear los ítems de la suscripción.');
      }

      return this.toSubscriptionWithItems(
        subscriptionRow as SubscriptionRow,
        itemRows as SubscriptionItemRow[],
      );
    } catch (error) {
      this.logger.error(
        `Fallo al crear suscripción para el cliente ${customerId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async listForCustomer(customerId: string): Promise<readonly SubscriptionWithItems[]> {
    try {
      const client = this.supabaseService.getClient();

      const { data: subscriptionRows, error } = await client
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const rows = (subscriptionRows ?? []) as SubscriptionRow[];
      return await Promise.all(rows.map((row) => this.attachItems(row)));
    } catch (error) {
      this.logger.error(
        `Fallo al listar suscripciones del cliente ${customerId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByIdForCustomer(id: string, customerId: string): Promise<SubscriptionWithItems> {
    try {
      const row = await this.findRowOrThrow(id);
      this.assertOwnership(row, customerId);
      return await this.attachItems(row);
    } catch (error) {
      this.logger.error(
        `Fallo al obtener la suscripción ${id} para el cliente ${customerId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async update(
    id: string,
    customerId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionWithItems> {
    try {
      const existing = await this.findRowOrThrow(id);
      this.assertOwnership(existing, customerId);

      const client = this.supabaseService.getClient();
      const patch: Partial<SubscriptionRow> = { updated_at: new Date().toISOString() };

      if (dto.status) {
        patch.status = dto.status;
      }
      if (dto.billingMode) {
        patch.billing_mode = dto.billingMode;
      }
      if (dto.paymentSourceReference) {
        patch.payment_source_reference = dto.paymentSourceReference;
      }

      const { data: updatedRow, error } = await client
        .from('subscriptions')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !updatedRow) {
        throw new Error(error?.message ?? 'No se pudo actualizar la suscripción.');
      }

      return await this.attachItems(updatedRow as SubscriptionRow);
    } catch (error) {
      this.logger.error(
        `Fallo al actualizar la suscripción ${id} para el cliente ${customerId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async listAllForAdmin(): Promise<readonly SubscriptionWithItems[]> {
    try {
      const client = this.supabaseService.getClient();

      const { data: subscriptionRows, error } = await client
        .from('subscriptions')
        .select('*')
        .order('next_billing_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const rows = (subscriptionRows ?? []) as SubscriptionRow[];
      return await Promise.all(rows.map((row) => this.attachItems(row)));
    } catch (error) {
      this.logger.error(
        'Fallo al listar suscripciones (admin)',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /** Subscriptions due for billing today (used by the billing cron). */
  async findDueForBilling(today: string): Promise<readonly SubscriptionWithItems[]> {
    try {
      const client = this.supabaseService.getClient();

      const { data: subscriptionRows, error } = await client
        .from('subscriptions')
        .select('*')
        .in('status', ['active', 'pending_confirmation'])
        .lte('next_billing_date', today);

      if (error) {
        throw new Error(error.message);
      }

      const rows = (subscriptionRows ?? []) as SubscriptionRow[];
      return await Promise.all(rows.map((row) => this.attachItems(row)));
    } catch (error) {
      this.logger.error(
        `Fallo al buscar suscripciones vencidas al ${today}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async recordBillingResult(
    subscriptionId: string,
    amount: number,
    result: SubscriptionBillingHistoryEntry['result'],
    paymentReference: string | null,
  ): Promise<SubscriptionBillingHistoryEntry> {
    try {
      const client = this.supabaseService.getClient();

      const { data, error } = await client
        .from('subscription_billing_history')
        .insert({
          subscription_id: subscriptionId,
          amount,
          result,
          payment_reference: paymentReference,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'No se pudo registrar el historial de cobro.');
      }

      return this.mapBillingHistoryRow(data as SubscriptionBillingHistoryRow);
    } catch (error) {
      this.logger.error(
        `Fallo al registrar historial de cobro para la suscripción ${subscriptionId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async setNextBillingCycle(subscriptionId: string, status: Subscription['status']): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      const nextBillingDate = this.computeNextBillingDate(new Date());

      const { error } = await client
        .from('subscriptions')
        .update({
          status,
          next_billing_date: nextBillingDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      this.logger.error(
        `Fallo al avanzar el ciclo de facturación de la suscripción ${subscriptionId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async setStatus(subscriptionId: string, status: Subscription['status']): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      const { error } = await client
        .from('subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      this.logger.error(
        `Fallo al actualizar el estado de la suscripción ${subscriptionId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async findRowOrThrow(id: string): Promise<SubscriptionRow> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new NotFoundException('Suscripción no encontrada.');
    }

    return data as SubscriptionRow;
  }

  private assertOwnership(row: SubscriptionRow, customerId: string): void {
    if (row.customer_id !== customerId) {
      throw new ForbiddenException('No tienes permisos para acceder a esta suscripción.');
    }
  }

  private async attachItems(row: SubscriptionRow): Promise<SubscriptionWithItems> {
    const client = this.supabaseService.getClient();

    const { data: itemRows, error } = await client
      .from('subscription_items')
      .select('*')
      .eq('subscription_id', row.id);

    if (error) {
      throw new Error(error.message);
    }

    return this.toSubscriptionWithItems(row, (itemRows ?? []) as SubscriptionItemRow[]);
  }

  private toSubscriptionWithItems(
    row: SubscriptionRow,
    itemRows: readonly SubscriptionItemRow[],
  ): SubscriptionWithItems {
    return {
      ...this.mapSubscriptionRow(row),
      items: itemRows.map((item) => this.mapSubscriptionItemRow(item)),
    };
  }

  private mapSubscriptionRow(row: SubscriptionRow): Subscription {
    return {
      id: row.id,
      customerId: row.customer_id,
      status: row.status,
      billingMode: row.billing_mode,
      frequency: row.frequency,
      nextBillingDate: row.next_billing_date,
      paymentSourceReference: row.payment_source_reference,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSubscriptionItemRow(row: SubscriptionItemRow): SubscriptionItem {
    return {
      id: row.id,
      subscriptionId: row.subscription_id,
      productVariantId: row.product_variant_id,
      quantity: row.quantity,
    };
  }

  private mapBillingHistoryRow(
    row: SubscriptionBillingHistoryRow,
  ): SubscriptionBillingHistoryEntry {
    return {
      id: row.id,
      subscriptionId: row.subscription_id,
      billedAt: row.billed_at,
      amount: row.amount,
      result: row.result,
      paymentReference: row.payment_reference,
    };
  }

  private computeNextBillingDate(from: Date): string {
    const next = new Date(from);
    next.setMonth(next.getMonth() + 1);
    return next.toISOString().slice(0, 10);
  }
}
