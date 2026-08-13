import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './shipping.service';
import { ShippingRatesRepository } from './shipping-rates.repository';

describe('ShippingService', () => {
  let service: ShippingService;
  let repository: jest.Mocked<ShippingRatesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: ShippingRatesRepository,
          useValue: {
            findByCity: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ShippingService);
    repository = module.get(ShippingRatesRepository);
  });

  it('returns the specific rate configured for a known city', async () => {
    repository.findByCity.mockResolvedValueOnce({
      id: '1',
      city: 'Medellín',
      rate: 8000,
      updatedAt: new Date().toISOString(),
    });

    const rate = await service.getRateForCity('Medellín');

    expect(rate).toBe(8000);
    expect(repository.findByCity).toHaveBeenCalledWith('Medellín');
  });

  it('falls back to the default rate for an unconfigured city', async () => {
    repository.findByCity
      .mockResolvedValueOnce(null) // specific city lookup misses
      .mockResolvedValueOnce({
        id: '2',
        city: 'default',
        rate: 18000,
        updatedAt: new Date().toISOString(),
      });

    const rate = await service.getRateForCity('Cali');

    expect(rate).toBe(18000);
    expect(repository.findByCity).toHaveBeenNthCalledWith(1, 'Cali');
    expect(repository.findByCity).toHaveBeenNthCalledWith(2, 'default');
  });

  it('throws when no default rate is configured', async () => {
    repository.findByCity.mockResolvedValue(null);

    await expect(service.getRateForCity('Cali')).rejects.toThrow(
      'No default shipping rate configured.',
    );
  });
});
