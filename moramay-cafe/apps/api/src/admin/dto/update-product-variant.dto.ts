import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsIn(['250g', '340g'])
  weight?: string;

  @IsOptional()
  @IsIn(['whole_bean', 'fine', 'medium', 'coarse'])
  grindType?: string;

  @IsOptional()
  @IsString()
  attributeLabel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
}
