import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookService } from './payments-webhook.service';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OrdersModule, CustomersModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [WompiService, PaymentsWebhookService],
  exports: [WompiService],
})
export class PaymentsModule {}
