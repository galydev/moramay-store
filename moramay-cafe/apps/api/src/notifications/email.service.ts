import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Thin client for the Resend transactional email API
 * (https://resend.com/docs/api-reference/emails/send-email).
 * Uses the global `fetch` (Node 18+) to avoid an extra dependency.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY') ?? '';
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') ?? '';

    if (!this.apiKey || !this.fromEmail) {
      this.logger.warn(
        'RESEND_API_KEY / RESEND_FROM_EMAIL are not configured; emails will not be sent.',
      );
    }
  }

  /**
   * Sends a transactional email. Failures are logged and rethrown so
   * callers can decide how to handle a delivery failure (e.g. keep the
   * subscription in `pending_confirmation` and retry on the next cron run).
   */
  async send(params: SendEmailParams): Promise<void> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend respondió ${response.status}: ${body}`);
      }
    } catch (error) {
      this.logger.error(
        `Fallo al enviar email "${params.subject}" a ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /** Email sent when a subscription requires the customer's manual charge confirmation. */
  async sendManualConfirmationRequest(
    to: string,
    subscriptionId: string,
    amount: number,
  ): Promise<void> {
    await this.send({
      to,
      subject: 'Confirma el cobro de tu suscripción Moramay Café',
      html: `<p>Tu suscripción <strong>${subscriptionId}</strong> está lista para el próximo cobro por
        <strong>$${amount.toLocaleString('es-CO')} COP</strong>.</p>
        <p>Ingresa a tu cuenta para confirmar el cobro de este ciclo.</p>`,
    });
  }
}
