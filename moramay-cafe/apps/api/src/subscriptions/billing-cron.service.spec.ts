import { BillingCronService } from './billing-cron.service';
import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionWithItems } from './interfaces/subscription.interface';

function buildSubscription(overrides: Partial<SubscriptionWithItems>): SubscriptionWithItems {
  return {
    id: 'sub-1',
    customerId: 'customer-1',
    status: 'active',
    billingMode: 'automatic',
    frequency: 'monthly',
    nextBillingDate: '2026-08-13',
    paymentSourceReference: '123',
    createdAt: '2026-07-13T00:00:00.000Z',
    updatedAt: '2026-07-13T00:00:00.000Z',
    items: [],
    ...overrides,
  };
}

describe('BillingCronService', () => {
  it('charges automatic subscriptions and requests manual confirmation for the rest', async () => {
    const automaticSub = buildSubscription({ id: 'sub-auto', billingMode: 'automatic' });
    const manualSub = buildSubscription({ id: 'sub-manual', billingMode: 'manual_confirmation' });

    const subscriptionsService = {
      findDueForBilling: jest.fn().mockResolvedValue([automaticSub, manualSub]),
    } as unknown as SubscriptionsService;

    const chargeAutomatic = jest.fn().mockResolvedValue(undefined);
    const requestManualConfirmation = jest.fn().mockResolvedValue(undefined);

    const subscriptionsBillingService = {
      chargeAutomatic,
      requestManualConfirmation,
    } as unknown as SubscriptionsBillingService;

    const cron = new BillingCronService(subscriptionsService, subscriptionsBillingService);
    await cron.processDueSubscriptions();

    expect(chargeAutomatic).toHaveBeenCalledWith(automaticSub);
    expect(requestManualConfirmation).toHaveBeenCalledWith(manualSub);
  });

  it('isolates a failure in one subscription so the rest still get processed', async () => {
    const failingSub = buildSubscription({ id: 'sub-fail', billingMode: 'automatic' });
    const okSub = buildSubscription({ id: 'sub-ok', billingMode: 'manual_confirmation' });

    const subscriptionsService = {
      findDueForBilling: jest.fn().mockResolvedValue([failingSub, okSub]),
    } as unknown as SubscriptionsService;

    const chargeAutomatic = jest.fn().mockRejectedValue(new Error('wompi down'));
    const requestManualConfirmation = jest.fn().mockResolvedValue(undefined);

    const subscriptionsBillingService = {
      chargeAutomatic,
      requestManualConfirmation,
    } as unknown as SubscriptionsBillingService;

    const cron = new BillingCronService(subscriptionsService, subscriptionsBillingService);
    await expect(cron.processDueSubscriptions()).resolves.toBeUndefined();

    expect(requestManualConfirmation).toHaveBeenCalledWith(okSub);
  });
});
