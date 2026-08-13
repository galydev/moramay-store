import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  ChargeWithSourceParams,
  CreatePaymentSourceParams,
  WompiPaymentSource,
  WompiTransaction,
} from './interfaces/wompi.interface';

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
 * Thin client for the Wompi Payments API (https://docs.wompi.co).
 * Handles widget signatures, webhook verification, payment source
 * tokenization and recurring charges.
 */
@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly baseUrl: string;
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('WOMPI_ENVIRONMENT', 'sandbox');
    this.baseUrl =
      environment === 'production'
        ? 'https://production.wompi.co/v1'
        : 'https://sandbox.wompi.co/v1';
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') ?? '';
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY') ?? '';

    if (!this.privateKey || !this.publicKey) {
      this.logger.warn('WOMPI_PRIVATE_KEY / WOMPI_PUBLIC_KEY are not configured.');
    }
  }

  /**
   * Builds the widget signature needed by the frontend to open the Wompi
   * checkout widget.
   */
  buildWidgetData(request: WompiTransactionRequest): WompiWidgetData {
    try {
      const integritySecret = this.configService.get<string>('WOMPI_EVENTS_SECRET') ?? '';

      const signatureIntegrity = createHash('sha256')
        .update(`${request.reference}${request.amountInCents}COP${integritySecret}`)
        .digest('hex');

      return {
        publicKey: this.publicKey,
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
   * Verifies the checksum sent by Wompi in the webhook payload.
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

  /**
   * Creates a reusable Wompi Payment Source from a client-side payment token.
   */
  async createPaymentSource(params: CreatePaymentSourceParams): Promise<WompiPaymentSource> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_sources`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: params.type,
          token: params.paymentToken,
          customer_email: params.customerEmail,
          acceptance_token: params.acceptanceToken,
        }),
      });

      const payload = (await response.json()) as {
        data?: WompiPaymentSource;
        error?: { reason?: string };
      };

      if (!response.ok || !payload.data) {
        throw new HttpException(
          `Wompi rejected payment source tokenization: ${payload.error?.reason ?? 'unknown reason'}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return payload.data;
    } catch (error) {
      this.logger.error(
        `Failed to create Wompi payment source for ${params.customerEmail}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Charges a previously tokenized Payment Source (recurring subscription billing).
   */
  async chargeWithSource(params: ChargeWithSourceParams): Promise<WompiTransaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_in_cents: params.amountInCents,
          currency: params.currency,
          customer_email: params.customerEmail,
          payment_source_id: params.paymentSourceId,
          reference: params.reference,
        }),
      });

      const payload = (await response.json()) as {
        data?: WompiTransaction;
        error?: { reason?: string };
      };

      if (!response.ok || !payload.data) {
        throw new HttpException(
          `Wompi rejected charge: ${payload.error?.reason ?? 'unknown reason'}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return payload.data;
    } catch (error) {
      this.logger.error(
        `Failed to charge payment source ${params.paymentSourceId} (ref ${params.reference})`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private readProperty(data: WompiEventPayload['data'], propertyPath: string): string {
    const segments = propertyPath.split('.');
    let current: unknown = data;
    for (const segment of segments) {
      current = (current as Record<string, unknown>)?.[segment];
    }
    return String(current ?? '');
  }
}

export type { WompiEventPayload };
