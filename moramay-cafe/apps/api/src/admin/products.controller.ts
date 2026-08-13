import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AdminOnly } from './decorators/admin-auth.decorator';
import { AdminProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

/**
 * T-051: admin CRUD for products and their variants.
 */
@Controller('admin/products')
@AdminOnly()
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Get()
  list() {
    return this.productsService.listProducts();
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivateProduct(id);
  }

  @Patch('variants/:variantId')
  updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateProductVariantDto) {
    return this.productsService.updateVariant(variantId, dto);
  }
}
