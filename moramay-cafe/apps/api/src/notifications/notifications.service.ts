import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OrderConfirmationEmailInput {
  toEmail: string;
  orderId: string;
  total: number;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Sends transactional emails via the Resend HTTP API. Uses `fetch`
 * directly (available in Node 18+) rather than adding a new dependency,
 * consistent with the "no over-engineering" convention.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOrderConfirmation(input: OrderConfirmationEmailInput): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

      if (!apiKey || !fromEmail) {
        this.logger.warn(
          `RESEND_API_KEY / RESEND_FROM_EMAIL not configured; skipping confirmation email for order ${input.orderId}`,
        );
        return;
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [input.toEmail],
          subject: `Confirmación de tu pedido #${input.orderId}`,
          html: this.buildOrderConfirmationHtml(input),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API responded with ${response.status}: ${body}`);
      }
    } catch (error) {
      this.logger.error(
        error,
        `Failed to send order confirmation email for order ${input.orderId}`,
      );
      throw error;
    }
  }

  private buildOrderConfirmationHtml(input: OrderConfirmationEmailInput): string {
    return `
      <div>
        <h1>¡Gracias por tu compra en Moramay Café!</h1>
        <p>Tu pedido <strong>#${input.orderId}</strong> fue confirmado.</p>
        <p>Total pagado: $${input.total.toLocaleString('es-CO')}</p>
      </div>
    `;
  }
}
