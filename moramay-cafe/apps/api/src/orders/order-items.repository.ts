import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { OrderItem } from './order-item.entity';

interface OrderItemRow {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: string | number;
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productVariantId: row.product_variant_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
  };
}

/**
 * Supabase-backed repository for the `order_items` table.
 */
@Injectable()
export class OrderItemsRepository {
  private readonly logger = new Logger(OrderItemsRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByOrderId(orderId: string): Promise<ReadonlyArray<OrderItem>> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return ((data ?? []) as OrderItemRow[]).map(toOrderItem);
    } catch (error) {
      this.logger.error(error, `Failed to list items for order ${orderId}`);
      throw error;
    }
  }

  async createMany(
    orderId: string,
    items: ReadonlyArray<{ productVariantId: string; quantity: number; unitPrice: number }>,
  ): Promise<ReadonlyArray<OrderItem>> {
    try {
      const rows = items.map((item) => ({
        order_id: orderId,
        product_variant_id: item.productVariantId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { data, error } = await this.supabaseService
        .getClient()
        .from('order_items')
        .insert(rows)
        .select('*');

      if (error) throw error;
      return ((data ?? []) as OrderItemRow[]).map(toOrderItem);
    } catch (error) {
      this.logger.error(error, `Failed to create items for order ${orderId}`);
      throw error;
    }
  }
}
