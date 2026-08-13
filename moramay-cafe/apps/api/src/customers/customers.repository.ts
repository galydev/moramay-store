import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { Customer, CustomerCreatedVia } from './customer.entity';
import { IRepository } from '../common/repository/repository.interface';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  national_id: string | null;
  phone: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  created_via: CustomerCreatedVia;
  created_at: string;
  updated_at: string;
}

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    nationalId: row.national_id,
    phone: row.phone,
    billingAddress: row.billing_address,
    shippingAddress: row.shipping_address,
    city: row.city,
    createdVia: row.created_via,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Supabase-backed repository for the `customers` table. `id` mirrors the
 * corresponding Supabase Auth user id (see data-model.md).
 */
@Injectable()
export class CustomersRepository implements IRepository<Customer> {
  private readonly logger = new Logger(CustomersRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? toCustomer(data as CustomerRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find customer ${id}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('customers')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (error) throw error;
      return data ? toCustomer(data as CustomerRow) : null;
    } catch (error) {
      this.logger.error(error, `Failed to find customer by email ${email}`);
      throw error;
    }
  }

  async findAll(): Promise<ReadonlyArray<Customer>> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data ?? []) as CustomerRow[]).map(toCustomer);
    } catch (error) {
      this.logger.error(error, 'Failed to list customers');
      throw error;
    }
  }

  /**
   * Inserts a `customers` row for an id that already exists in
   * `auth.users` (created via Supabase Auth Admin API beforehand).
   */
  async createLinkedToAuthUser(id: string, entity: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('customers')
        .insert({
          id,
          full_name: entity.fullName,
          email: entity.email,
          national_id: entity.nationalId,
          phone: entity.phone,
          billing_address: entity.billingAddress,
          shipping_address: entity.shippingAddress,
          city: entity.city,
          created_via: entity.createdVia ?? 'guest_checkout',
        })
        .select('*')
        .single();

      if (error) throw error;
      return toCustomer(data as CustomerRow);
    } catch (error) {
      this.logger.error(error, `Failed to create customer record linked to auth user ${id}`);
      throw error;
    }
  }

  async create(entity: Partial<Customer>): Promise<Customer> {
    if (!entity.id) {
      throw new Error('Customer id is required (must match a Supabase Auth user id).');
    }
    return this.createLinkedToAuthUser(entity.id, entity);
  }

  async update(id: string, changes: Partial<Customer>): Promise<Customer> {
    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (changes.fullName !== undefined) patch.full_name = changes.fullName;
      if (changes.phone !== undefined) patch.phone = changes.phone;
      if (changes.billingAddress !== undefined) patch.billing_address = changes.billingAddress;
      if (changes.shippingAddress !== undefined) patch.shipping_address = changes.shippingAddress;
      if (changes.city !== undefined) patch.city = changes.city;

      const { data, error } = await this.supabaseService
        .getClient()
        .from('customers')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return toCustomer(data as CustomerRow);
    } catch (error) {
      this.logger.error(error, `Failed to update customer ${id}`);
      throw error;
    }
  }
}
