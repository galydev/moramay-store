import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Thin wrapper around the Resend SDK used to send transactional emails
 * (currently: admin invitation emails).
 */
@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly client: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'no-reply@moramaycafe.com';

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no está configurada; el envío de correos fallará.');
    }

    this.client = new Resend(apiKey || 'placeholder-resend-api-key');
  }

  async sendAdminInvitation(toEmail: string, fullName: string, acceptUrl: string): Promise<void> {
    try {
      const { error } = await this.client.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: 'Invitación al panel de administración de Moramay Café',
        html: `<p>Hola ${fullName},</p>
<p>Has sido invitado a administrar Moramay Café. Haz clic en el siguiente enlace para crear tu cuenta:</p>
<p><a href="${acceptUrl}">${acceptUrl}</a></p>`,
      });

      if (error) {
        throw new InternalServerErrorException(error.message);
      }
    } catch (error) {
      this.logger.error(
        `Error enviando invitación a ${toEmail}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
