/**
 * Shared product types, mirroring the data model defined in
 * moramay-cafe/specs/001-tienda-online/data-model.md (products / product_variants).
 *
 * TODO(backend): replace with types generated from contracts/api-spec.json
 * once GET /products and GET /products/:id are implemented (T-010, T-011).
 */

export type ProductCategory = "coffee" | "merch";

export type GrindType = "whole_bean" | "fine" | "medium" | "coarse";

export type StockStatus = "in_stock" | "out_of_stock";

export interface ProductVariant {
  id: string;
  productId: string;
  /** Weight presentation, coffee only (e.g. "250g", "340g"). */
  weight?: "250g" | "340g";
  /** Grind type, coffee only. */
  grindType?: GrindType;
  /** Generic attribute label for merch (e.g. size, color). */
  attributeLabel?: string;
  price: number;
  stockQuantity: number;
  stockStatus: StockStatus;
}

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  name: string;
  description: string;
  features: string[];
  /** Traceability fields — coffee only. */
  origin?: string;
  roastDate?: string;
  lotNumber?: string;
  basePrice: number;
  imageUrl: string;
  variants: ProductVariant[];
}
