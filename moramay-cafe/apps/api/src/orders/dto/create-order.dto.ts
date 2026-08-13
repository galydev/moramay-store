import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productVariantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

/**
 * Guest customer information. Required only when the request is not
 * authenticated (no `Authorization` header). Ignored when authenticated.
 */
export class GuestInfoDto {
  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  nationalId!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  @MinLength(1)
  shippingCity!: string;

  @IsString()
  @MinLength(1)
  shippingAddress!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInfoDto)
  guestInfo?: GuestInfoDto;
}

export class OrderResponseDto {
  id!: string;
  status!: string;
  subtotal!: number;
  shippingCost!: number;
  total!: number;
  paymentReference!: string | null;
  paymentWidget?: {
    publicKey: string;
    currency: string;
    amountInCents: number;
    reference: string;
    signatureIntegrity: string;
  };

  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }
}
