import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsOptional()
  @IsIn(['250g', '340g'])
  weight?: string;

  @IsOptional()
  @IsIn(['whole_bean', 'fine', 'medium', 'coarse'])
  grindType?: string;

  @IsOptional()
  @IsString()
  attributeLabel?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;
}

export class CreateProductDto {
  @IsIn(['coffee', 'merch'])
  category!: 'coffee' | 'merch';

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  roastDate?: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
