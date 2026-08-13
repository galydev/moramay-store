import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Reviews `next_billing_date` daily and drives each due subscription
 * through the appropriate billing flow depending on `billing_mode`
 * (T-043). Running daily (rather than "once a month") keeps behaviour
 * correct regardless of which day of the month a subscription started.
 */
@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionsBillingService: SubscriptionsBillingService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async processDueSubscriptions(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const dueSubscriptions = await this.subscriptionsService.findDueForBilling(today);

      for (const subscription of dueSubscriptions) {
        try {
          if (subscription.billingMode === 'automatic') {
            await this.subscriptionsBillingService.chargeAutomatic(subscription);
          } else {
            await this.subscriptionsBillingService.requestManualConfirmation(subscription);
          }
        } catch (subscriptionError) {
          // Isolate failures per subscription so one bad charge doesn't
          // stop the rest of the batch from being processed.
          this.logger.error(
            `Fallo al procesar la facturación de la suscripción ${subscription.id}`,
            subscriptionError instanceof Error ? subscriptionError.stack : undefined,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Fallo al ejecutar el cron de facturación de suscripciones (${today})`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
