import { Controller, Get } from '@nestjs/common';
import { AdminOnly } from './decorators/admin-auth.decorator';
import { AdminSubscriptionsService } from './subscriptions.service';

/**
 * T-054: admin listing of subscriptions and billing history.
 */
@Controller('admin/subscriptions')
@AdminOnly()
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: AdminSubscriptionsService) {}

  @Get()
  list() {
    return this.subscriptionsService.listSubscriptions();
  }
}
