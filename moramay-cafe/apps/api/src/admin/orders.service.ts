import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

export interface AdminOrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  customerId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingCity: string;
  shippingAddress: string;
  paymentReference: string | null;
  placedAsGuest: boolean;
  createdAt: string;
  items: AdminOrderItem[];
}

/**
 * Admin listing and status transitions for orders (T-052).
 */
@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async listOrders(status?: string): Promise<ReadonlyArray<AdminOrder>> {
    try {
      const client = this.supabaseService.getClient();
      let query = client
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw new InternalServerErrorException(error.message);

      return (data ?? []).map((row) => this.mapOrder(row));
    } catch (error) {
      this.logger.error('Error listando pedidos', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<AdminOrder> {
    try {
      const client = this.supabaseService.getClient();

      const { data: order, error } = await client
        .from('orders')
        .update({ status: dto.status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, order_items(*)')
        .maybeSingle();

      if (error) throw new InternalServerErrorException(error.message);
      if (!order) throw new NotFoundException(`Pedido ${id} no encontrado.`);

      return this.mapOrder(order);
    } catch (error) {
      this.logger.error(
        `Error actualizando estado del pedido ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private mapOrder(row: Record<string, unknown>): AdminOrder {
    const itemsRaw = (row.order_items as Record<string, unknown>[] | null) ?? [];
    return {
      id: row.id as string,
      customerId: row.customer_id as string,
      status: row.status as AdminOrder['status'],
      subtotal: Number(row.subtotal),
      shippingCost: Number(row.shipping_cost),
      total: Number(row.total),
      shippingCity: row.shipping_city as string,
      shippingAddress: row.shipping_address as string,
      paymentReference: (row.payment_reference as string | null) ?? null,
      placedAsGuest: Boolean(row.placed_as_guest),
      createdAt: row.created_at as string,
      items: itemsRaw.map((item) => ({
        id: item.id as string,
        productVariantId: item.product_variant_id as string,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
      })),
    };
  }
}
