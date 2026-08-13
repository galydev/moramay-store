import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

export interface AdminProductVariant {
  id: string;
  productId: string;
  weight: string | null;
  grindType: string | null;
  attributeLabel: string | null;
  price: number;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'out_of_stock';
}

export interface AdminProduct {
  id: string;
  category: 'coffee' | 'merch';
  name: string;
  description: string | null;
  origin: string | null;
  roastDate: string | null;
  lotNumber: string | null;
  basePrice: number;
  status: 'active' | 'inactive';
  variants: AdminProductVariant[];
}

/**
 * Admin CRUD over `products` / `product_variants` (T-051). Products are
 * never hard-deleted — "delete" means setting `status = 'inactive'`.
 */
@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async listProducts(): Promise<ReadonlyArray<AdminProduct>> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false });

      if (error) throw new InternalServerErrorException(error.message);

      return (data ?? []).map((row) => this.mapProduct(row));
    } catch (error) {
      this.logger.error('Error listando productos', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async createProduct(dto: CreateProductDto): Promise<AdminProduct> {
    try {
      const client = this.supabaseService.getClient();

      const { data: product, error: productError } = await client
        .from('products')
        .insert({
          category: dto.category,
          name: dto.name,
          description: dto.description ?? null,
          origin: dto.origin ?? null,
          roast_date: dto.roastDate ?? null,
          lot_number: dto.lotNumber ?? null,
          base_price: dto.basePrice,
        })
        .select('*')
        .single();

      if (productError || !product) {
        throw new InternalServerErrorException(
          productError?.message ?? 'No se pudo crear el producto.',
        );
      }

      const variantRows = dto.variants.map((variant) => ({
        product_id: product.id,
        weight: variant.weight ?? null,
        grind_type: variant.grindType ?? null,
        attribute_label: variant.attributeLabel ?? null,
        price: variant.price,
        stock_quantity: variant.stockQuantity,
      }));

      const { data: variants, error: variantsError } = await client
        .from('product_variants')
        .insert(variantRows)
        .select('*');

      if (variantsError) {
        throw new InternalServerErrorException(variantsError.message);
      }

      return this.mapProduct({ ...product, product_variants: variants ?? [] });
    } catch (error) {
      this.logger.error('Error creando producto', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<AdminProduct> {
    try {
      const client = this.supabaseService.getClient();

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (dto.name !== undefined) patch.name = dto.name;
      if (dto.description !== undefined) patch.description = dto.description;
      if (dto.origin !== undefined) patch.origin = dto.origin;
      if (dto.roastDate !== undefined) patch.roast_date = dto.roastDate;
      if (dto.lotNumber !== undefined) patch.lot_number = dto.lotNumber;
      if (dto.basePrice !== undefined) patch.base_price = dto.basePrice;
      if (dto.status !== undefined) patch.status = dto.status;

      const { data: product, error } = await client
        .from('products')
        .update(patch)
        .eq('id', id)
        .select('*, product_variants(*)')
        .maybeSingle();

      if (error) throw new InternalServerErrorException(error.message);
      if (!product) throw new NotFoundException(`Producto ${id} no encontrado.`);

      return this.mapProduct(product);
    } catch (error) {
      this.logger.error(
        `Error actualizando producto ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async deactivateProduct(id: string): Promise<AdminProduct> {
    return this.updateProduct(id, { status: 'inactive' });
  }

  async updateVariant(
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<AdminProductVariant> {
    try {
      const client = this.supabaseService.getClient();

      const patch: Record<string, unknown> = {};
      if (dto.weight !== undefined) patch.weight = dto.weight;
      if (dto.grindType !== undefined) patch.grind_type = dto.grindType;
      if (dto.attributeLabel !== undefined) patch.attribute_label = dto.attributeLabel;
      if (dto.price !== undefined) patch.price = dto.price;
      if (dto.stockQuantity !== undefined) patch.stock_quantity = dto.stockQuantity;

      const { data: variant, error } = await client
        .from('product_variants')
        .update(patch)
        .eq('id', variantId)
        .select('*')
        .maybeSingle();

      if (error) throw new InternalServerErrorException(error.message);
      if (!variant) throw new NotFoundException(`Variante ${variantId} no encontrada.`);

      return this.mapVariant(variant);
    } catch (error) {
      this.logger.error(
        `Error actualizando variante ${variantId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private mapProduct(row: Record<string, unknown>): AdminProduct {
    const variantsRaw = (row.product_variants as Record<string, unknown>[] | null) ?? [];
    return {
      id: row.id as string,
      category: row.category as 'coffee' | 'merch',
      name: row.name as string,
      description: (row.description as string | null) ?? null,
      origin: (row.origin as string | null) ?? null,
      roastDate: (row.roast_date as string | null) ?? null,
      lotNumber: (row.lot_number as string | null) ?? null,
      basePrice: Number(row.base_price),
      status: row.status as 'active' | 'inactive',
      variants: variantsRaw.map((variant) => this.mapVariant(variant)),
    };
  }

  private mapVariant(row: Record<string, unknown>): AdminProductVariant {
    return {
      id: row.id as string,
      productId: row.product_id as string,
      weight: (row.weight as string | null) ?? null,
      grindType: (row.grind_type as string | null) ?? null,
      attributeLabel: (row.attribute_label as string | null) ?? null,
      price: Number(row.price),
      stockQuantity: Number(row.stock_quantity),
      stockStatus: row.stock_status as 'in_stock' | 'out_of_stock',
    };
  }
}
