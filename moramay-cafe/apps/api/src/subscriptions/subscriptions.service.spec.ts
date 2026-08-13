import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { SubscriptionsService } from './subscriptions.service';

type QueryResult<T> = { data: T; error: null } | { data: null; error: { message: string } };

function buildQueryBuilder(result: QueryResult<unknown>) {
  const builder: Record<string, unknown> = {};
  const chain = (): typeof builder => builder;

  builder.select = jest.fn(chain);
  builder.insert = jest.fn(chain);
  builder.update = jest.fn(chain);
  builder.eq = jest.fn(chain);
  builder.in = jest.fn(chain);
  builder.order = jest.fn(chain);
  builder.lte = jest.fn(chain);
  builder.single = jest.fn().mockResolvedValue(result);
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  // Non-terminal calls (e.g. `.select('*')` awaited directly) resolve too.
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);

  return builder;
}

describe('SubscriptionsService', () => {
  function createService(fromImpl: (table: string) => unknown) {
    const supabaseService = {
      getClient: () => ({ from: fromImpl }),
    } as unknown as SupabaseService;

    return new SubscriptionsService(supabaseService);
  }

  it('rejects creating an automatic subscription without a payment source', async () => {
    const service = createService(() => buildQueryBuilder({ data: null, error: null }));

    await expect(
      service.create('customer-1', {
        billingMode: 'automatic',
        items: [{ productVariantId: 'variant-1', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates a manual_confirmation subscription with pending_confirmation status', async () => {
    const subscriptionRow = {
      id: 'sub-1',
      customer_id: 'customer-1',
      status: 'pending_confirmation',
      billing_mode: 'manual_confirmation',
      frequency: 'monthly',
      next_billing_date: '2026-09-13',
      payment_source_reference: null,
      created_at: '2026-08-13T00:00:00.000Z',
      updated_at: '2026-08-13T00:00:00.000Z',
    };
    const itemRows = [
      { id: 'item-1', subscription_id: 'sub-1', product_variant_id: 'variant-1', quantity: 2 },
    ];

    const service = createService((table: string) => {
      if (table === 'subscriptions') {
        return buildQueryBuilder({ data: subscriptionRow, error: null });
      }
      return buildQueryBuilder({ data: itemRows, error: null });
    });

    const result = await service.create('customer-1', {
      billingMode: 'manual_confirmation',
      items: [{ productVariantId: 'variant-1', quantity: 2 }],
    });

    expect(result.status).toBe('pending_confirmation');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
  });

  it('throws NotFoundException when the subscription does not exist', async () => {
    const service = createService(() => buildQueryBuilder({ data: null, error: null }));

    await expect(service.findByIdForCustomer('missing', 'customer-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when the subscription belongs to another customer', async () => {
    const subscriptionRow = {
      id: 'sub-1',
      customer_id: 'someone-else',
      status: 'active',
      billing_mode: 'automatic',
      frequency: 'monthly',
      next_billing_date: '2026-09-13',
      payment_source_reference: '123',
      created_at: '2026-08-13T00:00:00.000Z',
      updated_at: '2026-08-13T00:00:00.000Z',
    };

    const service = createService(() => buildQueryBuilder({ data: subscriptionRow, error: null }));

    await expect(service.findByIdForCustomer('sub-1', 'customer-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
