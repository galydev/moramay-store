import { ProductGrid } from "@/components/product/product-grid";
import { getMockProducts } from "@/lib/mock-products";

export const metadata = {
  title: "Tienda | Moramay Café",
};

export default function TiendaPage() {
  const products = getMockProducts("coffee");

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Tienda</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Café de especialidad en distintas presentaciones. Cada bolsa muestra su
        origen, fecha de tueste y número de lote.
      </p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
