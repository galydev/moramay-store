import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Checkout stub. Full checkout flow (T-026) is out of scope for this task —
 * this page exists so the cart → checkout → login navigation is complete.
 * TODO(T-026): build cart review, city selection, guest/login choice, and
 * Wompi payment widget once orders/payments backend modules exist.
 */
export default function CheckoutPage() {
  return (
    <div className="container flex flex-col items-center gap-6 py-20 text-center">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="max-w-md text-muted-foreground">
        Para finalizar tu compra, continúa como invitado o inicia sesión en tu
        cuenta. Esta pantalla se completará junto con la integración de pagos
        (T-023, T-026).
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Iniciar sesión
        </Link>
        <Link href="/registro" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
