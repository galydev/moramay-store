import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { Order, OrderStatus } from './order.entity';
import { IRepository } from '../common/repository/repository.interface';

interface OrderRow {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  subtotal: string | number;
  shipping_cost: string | number;
  total: string | number;
  shipping_city: string;
  shipping_address: string;
  payment_reference: string | null;
  placed_as_guest: boolean;
  guest_full_name: string | null;
  guest_email: string | null;
  guest_national_id: string | null;
  guest_phone: string | null;
  created_at: string;
  updated_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    status: row.status,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    shippingCity: row.shipping_city,
    shippingAddress: row.shipping_address,
    paymentReference: row.payment_reference,
    placedAsGuest: row.placed_as_guest,
    guestFullName: row.guest_full_name,
    guestEmail: row.guest_email,
    guestNationalId: row.guest_national_id,
    guestPhone: row.guest_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Supabase-backed repository for the `orders` table.
 */
@Injectable()
export class OrdersRepository implements IRepository<Order> {
  private readonly logger = new Logger(OrdersRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? toOrder(data as OrderRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find order ${id}`);
      throw error;
    }
  }

  async findAll(): Promise<ReadonlyArray<Order>> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data ?? []) as OrderRow[]).map(toOrder);
    } catch (error) {
      this.logger.error(error, 'Failed to list orders');
      throw error;
    }
  }

  async findByPaymentReference(paymentReference: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('orders')
        .select('*')
        .eq('payment_reference', paymentReference)
        .maybeSingle();

      if (error) throw error;
      return data ? toOrder(data as OrderRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find order by payment reference ${paymentReference}`);
      throw error;
    }
  }

  async create(entity: Partial<Order>): Promise<Order> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('orders')
        .insert({
          customer_id: entity.customerId ?? null,
          status: entity.status ?? 'pending',
          subtotal: entity.subtotal,
          shipping_cost: entity.shippingCost,
          total: entity.total,
          shipping_city: entity.shippingCity,
          shipping_address: entity.shippingAddress,
          placed_as_guest: entity.placedAsGuest ?? false,
          guest_full_name: entity.guestFullName ?? null,
          guest_email: entity.guestEmail ?? null,
          guest_national_id: entity.guestNationalId ?? null,
          guest_phone: entity.guestPhone ?? null,
          payment_reference: entity.paymentReference ?? null,
        })
        .select('*')
        .single();

      if (error) throw error;
      return toOrder(data as OrderRow);
    } catch (error) {
      this.logger.error(error, 'Failed to create order');
      throw error;
    }
  }

  async update(id: string, changes: Partial<Order>): Promise<Order> {
    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (changes.status !== undefined) patch.status = changes.status;
      if (changes.paymentReference !== undefined)
        patch.payment_reference = changes.paymentReference;
      if (changes.customerId !== undefined) patch.customer_id = changes.customerId;

      const { data, error } = await this.supabaseService
        .getClient()
        .from('orders')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return toOrder(data as OrderRow);
    } catch (error) {
      this.logger.error(error, `Failed to update order ${id}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient().from('orders').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      this.logger.error(error, `Failed to delete order ${id}`);
      throw error;
    }
  }
}
