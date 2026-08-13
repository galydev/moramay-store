import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ShippingRatesRepository } from './shipping-rates.repository';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, ShippingRatesRepository],
  exports: [ShippingService],
})
export class ShippingModule {}
