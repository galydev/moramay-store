import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

export interface ProductVariantSnapshot {
  id: string;
  productId: string;
  price: number;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'out_of_stock';
}

interface ProductVariantRow {
  id: string;
  product_id: string;
  price: string | number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock';
}

function toSnapshot(row: ProductVariantRow): ProductVariantSnapshot {
  return {
    id: row.id,
    productId: row.product_id,
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    stockStatus: row.stock_status,
  };
}

/**
 * Read-only access to `product_variants`, used by the orders module to
 * validate stock and price at order-creation time. Full catalog CRUD lives
 * in the (future) catalog module; this repository intentionally exposes
 * only what orders needs.
 */
@Injectable()
export class ProductVariantsLookupRepository {
  private readonly logger = new Logger(ProductVariantsLookupRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<ProductVariantSnapshot>> {
    try {
      if (ids.length === 0) return [];

      const { data, error } = await this.supabaseService
        .getClient()
        .from('product_variants')
        .select('id, product_id, price, stock_quantity, stock_status')
        .in('id', [...ids]);

      if (error) throw error;
      return ((data ?? []) as ProductVariantRow[]).map(toSnapshot);
    } catch (error) {
      this.logger.error(error, 'Failed to look up product variants for order validation');
      throw error;
    }
  }

  /**
   * Atomically decrements stock for a variant, guarding against
   * over-selling under concurrent checkouts by requiring the current
   * quantity to still be enough.
   */
  async decrementStock(variantId: string, quantity: number, currentStock: number): Promise<void> {
    try {
      const { error, count } = await this.supabaseService
        .getClient()
        .from('product_variants')
        .update({ stock_quantity: currentStock - quantity }, { count: 'exact' })
        .eq('id', variantId)
        .gte('stock_quantity', quantity);

      if (error) throw error;
      if (!count) {
        throw new Error(`Insufficient stock for product variant ${variantId}.`);
      }
    } catch (error) {
      this.logger.error(error, `Failed to decrement stock for product variant ${variantId}`);
      throw error;
    }
  }
}
