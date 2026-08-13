import { Module } from '@nestjs/common';
import { AdminProductsController } from './products.controller';
import { AdminProductsService } from './products.service';
import { AdminOrdersController } from './orders.controller';
import { AdminOrdersService } from './orders.service';
import { AdminCustomersController } from './customers.controller';
import { AdminCustomersService } from './customers.service';
import { AdminSubscriptionsController } from './subscriptions.controller';
import { AdminSubscriptionsService } from './subscriptions.service';
import { AdminInvitationsController } from './invitations.controller';
import { AdminInvitationsService } from './invitations.service';
import { ResendEmailService } from './email/resend-email.service';

/**
 * Groups every `/admin/*` route (products, orders, customers,
 * subscriptions, invitations). `SupabaseService`/`JwtAuthGuard`/`RolesGuard`
 * come from the global `AuthModule`; no need to import it explicitly.
 */
@Module({
  controllers: [
    AdminProductsController,
    AdminOrdersController,
    AdminCustomersController,
    AdminSubscriptionsController,
    AdminInvitationsController,
  ],
  providers: [
    AdminProductsService,
    AdminOrdersService,
    AdminCustomersService,
    AdminSubscriptionsService,
    AdminInvitationsService,
    ResendEmailService,
  ],
})
export class AdminModule {}
