import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { UsersTableClient } from "@/components/admin/users-table-client";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {dict.admin.users.title}
      </h1>
      <UsersTableClient
        dict={{
          col_email: dict.admin.users.col_email,
          col_role: dict.admin.users.col_role,
          col_org: dict.admin.users.col_org,
          col_last: dict.admin.users.col_last,
          col_actions: dict.admin.users.col_actions,
          action_impersonate: dict.admin.users.action_impersonate,
          action_deactivate: dict.admin.users.action_deactivate,
          loading: dict.common.loading,
        }}
      />
    </div>
  );
}
