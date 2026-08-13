import { NotFoundException } from '@nestjs/common';
import { AdminOrdersService } from './orders.service';
import { SupabaseService } from '../auth/supabase.service';

function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    select: jest.fn(() => builder),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

describe('AdminOrdersService', () => {
  let fromMock: jest.Mock;

  const buildSupabaseService = () => {
    fromMock = jest.fn();
    return { getClient: () => ({ from: fromMock }) } as unknown as SupabaseService;
  };

  it('lists orders with mapped items', async () => {
    const supabaseService = buildSupabaseService();
    fromMock.mockReturnValueOnce(
      buildQueryBuilder({
        data: [
          {
            id: 'o1',
            customer_id: 'c1',
            status: 'paid',
            subtotal: 50000,
            shipping_cost: 8000,
            total: 58000,
            shipping_city: 'Bogotá',
            shipping_address: 'Calle 1',
            payment_reference: 'ref-1',
            placed_as_guest: false,
            created_at: '2026-01-01T00:00:00.000Z',
            order_items: [{ id: 'i1', product_variant_id: 'v1', quantity: 2, unit_price: 20000 }],
          },
        ],
        error: null,
      }),
    );

    const service = new AdminOrdersService(supabaseService);
    const result = await service.listOrders();

    expect(result).toHaveLength(1);
    expect(result[0].items[0].quantity).toBe(2);
  });

  it('throws NotFoundException when the order does not exist', async () => {
    const supabaseService = buildSupabaseService();
    fromMock.mockReturnValueOnce(buildQueryBuilder({ data: null, error: null }));

    const service = new AdminOrdersService(supabaseService);

    await expect(service.updateStatus('missing', { status: 'shipped' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
