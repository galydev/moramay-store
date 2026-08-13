import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

export interface WompiTransactionRequest {
  orderId: string;
  amountInCents: number;
  customerEmail: string;
  reference: string;
}

export interface WompiWidgetData {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signatureIntegrity: string;
  redirectUrl?: string;
}

interface WompiEventPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
      reference: string;
      amount_in_cents: number;
    };
  };
  signature: {
    checksum: string;
    properties: string[];
  };
  timestamp: number;
}

/**
 * Encapsulates Wompi payment integration (T-023): building the widget
 * signature needed by the frontend to open the Wompi checkout widget, and
 * verifying event webhook signatures per Wompi's integrity-signature
 * algorithm (concatenate the referenced properties + the events secret,
 * then SHA-256).
 */
@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);

  constructor(private readonly configService: ConfigService) {}

  buildWidgetData(request: WompiTransactionRequest): WompiWidgetData {
    try {
      const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY') ?? '';
      const integritySecret = this.configService.get<string>('WOMPI_EVENTS_SECRET') ?? '';

      const signatureIntegrity = createHash('sha256')
        .update(`${request.reference}${request.amountInCents}COP${integritySecret}`)
        .digest('hex');

      return {
        publicKey,
        currency: 'COP',
        amountInCents: request.amountInCents,
        reference: request.reference,
        signatureIntegrity,
      };
    } catch (error) {
      this.logger.error(error, `Failed to build Wompi widget data for order ${request.orderId}`);
      throw error;
    }
  }

  /**
   * Verifies the `checksum` sent by Wompi in the webhook payload against a
   * SHA-256 hash computed from the referenced event properties, the
   * timestamp, and the `WOMPI_EVENTS_SECRET`. Never trusts a payload whose
   * checksum does not match.
   */
  verifyWebhookSignature(payload: WompiEventPayload): boolean {
    try {
      const eventsSecret = this.configService.get<string>('WOMPI_EVENTS_SECRET') ?? '';
      const concatenatedValues = payload.signature.properties
        .map((propertyPath) => this.readProperty(payload.data, propertyPath))
        .join('');

      const expectedChecksum = createHash('sha256')
        .update(`${concatenatedValues}${payload.timestamp}${eventsSecret}`)
        .digest('hex');

      return expectedChecksum.toLowerCase() === payload.signature.checksum.toLowerCase();
    } catch (error) {
      this.logger.error(error, 'Failed to verify Wompi webhook signature');
      throw error;
    }
  }

  private readProperty(data: WompiEventPayload['data'], propertyPath: string): string {
    const segments = propertyPath.split('.');
    // "transaction.id" -> data.transaction.id
    let current: unknown = data;
    for (const segment of segments) {
      current = (current as Record<string, unknown>)?.[segment];
    }
    return String(current ?? '');
  }
}

export type { WompiEventPayload };
