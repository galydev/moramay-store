import { ArrayMinSize, IsArray, IsIn, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionBillingMode } from '../interfaces/subscription.interface';

export class CreateSubscriptionItemDto {
  @IsUUID()
  productVariantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateSubscriptionDto {
  @IsIn(['automatic', 'manual_confirmation'])
  billingMode!: SubscriptionBillingMode;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionItemDto)
  items!: CreateSubscriptionItemDto[];

  /** Wompi tokenized payment source reference (required for `automatic` billing). */
  paymentSourceReference?: string;
}
