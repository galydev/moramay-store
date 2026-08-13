import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { BillingCronService } from './billing-cron.service';
import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Subscriptions feature module (T-040–T-044): CRUD, Wompi-backed billing,
 * monthly cron and the manual confirmation flow.
 */
@Module({
  imports: [PaymentsModule, NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsBillingService, BillingCronService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
