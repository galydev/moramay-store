import { IsIn, IsOptional, IsString } from 'class-validator';
import { SubscriptionBillingMode, SubscriptionStatus } from '../interfaces/subscription.interface';

/**
 * Partial update for a subscription. Used to pause, resume, cancel or
 * modify billing mode / payment source of an existing subscription.
 */
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsIn(['active', 'paused', 'cancelled'] as SubscriptionStatus[])
  status?: Extract<SubscriptionStatus, 'active' | 'paused' | 'cancelled'>;

  @IsOptional()
  @IsIn(['automatic', 'manual_confirmation'])
  billingMode?: SubscriptionBillingMode;

  @IsOptional()
  @IsString()
  paymentSourceReference?: string;
}
