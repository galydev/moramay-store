import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moramay Café | Tienda Online",
  description:
    "Café de especialidad colombiano, merchandising y suscripciones mensuales con trazabilidad completa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
