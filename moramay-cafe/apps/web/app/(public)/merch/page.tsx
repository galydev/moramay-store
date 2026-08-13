import { ProductGrid } from "@/components/product/product-grid";
import { getMockProducts } from "@/lib/mock-products";

export const metadata = {
  title: "Merch | Moramay Café",
};

export default function MerchPage() {
  const products = getMockProducts("merch");

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Merch</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Accesorios y merchandising para preparar y disfrutar tu café Moramay.
      </p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
