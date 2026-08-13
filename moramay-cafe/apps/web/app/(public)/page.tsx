import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { getMockProducts } from "@/lib/mock-products";

export default function HomePage() {
  const featuredCoffee = getMockProducts("coffee");

  return (
    <div>
      <section className="border-b border-border bg-secondary/40">
        <div className="container flex flex-col items-start gap-6 py-16 md:py-24">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Café de especialidad colombiano
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            De la finca a tu taza, con trazabilidad completa.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Descubre café tostado con origen, lote y fecha de tueste visibles en
            cada producto. Compra por única vez o suscríbete y recíbelo fresco
            cada mes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tienda" className={buttonVariants({ size: "lg" })}>
              Explorar tienda
            </Link>
            <Link
              href="/nosotros"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Conoce nuestra historia
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Nuestros cafés</h2>
            <p className="text-muted-foreground">
              Cada bolsa incluye origen, fecha de tueste y número de lote.
            </p>
          </div>
          <Link href="/tienda" className="text-sm font-medium text-primary hover:underline">
            Ver todo →
          </Link>
        </div>
        <ProductGrid products={featuredCoffee} />
      </section>
    </div>
  );
}
