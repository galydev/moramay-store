import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminOnly } from './decorators/admin-auth.decorator';
import { AdminOrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

/**
 * T-052: admin listing and status transitions for orders.
 */
@Controller('admin/orders')
@AdminOnly()
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.ordersService.listOrders(status);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
