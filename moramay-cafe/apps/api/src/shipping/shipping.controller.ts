import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

/**
 * Public shipping endpoints used by the checkout flow to display shipping
 * cost for the selected city before payment.
 */
@Controller('shipping')
export class ShippingController {
  private readonly logger = new Logger(ShippingController.name);

  constructor(private readonly shippingService: ShippingService) {}

  @Get('rates')
  async getRate(@Query('city') city: string): Promise<{ city: string; rate: number }> {
    try {
      const rate = await this.shippingService.getRateForCity(city);
      return { city, rate };
    } catch (error) {
      this.logger.error(error, `Failed to get shipping rate for city ${city}`);
      throw error;
    }
  }
}
