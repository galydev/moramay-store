import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './common/logging/logger.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ShippingModule } from './shipping/shipping.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CustomersModule } from './customers/customers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(loggerConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    HealthModule,
    ShippingModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    SubscriptionsModule,
    AdminModule,
  ],
})
export class AppModule {}
