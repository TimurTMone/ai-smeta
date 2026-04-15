import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { NewProjectChooser } from "@/components/projects/new-project-chooser";

export default async function NewProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const { kind } = await searchParams;
  const initialKind = kind === "smeta" || kind === "deck" ? kind : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {dict.app.new_project.title}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {dict.app.new_project.subtitle}
        </p>
      </div>
      <NewProjectChooser
        locale={locale}
        initialKind={initialKind}
        dict={{
          smeta_title: dict.app.new_project.smeta_title,
          smeta_body: dict.app.new_project.smeta_body,
          deck_title: dict.app.new_project.deck_title,
          deck_body: dict.app.new_project.deck_body,
          name_label: dict.app.new_project.name_label,
          name_placeholder: dict.app.new_project.name_placeholder,
          create: dict.app.new_project.create,
          cancel: dict.common.cancel,
        }}
      />
    </div>
  );
}
