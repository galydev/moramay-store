export const metadata = {
  title: "Nosotros | Moramay Café",
};

export default function NosotrosPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Nosotros</h1>
      <p className="mt-4 text-muted-foreground">
        Moramay Café nace de la pasión por el café de especialidad colombiano.
        Trabajamos directamente con fincas del Eje Cafetero y Nariño para llevar
        a tu taza un café con historia clara: quién lo cultivó, cuándo se tostó
        y en qué lote llegó a ti.
      </p>
      <p className="mt-4 text-muted-foreground">
        Creemos que la trazabilidad no es un lujo, sino un derecho de quien
        disfruta cada taza. Por eso cada producto muestra su origen, fecha de
        tueste y número de lote — sin intermediarios, sin letra pequeña.
      </p>
    </div>
  );
}
