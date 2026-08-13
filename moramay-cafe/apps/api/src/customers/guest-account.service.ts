import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { Customer } from './customer.entity';
import { CustomersRepository } from './customers.repository';

export interface GuestAccountInput {
  fullName: string;
  email: string;
  nationalId: string;
  phone?: string;
  city: string;
  shippingAddress: string;
}

/**
 * Creates (or reuses) a Supabase Auth user + `customers` row for a guest
 * checkout, once their payment is approved (T-024). The national id (cédula)
 * is used to seed a temporary password; the customer resets it via
 * Supabase Auth's standard "forgot password" flow.
 */
@Injectable()
export class GuestAccountService {
  private readonly logger = new Logger(GuestAccountService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async findOrCreateForGuest(input: GuestAccountInput): Promise<Customer> {
    try {
      const existing = await this.customersRepository.findByEmail(input.email);
      if (existing) return existing;

      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.admin.createUser({
        email: input.email,
        password: this.buildTemporaryPassword(input.nationalId),
        email_confirm: true,
        user_metadata: { full_name: input.fullName, national_id: input.nationalId },
      });

      if (error || !data?.user) {
        throw error ?? new Error('Supabase Auth did not return a created user.');
      }

      return this.customersRepository.createLinkedToAuthUser(data.user.id, {
        fullName: input.fullName,
        email: input.email,
        nationalId: input.nationalId,
        phone: input.phone ?? null,
        shippingAddress: input.shippingAddress,
        city: input.city,
        createdVia: 'guest_checkout',
      });
    } catch (error) {
      this.logger.error(error, `Failed to create guest account for ${input.email}`);
      throw error;
    }
  }

  private buildTemporaryPassword(nationalId: string): string {
    // Never store or log this value; it exists only to satisfy Supabase
    // Auth's password requirement. The customer must reset it before
    // logging in for the first time.
    return `Moramay-${nationalId}-${Date.now()}`;
  }
}
