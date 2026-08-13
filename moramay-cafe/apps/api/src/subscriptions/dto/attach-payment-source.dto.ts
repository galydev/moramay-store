import { IsString } from 'class-validator';

/** Attaches/replaces the tokenized Wompi payment source used for recurring charges. */
export class AttachPaymentSourceDto {
  @IsString()
  paymentSourceReference!: string;
}
