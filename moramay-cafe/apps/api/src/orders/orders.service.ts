import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';
import { ProductVariantsLookupRepository } from './product-variants-lookup.repository';
import { ShippingService } from '../shipping/shipping.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

export interface CreatedOrder {
  order: Order;
  paymentReference: string;
}

/**
 * Core business logic for placing an order (T-021): validates stock,
 * computes subtotal/shipping/total, resolves the owning customer (guest
 * info stored on the order, or the authenticated customer id), and
 * persists the order with its line items. Guest accounts are created only
 * after payment is approved (T-024), not at order-creation time.
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderItemsRepository: OrderItemsRepository,
    private readonly productVariantsLookupRepository: ProductVariantsLookupRepository,
    private readonly shippingService: ShippingService,
  ) {}

  async createOrder(
    dto: CreateOrderDto,
    currentUser: AuthenticatedUser | null,
  ): Promise<CreatedOrder> {
    try {
      const isGuest = !currentUser;

      if (isGuest && !dto.guestInfo) {
        throw new BadRequestException('guestInfo is required for guest checkout.');
      }

      const variantIds = dto.items.map((item) => item.productVariantId);
      const variants = await this.productVariantsLookupRepository.findByIds(variantIds);
      const variantById = new Map(variants.map((variant) => [variant.id, variant]));

      let subtotal = 0;
      const itemsToPersist: Array<{
        productVariantId: string;
        quantity: number;
        unitPrice: number;
      }> = [];

      for (const item of dto.items) {
        const variant = variantById.get(item.productVariantId);
        if (!variant) {
          throw new BadRequestException(`Product variant ${item.productVariantId} does not exist.`);
        }
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product variant ${item.productVariantId}.`,
          );
        }

        subtotal += variant.price * item.quantity;
        itemsToPersist.push({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: variant.price,
        });
      }

      const shippingCost = await this.shippingService.getRateForCity(dto.shippingCity);
      const total = subtotal + shippingCost;
      const paymentReference = `MRM-${randomUUID()}`;

      const order = await this.ordersRepository.create({
        customerId: isGuest ? null : currentUser!.id,
        status: 'pending',
        subtotal,
        shippingCost,
        total,
        shippingCity: dto.shippingCity,
        shippingAddress: dto.shippingAddress,
        placedAsGuest: isGuest,
        paymentReference,
        guestFullName: isGuest ? dto.guestInfo!.fullName : null,
        guestEmail: isGuest ? dto.guestInfo!.email : null,
        guestNationalId: isGuest ? dto.guestInfo!.nationalId : null,
        guestPhone: isGuest ? (dto.guestInfo!.phone ?? null) : null,
      });

      await this.orderItemsRepository.createMany(order.id, itemsToPersist);

      for (const item of itemsToPersist) {
        const variant = variantById.get(item.productVariantId)!;
        await this.productVariantsLookupRepository.decrementStock(
          variant.id,
          item.quantity,
          variant.stockQuantity,
        );
      }

      return { order, paymentReference };
    } catch (error) {
      this.logger.error(error, 'Failed to create order');
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await this.ordersRepository.findById(id);
    } catch (error) {
      this.logger.error(error, `Failed to fetch order ${id}`);
      throw error;
    }
  }

  async getOrderByPaymentReference(paymentReference: string): Promise<Order | null> {
    try {
      return await this.ordersRepository.findByPaymentReference(paymentReference);
    } catch (error) {
      this.logger.error(error, `Failed to fetch order by payment reference ${paymentReference}`);
      throw error;
    }
  }

  async markAsPaid(orderId: string, customerId: string | null): Promise<Order> {
    try {
      return await this.ordersRepository.update(orderId, {
        status: 'paid',
        ...(customerId ? { customerId } : {}),
      });
    } catch (error) {
      this.logger.error(error, `Failed to mark order ${orderId} as paid`);
      throw error;
    }
  }

  async markAsFailed(orderId: string): Promise<Order> {
    try {
      return await this.ordersRepository.update(orderId, { status: 'cancelled' });
    } catch (error) {
      this.logger.error(error, `Failed to mark order ${orderId} as cancelled`);
      throw error;
    }
  }
}
