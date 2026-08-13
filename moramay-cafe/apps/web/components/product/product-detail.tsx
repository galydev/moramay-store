"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import type { Product, ProductVariant } from "@/lib/types";

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function variantLabel(variant: ProductVariant): string {
  const parts: string[] = [];
  if (variant.weight) parts.push(variant.weight);
  if (variant.grindType) {
    const grindLabels: Record<string, string> = {
      whole_bean: "Grano entero",
      fine: "Molienda fina",
      medium: "Molienda media",
      coarse: "Molienda gruesa",
    };
    parts.push(grindLabels[variant.grindType] ?? variant.grindType);
  }
  if (variant.attributeLabel) parts.push(variant.attributeLabel);
  return parts.length > 0 ? parts.join(" · ") : "Presentación única";
}

interface ProductDetailProps {
  product: Product;
}

/** Full product detail view with traceability info and add-to-cart (T-013). */
export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ""
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId),
    [product.variants, selectedVariantId]
  );

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stockStatus === "out_of_stock") return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantLabel: variantLabel(selectedVariant),
      unitPrice: selectedVariant.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container grid gap-10 py-10 md:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{product.description}</p>

        {product.features.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.features.map((feature) => (
              <li key={feature}>
                <Badge variant="secondary">{feature}</Badge>
              </li>
            ))}
          </ul>
        )}

        {(product.origin || product.roastDate || product.lotNumber) && (
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-3">
            {product.origin && (
              <div>
                <p className="font-semibold text-foreground">Origen</p>
                <p className="text-muted-foreground">{product.origin}</p>
              </div>
            )}
            {product.roastDate && (
              <div>
                <p className="font-semibold text-foreground">Fecha de tueste</p>
                <p className="text-muted-foreground">{product.roastDate}</p>
              </div>
            )}
            {product.lotNumber && (
              <div>
                <p className="font-semibold text-foreground">Lote</p>
                <p className="text-muted-foreground">{product.lotNumber}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Presentación</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={variant.stockStatus === "out_of_stock"}
                className={`rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  selectedVariantId === variant.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {variantLabel(variant)}
                {variant.stockStatus === "out_of_stock" && " (Agotado)"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="text-2xl font-bold text-primary">
            {selectedVariant ? formatCOP(selectedVariant.price) : "—"}
          </span>
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stockStatus === "out_of_stock"}
          >
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </div>
  );
}
