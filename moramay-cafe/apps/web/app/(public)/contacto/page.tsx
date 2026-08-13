"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);

  // TODO(backend): wire this form to a real notifications endpoint (Resend)
  // once apps/api exposes it. For now it only simulates a submission.
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container max-w-xl py-10">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="mt-2 text-muted-foreground">
        ¿Tienes preguntas sobre nuestros productos o un pedido? Escríbenos.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-6 text-center">
          <p className="font-medium">¡Gracias por escribirnos!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Te responderemos pronto a tu correo electrónico.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-sm font-medium">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="lg">
            Enviar mensaje
          </Button>
        </form>
      )}
    </div>
  );
}
