import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AttachPaymentSourceDto } from './dto/attach-payment-source.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionWithItems } from './interfaces/subscription.interface';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsBillingService } from './subscriptions-billing.service';

/**
 * Customer-facing subscription endpoints (contracts/api-spec.json:
 * `/subscriptions`, `/subscriptions/{id}`, `/subscriptions/{id}/confirm-charge`).
 */
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionsBillingService: SubscriptionsBillingService,
  ) {}

  @Get('me')
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<readonly SubscriptionWithItems[]> {
    return this.subscriptionsService.listForCustomer(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionWithItems> {
    return this.subscriptionsService.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionWithItems> {
    return this.subscriptionsService.update(id, user.id, dto);
  }

  @Patch(':id/payment-source')
  async attachPaymentSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AttachPaymentSourceDto,
  ): Promise<SubscriptionWithItems> {
    return this.subscriptionsService.update(id, user.id, {
      paymentSourceReference: dto.paymentSourceReference,
    });
  }

  @Post(':id/confirm-charge')
  async confirmCharge(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<SubscriptionWithItems> {
    await this.subscriptionsService.findByIdForCustomer(id, user.id);
    return this.subscriptionsBillingService.confirmManualCharge(id, user.id);
  }
}
