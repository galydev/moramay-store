import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';

/**
 * Encapsulates Wompi payments integration (Payment Source tokenization and
 * recurring charges). Exported for consumption by the `subscriptions`
 * module.
 */
@Module({
  providers: [WompiService],
  exports: [WompiService],
})
export class PaymentsModule {}
