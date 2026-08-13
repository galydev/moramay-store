import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';
import { ProductVariantsLookupRepository } from './product-variants-lookup.repository';
import { ShippingModule } from '../shipping/shipping.module';
import { WompiService } from '../payments/wompi.service';

@Module({
  imports: [ShippingModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    OrderItemsRepository,
    ProductVariantsLookupRepository,
    WompiService,
  ],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
