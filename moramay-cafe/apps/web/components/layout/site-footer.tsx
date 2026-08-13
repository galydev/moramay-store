import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container flex flex-col gap-4 py-10 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">Moramay Café</p>
          <p className="mt-1 max-w-xs">
            Café de especialidad colombiano, cultivado, tostado y entregado con
            trazabilidad completa.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Explorar</span>
          <Link href="/tienda" className="hover:text-primary">
            Tienda
          </Link>
          <Link href="/merch" className="hover:text-primary">
            Merch
          </Link>
          <Link href="/nosotros" className="hover:text-primary">
            Nosotros
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Ayuda</span>
          <Link href="/contacto" className="hover:text-primary">
            Contacto
          </Link>
          <Link href="/cuenta" className="hover:text-primary">
            Mi cuenta
          </Link>
        </div>

        <p className="text-xs">
          © {new Date().getFullYear()} Moramay Café. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
