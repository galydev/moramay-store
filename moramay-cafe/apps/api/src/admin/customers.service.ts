import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

export interface AdminCustomerOrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  createdVia: 'self_registered' | 'guest_checkout';
  createdAt: string;
  orders: AdminCustomerOrderSummary[];
}

/**
 * Admin listing of customer accounts with basic info and order history
 * (T-053).
 */
@Injectable()
export class AdminCustomersService {
  private readonly logger = new Logger(AdminCustomersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async listCustomers(): Promise<ReadonlyArray<AdminCustomer>> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('customers')
        .select('*, orders(id, status, total, created_at)')
        .order('created_at', { ascending: false });

      if (error) throw new InternalServerErrorException(error.message);

      return (data ?? []).map((row) => this.mapCustomer(row));
    } catch (error) {
      this.logger.error('Error listando clientes', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  private mapCustomer(row: Record<string, unknown>): AdminCustomer {
    const ordersRaw = (row.orders as Record<string, unknown>[] | null) ?? [];
    return {
      id: row.id as string,
      fullName: row.full_name as string,
      email: row.email as string,
      phone: (row.phone as string | null) ?? null,
      city: (row.city as string | null) ?? null,
      createdVia: row.created_via as AdminCustomer['createdVia'],
      createdAt: row.created_at as string,
      orders: ordersRaw.map((order) => ({
        id: order.id as string,
        status: order.status as string,
        total: Number(order.total),
        createdAt: order.created_at as string,
      })),
    };
  }
}
