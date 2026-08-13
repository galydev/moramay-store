import { AdminSubscriptionsService } from './subscriptions.service';
import { SupabaseService } from '../auth/supabase.service';

function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    select: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

describe('AdminSubscriptionsService', () => {
  it('lists subscriptions with billing history', async () => {
    const fromMock = jest.fn().mockReturnValueOnce(
      buildQueryBuilder({
        data: [
          {
            id: 's1',
            customer_id: 'c1',
            status: 'active',
            billing_mode: 'automatic',
            next_billing_date: '2026-02-01',
            created_at: '2026-01-01T00:00:00.000Z',
            subscription_billing_history: [
              {
                id: 'b1',
                billed_at: '2026-01-01T00:00:00.000Z',
                amount: 30000,
                result: 'success',
                payment_reference: 'ref-1',
              },
            ],
          },
        ],
        error: null,
      }),
    );
    const supabaseService = { getClient: () => ({ from: fromMock }) } as unknown as SupabaseService;

    const service = new AdminSubscriptionsService(supabaseService);
    const result = await service.listSubscriptions();

    expect(result).toHaveLength(1);
    expect(result[0].billingHistory[0].result).toBe('success');
  });
});
