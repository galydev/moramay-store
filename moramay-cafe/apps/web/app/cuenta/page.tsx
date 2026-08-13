import Link from "next/link";

/**
 * Stub for "Mi cuenta" (T-033 builds the full profile/orders/subscriptions UI).
 * Exists here only so navigation from checkout/login flows resolves correctly.
 * TODO(T-033): build profile, order history, and billing management once
 * GET/PATCH /customers/me exists (T-031).
 */
export default function CuentaPage() {
  return (
    <div className="container flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <p className="max-w-md text-muted-foreground">
        Aquí podrás ver tu historial de pedidos, tus suscripciones y editar tu
        información personal. Esta sección se completará en T-033.
      </p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
