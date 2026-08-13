import { AdminCustomersService } from './customers.service';
import { SupabaseService } from '../auth/supabase.service';

function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    select: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

describe('AdminCustomersService', () => {
  it('lists customers with their order history', async () => {
    const fromMock = jest.fn().mockReturnValueOnce(
      buildQueryBuilder({
        data: [
          {
            id: 'c1',
            full_name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '3001234567',
            city: 'Medellín',
            created_via: 'self_registered',
            created_at: '2026-01-01T00:00:00.000Z',
            orders: [{ id: 'o1', status: 'paid', total: 58000, created_at: '2026-01-02T00:00:00.000Z' }],
          },
        ],
        error: null,
      }),
    );
    const supabaseService = { getClient: () => ({ from: fromMock }) } as unknown as SupabaseService;

    const service = new AdminCustomersService(supabaseService);
    const result = await service.listCustomers();

    expect(result).toHaveLength(1);
    expect(result[0].orders).toHaveLength(1);
    expect(result[0].orders[0].total).toBe(58000);
  });
});
