import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { WompiService, WompiEventPayload } from './wompi.service';
import { PaymentsWebhookService } from './payments-webhook.service';

/**
 * `POST /payments/webhook` (also reachable at `/webhooks/wompi` per the
 * mission spec) — receives Wompi transaction events, validates the
 * integrity checksum, and updates the corresponding order's status (T-023).
 */
@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly wompiService: WompiService,
    private readonly paymentsWebhookService: PaymentsWebhookService,
  ) {}

  @Post(['payments/webhook', 'webhooks/wompi'])
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: WompiEventPayload): Promise<{ received: true }> {
    try {
      const isValid = this.wompiService.verifyWebhookSignature(payload);
      if (!isValid) {
        this.logger.warn(
          `Rejected Wompi webhook with invalid signature for reference ${payload?.data?.transaction?.reference}`,
        );
        throw new UnauthorizedException('Invalid webhook signature.');
      }

      await this.paymentsWebhookService.handleTransactionEvent(payload);
      return { received: true };
    } catch (error) {
      this.logger.error(error, 'Failed to process Wompi webhook');
      throw error;
    }
  }
}
