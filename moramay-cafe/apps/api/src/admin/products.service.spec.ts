import { NotFoundException } from '@nestjs/common';
import { AdminProductsService } from './products.service';
import { SupabaseService } from '../auth/supabase.service';

function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    single: jest.fn(() => Promise.resolve(result)),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

describe('AdminProductsService', () => {
  let service: AdminProductsService;
  let fromMock: jest.Mock;

  const buildSupabaseService = () => {
    fromMock = jest.fn();
    return { getClient: () => ({ from: fromMock }) } as unknown as SupabaseService;
  };

  it('lists products mapping variants', async () => {
    const supabaseService = buildSupabaseService();
    fromMock.mockReturnValueOnce(
      buildQueryBuilder({
        data: [
          {
            id: 'p1',
            category: 'coffee',
            name: 'Café X',
            description: null,
            origin: null,
            roast_date: null,
            lot_number: null,
            base_price: 20000,
            status: 'active',
            product_variants: [
              {
                id: 'v1',
                product_id: 'p1',
                weight: '250g',
                grind_type: 'whole_bean',
                attribute_label: null,
                price: 20000,
                stock_quantity: 5,
                stock_status: 'in_stock',
              },
            ],
          },
        ],
        error: null,
      }),
    );

    service = new AdminProductsService(supabaseService);
    const result = await service.listProducts();

    expect(result).toHaveLength(1);
    expect(result[0].variants[0].stockStatus).toBe('in_stock');
  });

  it('throws NotFoundException when updating a missing product', async () => {
    const supabaseService = buildSupabaseService();
    fromMock.mockReturnValueOnce(buildQueryBuilder({ data: null, error: null }));

    service = new AdminProductsService(supabaseService);

    await expect(service.updateProduct('missing-id', { status: 'inactive' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
