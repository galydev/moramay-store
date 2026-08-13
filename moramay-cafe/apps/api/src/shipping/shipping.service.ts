import { Injectable, Logger } from '@nestjs/common';
import { ShippingRatesRepository } from './shipping-rates.repository';

const DEFAULT_CITY_KEY = 'default';

/**
 * Resolves the shipping cost for a given destination city. Rates are never
 * hardcoded: they are read from the `shipping_rates` table, which is
 * configurable from the admin panel and falls back to the `default` row for
 * any city that does not have a specific rate configured.
 */
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly shippingRatesRepository: ShippingRatesRepository) {}

  async listRates(): Promise<ReadonlyArray<{ city: string; rate: number }>> {
    try {
      const rates = await this.shippingRatesRepository.findAll();
      return rates.map((rate) => ({ city: rate.city, rate: rate.rate }));
    } catch (error) {
      this.logger.error(error, 'Failed to list shipping rates');
      throw error;
    }
  }

  async getRateForCity(city: string): Promise<number> {
    try {
      const normalizedCity = city?.trim();
      if (normalizedCity) {
        const specificRate = await this.shippingRatesRepository.findByCity(normalizedCity);
        if (specificRate) return specificRate.rate;
      }

      const defaultRate = await this.shippingRatesRepository.findByCity(DEFAULT_CITY_KEY);
      if (!defaultRate) {
        throw new Error('No default shipping rate configured.');
      }

      return defaultRate.rate;
    } catch (error) {
      this.logger.error(error, `Failed to resolve shipping rate for city ${city}`);
      throw error;
    }
  }
}
