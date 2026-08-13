import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/** Encapsulates transactional email delivery (Resend). */
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
