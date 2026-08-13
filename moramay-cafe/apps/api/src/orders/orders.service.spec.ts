import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';
import { ProductVariantsLookupRepository } from './product-variants-lookup.repository';
import { ShippingService } from '../shipping/shipping.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let orderItemsRepository: jest.Mocked<OrderItemsRepository>;
  let productVariantsLookupRepository: jest.Mocked<ProductVariantsLookupRepository>;
  let shippingService: jest.Mocked<ShippingService>;

  const variant = {
    id: 'variant-1',
    productId: 'product-1',
    price: 25000,
    stockQuantity: 10,
    stockStatus: 'in_stock' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByPaymentReference: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: OrderItemsRepository, useValue: { createMany: jest.fn() } },
        {
          provide: ProductVariantsLookupRepository,
          useValue: { findByIds: jest.fn(), decrementStock: jest.fn() },
        },
        { provide: ShippingService, useValue: { getRateForCity: jest.fn() } },
      ],
    }).compile();

    service = module.get(OrdersService);
    ordersRepository = module.get(OrdersRepository);
    orderItemsRepository = module.get(OrderItemsRepository);
    productVariantsLookupRepository = module.get(ProductVariantsLookupRepository);
    shippingService = module.get(ShippingService);
  });

  it('computes subtotal, shipping cost, and total for a guest order', async () => {
    productVariantsLookupRepository.findByIds.mockResolvedValueOnce([variant]);
    shippingService.getRateForCity.mockResolvedValueOnce(8000);
    ordersRepository.create.mockImplementationOnce(async (entity) => ({
      id: 'order-1',
      customerId: entity.customerId ?? null,
      status: 'pending',
      subtotal: entity.subtotal!,
      shippingCost: entity.shippingCost!,
      total: entity.total!,
      shippingCity: entity.shippingCity!,
      shippingAddress: entity.shippingAddress!,
      paymentReference: entity.paymentReference ?? null,
      placedAsGuest: entity.placedAsGuest ?? false,
      guestFullName: entity.guestFullName ?? null,
      guestEmail: entity.guestEmail ?? null,
      guestNationalId: entity.guestNationalId ?? null,
      guestPhone: entity.guestPhone ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const result = await service.createOrder(
      {
        items: [{ productVariantId: 'variant-1', quantity: 2 }],
        shippingCity: 'Medellín',
        shippingAddress: 'Calle 1 # 2-3',
        guestInfo: { fullName: 'Ana', email: 'ana@example.com', nationalId: '123456' },
      },
      null,
    );

    expect(result.order.subtotal).toBe(50000);
    expect(result.order.shippingCost).toBe(8000);
    expect(result.order.total).toBe(58000);
    expect(result.order.placedAsGuest).toBe(true);
    expect(orderItemsRepository.createMany).toHaveBeenCalledWith('order-1', [
      { productVariantId: 'variant-1', quantity: 2, unitPrice: 25000 },
    ]);
    expect(productVariantsLookupRepository.decrementStock).toHaveBeenCalledWith('variant-1', 2, 10);
  });

  it('rejects guest checkout without guestInfo', async () => {
    await expect(
      service.createOrder(
        {
          items: [{ productVariantId: 'variant-1', quantity: 1 }],
          shippingCity: 'Bogotá',
          shippingAddress: 'x',
        },
        null,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an item when requested quantity exceeds available stock', async () => {
    productVariantsLookupRepository.findByIds.mockResolvedValueOnce([variant]);

    await expect(
      service.createOrder(
        {
          items: [{ productVariantId: 'variant-1', quantity: 999 }],
          shippingCity: 'Bogotá',
          shippingAddress: 'x',
          guestInfo: { fullName: 'Ana', email: 'ana@example.com', nationalId: '123456' },
        },
        null,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('uses the authenticated user id as customerId when not a guest', async () => {
    productVariantsLookupRepository.findByIds.mockResolvedValueOnce([variant]);
    shippingService.getRateForCity.mockResolvedValueOnce(12000);
    ordersRepository.create.mockImplementationOnce(async (entity) => ({
      id: 'order-2',
      customerId: entity.customerId ?? null,
      status: 'pending',
      subtotal: entity.subtotal!,
      shippingCost: entity.shippingCost!,
      total: entity.total!,
      shippingCity: entity.shippingCity!,
      shippingAddress: entity.shippingAddress!,
      paymentReference: entity.paymentReference ?? null,
      placedAsGuest: entity.placedAsGuest ?? false,
      guestFullName: null,
      guestEmail: null,
      guestNationalId: null,
      guestPhone: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const result = await service.createOrder(
      {
        items: [{ productVariantId: 'variant-1', quantity: 1 }],
        shippingCity: 'Bogotá',
        shippingAddress: 'x',
      },
      { id: 'customer-1', email: 'c@example.com', role: 'customer' },
    );

    expect(result.order.customerId).toBe('customer-1');
    expect(result.order.placedAsGuest).toBe(false);
  });
});
