import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

export interface AdminSubscriptionBillingEntry {
  id: string;
  billedAt: string;
  amount: number;
  result: 'success' | 'failed' | 'awaiting_manual_confirmation';
  paymentReference: string | null;
}

export interface AdminSubscription {
  id: string;
  customerId: string;
  status: 'active' | 'paused' | 'cancelled' | 'pending_confirmation';
  billingMode: 'automatic' | 'manual_confirmation';
  nextBillingDate: string;
  createdAt: string;
  billingHistory: AdminSubscriptionBillingEntry[];
}

/**
 * Admin listing of subscriptions with status and billing history (T-054).
 */
@Injectable()
export class AdminSubscriptionsService {
  private readonly logger = new Logger(AdminSubscriptionsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async listSubscriptions(): Promise<ReadonlyArray<AdminSubscription>> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('subscriptions')
        .select('*, subscription_billing_history(*)')
        .order('created_at', { ascending: false });

      if (error) throw new InternalServerErrorException(error.message);

      return (data ?? []).map((row) => this.mapSubscription(row));
    } catch (error) {
      this.logger.error(
        'Error listando suscripciones',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private mapSubscription(row: Record<string, unknown>): AdminSubscription {
    const historyRaw = (row.subscription_billing_history as Record<string, unknown>[] | null) ?? [];
    return {
      id: row.id as string,
      customerId: row.customer_id as string,
      status: row.status as AdminSubscription['status'],
      billingMode: row.billing_mode as AdminSubscription['billingMode'],
      nextBillingDate: row.next_billing_date as string,
      createdAt: row.created_at as string,
      billingHistory: historyRaw.map((entry) => ({
        id: entry.id as string,
        billedAt: entry.billed_at as string,
        amount: Number(entry.amount),
        result: entry.result as AdminSubscriptionBillingEntry['result'],
        paymentReference: (entry.payment_reference as string | null) ?? null,
      })),
    };
  }
}
