import Link from "next/link";

/** Shared layout for auth screens (T-034): login and registration. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-bold text-primary">
        Moramay Café
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
