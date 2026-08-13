import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { EmailService } from '../notifications/email.service';
import { WompiService } from '../payments/wompi.service';
import { SubscriptionWithItems } from './interfaces/subscription.interface';
import { SubscriptionsService } from './subscriptions.service';

interface CustomerContact {
  email: string;
}

interface ProductVariantPrice {
  id: string;
  price: number;
}

/**
 * Shared billing logic used by both the monthly cron (`billing_mode:
 * automatic` / `manual_confirmation`) and the customer-triggered
 * `POST /subscriptions/:id/confirm-charge` endpoint.
 */
@Injectable()
export class SubscriptionsBillingService {
  private readonly logger = new Logger(SubscriptionsBillingService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly wompiService: WompiService,
    private readonly emailService: EmailService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /** Charges the subscription automatically using its stored payment source. */
  async chargeAutomatic(subscription: SubscriptionWithItems): Promise<void> {
    try {
      const amount = await this.computeAmount(subscription);
      const customer = await this.getCustomerContact(subscription.customerId);

      if (!subscription.paymentSourceReference) {
        throw new Error('La suscripción no tiene un método de pago tokenizado.');
      }

      const transaction = await this.wompiService.chargeWithSource({
        amountInCents: Math.round(amount * 100),
        currency: 'COP',
        customerEmail: customer.email,
        paymentSourceId: Number(subscription.paymentSourceReference),
        reference: `sub-${subscription.id}-${Date.now()}`,
      });

      const success = transaction.status === 'APPROVED';

      await this.subscriptionsService.recordBillingResult(
        subscription.id,
        amount,
        success ? 'success' : 'failed',
        transaction.id,
      );

      await this.subscriptionsService.setNextBillingCycle(
        subscription.id,
        success ? 'active' : 'paused',
      );
    } catch (error) {
      this.logger.error(
        `Fallo al procesar el cobro automático de la suscripción ${subscription.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.subscriptionsService.recordBillingResult(subscription.id, 0, 'failed', null);
      throw error;
    }
  }

  /** Sends the manual confirmation email and marks the subscription as awaiting confirmation. */
  async requestManualConfirmation(subscription: SubscriptionWithItems): Promise<void> {
    try {
      const amount = await this.computeAmount(subscription);
      const customer = await this.getCustomerContact(subscription.customerId);

      await this.emailService.sendManualConfirmationRequest(
        customer.email,
        subscription.id,
        amount,
      );

      await this.subscriptionsService.recordBillingResult(
        subscription.id,
        amount,
        'awaiting_manual_confirmation',
        null,
      );

      await this.subscriptionsService.setStatus(subscription.id, 'pending_confirmation');
    } catch (error) {
      this.logger.error(
        `Fallo al solicitar confirmación manual para la suscripción ${subscription.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /** Processes the charge once the customer confirms it (manual_confirmation flow). */
  async confirmManualCharge(
    subscriptionId: string,
    customerId: string,
  ): Promise<SubscriptionWithItems> {
    try {
      const subscription = await this.subscriptionsService.findByIdForCustomer(
        subscriptionId,
        customerId,
      );

      if (!subscription.paymentSourceReference) {
        throw new Error('La suscripción no tiene un método de pago tokenizado.');
      }

      const amount = await this.computeAmount(subscription);
      const customer = await this.getCustomerContact(customerId);

      const transaction = await this.wompiService.chargeWithSource({
        amountInCents: Math.round(amount * 100),
        currency: 'COP',
        customerEmail: customer.email,
        paymentSourceId: Number(subscription.paymentSourceReference),
        reference: `sub-${subscription.id}-confirm-${Date.now()}`,
      });

      const success = transaction.status === 'APPROVED';

      await this.subscriptionsService.recordBillingResult(
        subscription.id,
        amount,
        success ? 'success' : 'failed',
        transaction.id,
      );

      await this.subscriptionsService.setNextBillingCycle(
        subscription.id,
        success ? 'active' : 'pending_confirmation',
      );

      return await this.subscriptionsService.findByIdForCustomer(subscriptionId, customerId);
    } catch (error) {
      this.logger.error(
        `Fallo al confirmar el cobro manual de la suscripción ${subscriptionId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async computeAmount(subscription: SubscriptionWithItems): Promise<number> {
    const client = this.supabaseService.getClient();
    const variantIds = subscription.items.map((item) => item.productVariantId);

    if (variantIds.length === 0) {
      return 0;
    }

    const { data, error } = await client
      .from('product_variants')
      .select('id, price')
      .in('id', variantIds);

    if (error) {
      throw new Error(error.message);
    }

    const prices = (data ?? []) as ProductVariantPrice[];
    const priceByVariantId = new Map(prices.map((variant) => [variant.id, variant.price]));

    return subscription.items.reduce((total, item) => {
      const price = priceByVariantId.get(item.productVariantId) ?? 0;
      return total + price * item.quantity;
    }, 0);
  }

  private async getCustomerContact(customerId: string): Promise<CustomerContact> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('customers')
      .select('email')
      .eq('id', customerId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Cliente no encontrado.');
    }

    return data as CustomerContact;
  }
}
