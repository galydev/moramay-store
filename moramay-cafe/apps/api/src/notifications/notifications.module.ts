import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';

/** Encapsulates transactional email delivery (Resend). */
@Module({
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
