import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderResponseDto } from './dto/create-order.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { WompiService } from '../payments/wompi.service';

/**
 * `POST /orders` (T-022): accepts both guest checkout (no `Authorization`
 * header) and authenticated checkout (valid Supabase JWT).
 * `GET /orders/:id` requires authentication and only allows the owning
 * customer to view their order.
 */
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly wompiService: WompiService,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<OrderResponseDto> {
    try {
      const { order, paymentReference } = await this.ordersService.createOrder(
        dto,
        currentUser ?? null,
      );
      const customerEmail = currentUser?.email ?? dto.guestInfo?.email ?? '';
      const paymentWidget = this.wompiService.buildWidgetData({
        orderId: order.id,
        amountInCents: Math.round(order.total * 100),
        customerEmail,
        reference: paymentReference,
      });

      return new OrderResponseDto({
        id: order.id,
        status: order.status,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        paymentReference: order.paymentReference,
        paymentWidget,
      });
    } catch (error) {
      this.logger.error(error, 'Failed to handle POST /orders');
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    try {
      const order = await this.ordersService.getOrderById(id);
      if (!order) {
        throw new NotFoundException(`Order ${id} not found.`);
      }
      if (order.customerId !== currentUser.id && currentUser.role !== 'admin') {
        throw new ForbiddenException('You do not have access to this order.');
      }

      return new OrderResponseDto({
        id: order.id,
        status: order.status,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        paymentReference: order.paymentReference,
      });
    } catch (error) {
      this.logger.error(error, `Failed to handle GET /orders/${id}`);
      throw error;
    }
  }
}
