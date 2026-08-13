/**
 * Mirrors data-model.md: `subscriptions`, `subscription_items`,
 * `subscription_billing_history`.
 */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending_confirmation';
export type SubscriptionBillingMode = 'automatic' | 'manual_confirmation';
export type SubscriptionFrequency = 'monthly';
export type SubscriptionBillingResult = 'success' | 'failed' | 'awaiting_manual_confirmation';

export interface Subscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  billingMode: SubscriptionBillingMode;
  frequency: SubscriptionFrequency;
  nextBillingDate: string;
  paymentSourceReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  productVariantId: string;
  quantity: number;
}

export interface SubscriptionBillingHistoryEntry {
  id: string;
  subscriptionId: string;
  billedAt: string;
  amount: number;
  result: SubscriptionBillingResult;
  paymentReference: string | null;
}

export interface SubscriptionWithItems extends Subscription {
  items: readonly SubscriptionItem[];
}

/** Raw row shapes as stored in Supabase (snake_case). */
export interface SubscriptionRow {
  id: string;
  customer_id: string;
  status: SubscriptionStatus;
  billing_mode: SubscriptionBillingMode;
  frequency: SubscriptionFrequency;
  next_billing_date: string;
  payment_source_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionItemRow {
  id: string;
  subscription_id: string;
  product_variant_id: string;
  quantity: number;
}

export interface SubscriptionBillingHistoryRow {
  id: string;
  subscription_id: string;
  billed_at: string;
  amount: number;
  result: SubscriptionBillingResult;
  payment_reference: string | null;
}
