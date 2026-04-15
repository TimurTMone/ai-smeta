import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export default async function AdminLayout({
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
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }
  if (session.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar locale={locale} dict={dict} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar locale={locale} email={session.email} dict={dict} />
        <main className="flex-1 p-8 bg-slate-50 min-w-0">{children}</main>
      </div>
    </div>
  );
}
