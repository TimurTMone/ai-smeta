import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex">
      <AppSidebar locale={locale} role={session.role} dict={dict} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar locale={locale} email={session.email} dict={dict} />
        <main className="flex-1 p-8 bg-[var(--muted)] min-w-0">{children}</main>
      </div>
    </div>
  );
}
