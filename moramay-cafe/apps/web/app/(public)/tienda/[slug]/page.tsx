import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getMockProductBySlug, getMockProducts } from "@/lib/mock-products";

interface ProductPageProps {
  params: { slug: string };
}

// TODO(backend): replace with dynamic fetch from GET /products/:id (T-011)
// once the catalog API exists; keep generateStaticParams or switch to SSR as needed.
export function generateStaticParams() {
  return getMockProducts().map((product) => ({ slug: product.slug }));
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getMockProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
