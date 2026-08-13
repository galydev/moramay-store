import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChargeWithSourceParams,
  CreatePaymentSourceParams,
  WompiPaymentSource,
  WompiTransaction,
} from './interfaces/wompi.interface';

/**
 * Thin client for the Wompi Payments API (https://docs.wompi.co).
 * Handles Payment Source tokenization (reusable token for recurring
 * subscription charges) and charging an existing Payment Source.
 *
 * Uses the global `fetch` (Node 18+ runtime) to avoid extra dependencies.
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
   * Creates a reusable Wompi Payment Source from a client-side payment
   * token, returning the source id used for future recurring charges.
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
          `Wompi rechazó la tokenización del método de pago: ${payload.error?.reason ?? 'motivo desconocido'}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return payload.data;
    } catch (error) {
      this.logger.error(
        `Fallo al crear payment source en Wompi para ${params.customerEmail}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Charges a previously tokenized Payment Source (recurring subscription
   * billing). Returns the resulting Wompi transaction.
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
          `Wompi rechazó el cobro: ${payload.error?.reason ?? 'motivo desconocido'}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return payload.data;
    } catch (error) {
      this.logger.error(
        `Fallo al cobrar payment source ${params.paymentSourceId} (ref ${params.reference})`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
