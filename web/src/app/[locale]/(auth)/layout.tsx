import Link from "next/link";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[var(--muted)]">
      <header className="h-16 flex items-center justify-center">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">
            ◆
          </span>
          Ai-Smeta
        </Link>
      </header>
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        {children}
      </div>
    </div>
  );
}
