import type { Product } from "./types";

/**
 * TODO(backend): this is mock data standing in for GET /products and
 * GET /products/:id (T-010, T-011 in tasks.md). Replace `getMockProducts`
 * and `getMockProductBySlug` with real API calls once those endpoints exist.
 * Response shape should keep matching contracts/api-spec.json.
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    slug: "finca-la-esperanza",
    category: "coffee",
    name: "Finca La Esperanza",
    description:
      "Café de especialidad de notas florales y dulzura a panela, cultivado a 1,800 msnm en el Eje Cafetero.",
    features: ["Perfil floral y dulce", "Proceso lavado", "Puntaje SCA 86"],
    origin: "Finca La Esperanza, Salento, Quindío",
    roastDate: "2026-08-01",
    lotNumber: "LOT-2026-014",
    basePrice: 38000,
    imageUrl: "/images/coffee-la-esperanza.svg",
    variants: [
      {
        id: "var-001",
        productId: "prod-001",
        weight: "250g",
        grindType: "whole_bean",
        price: 38000,
        stockQuantity: 24,
        stockStatus: "in_stock",
      },
      {
        id: "var-002",
        productId: "prod-001",
        weight: "250g",
        grindType: "medium",
        price: 38000,
        stockQuantity: 12,
        stockStatus: "in_stock",
      },
      {
        id: "var-003",
        productId: "prod-001",
        weight: "340g",
        grindType: "whole_bean",
        price: 49000,
        stockQuantity: 0,
        stockStatus: "out_of_stock",
      },
    ],
  },
  {
    id: "prod-002",
    slug: "tostion-oscura-nariño",
    category: "coffee",
    name: "Tostión Oscura Nariño",
    description:
      "Cuerpo intenso y notas achocolatadas, ideal para espresso. Cultivado en las montañas de Nariño.",
    features: ["Cuerpo alto", "Notas a chocolate y nuez", "Ideal para espresso"],
    origin: "Vereda El Tabano, Nariño",
    roastDate: "2026-07-28",
    lotNumber: "LOT-2026-011",
    basePrice: 36000,
    imageUrl: "/images/coffee-narino.svg",
    variants: [
      {
        id: "var-004",
        productId: "prod-002",
        weight: "250g",
        grindType: "fine",
        price: 36000,
        stockQuantity: 30,
        stockStatus: "in_stock",
      },
      {
        id: "var-005",
        productId: "prod-002",
        weight: "340g",
        grindType: "coarse",
        price: 47000,
        stockQuantity: 8,
        stockStatus: "in_stock",
      },
    ],
  },
  {
    id: "prod-003",
    slug: "taza-ceramica-moramay",
    category: "merch",
    name: "Taza de Cerámica Moramay",
    description:
      "Taza artesanal de cerámica con el logo de Moramay Café, capacidad de 350ml.",
    features: ["Cerámica apta para microondas", "Capacidad 350ml", "Diseño exclusivo"],
    basePrice: 45000,
    imageUrl: "/images/merch-mug.svg",
    variants: [
      {
        id: "var-006",
        productId: "prod-003",
        attributeLabel: "Único",
        price: 45000,
        stockQuantity: 15,
        stockStatus: "in_stock",
      },
    ],
  },
  {
    id: "prod-004",
    slug: "prensa-francesa",
    category: "merch",
    name: "Prensa Francesa 600ml",
    description: "Prensa francesa de vidrio borosilicato y acero inoxidable, capacidad 600ml.",
    features: ["Vidrio borosilicato", "Filtro de acero inoxidable", "Capacidad 600ml"],
    basePrice: 89000,
    imageUrl: "/images/merch-french-press.svg",
    variants: [
      {
        id: "var-007",
        productId: "prod-004",
        attributeLabel: "Único",
        price: 89000,
        stockQuantity: 0,
        stockStatus: "out_of_stock",
      },
    ],
  },
];

export function getMockProducts(category?: "coffee" | "merch"): Product[] {
  if (!category) return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter((product) => product.category === category);
}

export function getMockProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.slug === slug);
}
