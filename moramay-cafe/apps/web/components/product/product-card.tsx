import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/types";

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ProductCardProps {
  product: Product;
}

/** Card summary of a product for grid listings (T-013). */
export function ProductCard({ product }: ProductCardProps) {
  const isFullyOutOfStock = product.variants.every(
    (variant) => variant.stockStatus === "out_of_stock"
  );

  return (
    <Link href={`/tienda/${product.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-secondary">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {isFullyOutOfStock && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              Agotado
            </Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          {product.origin && (
            <p className="text-xs text-muted-foreground">{product.origin}</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <p className="mt-3 font-semibold text-primary">
            {formatCOP(product.basePrice)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
