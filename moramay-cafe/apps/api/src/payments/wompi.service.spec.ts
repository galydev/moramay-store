import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiService } from './wompi.service';
import { createHash } from 'crypto';

describe('WompiService', () => {
  let service: WompiService;
  const eventsSecret = 'test_events_secret';
  const publicKey = 'pub_test_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({ WOMPI_EVENTS_SECRET: eventsSecret, WOMPI_PUBLIC_KEY: publicKey })[key],
          },
        },
      ],
    }).compile();

    service = module.get(WompiService);
  });

  it('builds widget data with a valid integrity signature', () => {
    const widgetData = service.buildWidgetData({
      orderId: 'order-1',
      amountInCents: 5000000,
      customerEmail: 'a@example.com',
      reference: 'MRM-abc',
    });

    const expectedSignature = createHash('sha256')
      .update(`MRM-abc5000000COP${eventsSecret}`)
      .digest('hex');

    expect(widgetData.signatureIntegrity).toBe(expectedSignature);
    expect(widgetData.publicKey).toBe(publicKey);
    expect(widgetData.currency).toBe('COP');
  });

  it('accepts a webhook whose checksum matches the computed signature', () => {
    const timestamp = 1710000000;
    const transaction = {
      id: 'tx-1',
      status: 'APPROVED' as const,
      reference: 'MRM-abc',
      amount_in_cents: 5000000,
    };
    const checksum = createHash('sha256')
      .update(`tx-1APPROVED5000000${timestamp}${eventsSecret}`)
      .digest('hex');

    const isValid = service.verifyWebhookSignature({
      event: 'transaction.updated',
      data: { transaction },
      signature: {
        checksum,
        properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      },
      timestamp,
    });

    expect(isValid).toBe(true);
  });

  it('rejects a webhook with a tampered checksum', () => {
    const timestamp = 1710000000;
    const transaction = {
      id: 'tx-1',
      status: 'APPROVED' as const,
      reference: 'MRM-abc',
      amount_in_cents: 5000000,
    };

    const isValid = service.verifyWebhookSignature({
      event: 'transaction.updated',
      data: { transaction },
      signature: { checksum: 'not-the-real-checksum', properties: ['transaction.id'] },
      timestamp,
    });

    expect(isValid).toBe(false);
  });
});
