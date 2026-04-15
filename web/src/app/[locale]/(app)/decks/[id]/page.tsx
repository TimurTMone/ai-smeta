import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { DeckEditorClient } from "@/components/decks/deck-editor-client";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <DeckEditorClient
      projectId={id}
      locale={locale}
      dict={{
        upload: dict.app.deck.upload,
        preview: dict.app.deck.preview,
        download_pdf: dict.app.deck.download_pdf,
        loading: dict.common.loading,
        sections: dict.app.deck.sections,
      }}
    />
  );
}
