"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">
          Explora la tienda y agrega tus productos favoritos.
        </p>
        <Link href="/tienda" className={buttonVariants({ size: "lg" })}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Carrito</h1>

      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 rounded-lg border border-border p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
              <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <Link href={`/tienda/${item.productSlug}`} className="font-medium hover:underline">
                {item.productName}
              </Link>
              <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
              <p className="mt-1 font-semibold text-primary">{formatCOP(item.unitPrice)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="h-8 w-8 rounded-md border border-border hover:bg-secondary"
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="h-8 w-8 rounded-md border border-border hover:bg-secondary"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-destructive hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-2 border-t border-border pt-6">
        <p className="text-lg">
          Subtotal: <span className="font-bold">{formatCOP(totalPrice)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          El costo de envío se calcula en el checkout según tu ciudad.
        </p>
        <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
