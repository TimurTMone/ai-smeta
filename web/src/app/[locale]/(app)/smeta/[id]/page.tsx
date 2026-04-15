import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SmetaEditorClient } from "@/components/smeta/smeta-editor-client";

export default async function SmetaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <SmetaEditorClient
      projectId={id}
      locale={locale}
      dict={{
        add_line: dict.app.smeta.add_line,
        import_voice: dict.app.smeta.import_voice,
        total: dict.app.smeta.total,
        export_xlsx: dict.app.smeta.export_xlsx,
        export_pdf: dict.app.smeta.export_pdf,
        loading: dict.common.loading,
      }}
    />
  );
}
