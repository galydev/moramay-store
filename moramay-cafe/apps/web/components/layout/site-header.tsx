"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tienda", label: "Tienda" },
  { href: "/merch", label: "Merch" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  // Avoid hydration mismatch: cart count only reflects localStorage after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary">
          Moramay Café
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "container flex flex-col gap-1 overflow-hidden border-t border-border pb-3 transition-all md:hidden",
          menuOpen ? "max-h-64 pt-3" : "max-h-0 pt-0"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
