import { Controller, Get } from '@nestjs/common';
import { AdminOnly } from './decorators/admin-auth.decorator';
import { AdminCustomersService } from './customers.service';

/**
 * T-053: admin listing of customer accounts with order history.
 */
@Controller('admin/customers')
@AdminOnly()
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  list() {
    return this.customersService.listCustomers();
  }
}
