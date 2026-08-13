import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { ShippingRate } from './shipping-rate.entity';
import { IRepository } from '../common/repository/repository.interface';

interface ShippingRateRow {
  id: string;
  city: string;
  rate: string | number;
  updated_at: string;
}

function toShippingRate(row: ShippingRateRow): ShippingRate {
  return {
    id: row.id,
    city: row.city,
    rate: Number(row.rate),
    updatedAt: row.updated_at,
  };
}

/**
 * Supabase-backed repository for the `shipping_rates` table. Queries use the
 * Supabase query builder exclusively — no concatenated SQL.
 */
@Injectable()
export class ShippingRatesRepository implements IRepository<ShippingRate> {
  private readonly logger = new Logger(ShippingRatesRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string): Promise<ShippingRate | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('shipping_rates')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? toShippingRate(data as ShippingRateRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find shipping rate by id ${id}`);
      throw error;
    }
  }

  async findAll(): Promise<ReadonlyArray<ShippingRate>> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('shipping_rates')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;
      return ((data ?? []) as ShippingRateRow[]).map(toShippingRate);
    } catch (error) {
      this.logger.error(error, 'Failed to list shipping rates');
      throw error;
    }
  }

  async findByCity(city: string): Promise<ShippingRate | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('shipping_rates')
        .select('*')
        .ilike('city', city)
        .maybeSingle();

      if (error) throw error;
      return data ? toShippingRate(data as ShippingRateRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find shipping rate for city ${city}`);
      throw error;
    }
  }

  async create(entity: Partial<ShippingRate>): Promise<ShippingRate> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('shipping_rates')
        .insert({ city: entity.city, rate: entity.rate })
        .select('*')
        .single();

      if (error) throw error;
      return toShippingRate(data as ShippingRateRow);
    } catch (error) {
      this.logger.error(error, 'Failed to create shipping rate');
      throw error;
    }
  }

  async update(id: string, changes: Partial<ShippingRate>): Promise<ShippingRate> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('shipping_rates')
        .update({ city: changes.city, rate: changes.rate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return toShippingRate(data as ShippingRateRow);
    } catch (error) {
      this.logger.error(error, `Failed to update shipping rate ${id}`);
      throw error;
    }
  }
}
