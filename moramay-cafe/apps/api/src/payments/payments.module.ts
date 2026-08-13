import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookService } from './payments-webhook.service';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Encapsulates Wompi payments integration: widget signatures, webhook
 * verification, payment source tokenization and recurring charges.
 * Exported for consumption by the orders and subscriptions modules.
 */
@Module({
  imports: [OrdersModule, CustomersModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [WompiService, PaymentsWebhookService],
  exports: [WompiService],
})
export class PaymentsModule {}
