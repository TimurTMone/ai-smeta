"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { ProjectKind } from "@/types/api";
import { createProject } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Dict = {
  smeta_title: string;
  smeta_body: string;
  deck_title: string;
  deck_body: string;
  name_label: string;
  name_placeholder: string;
  create: string;
  cancel: string;
};

export function NewProjectChooser({
  locale,
  initialKind,
  dict,
}: {
  locale: Locale;
  initialKind: ProjectKind | null;
  dict: Dict;
}) {
  const router = useRouter();
  const [kind, setKind] = React.useState<ProjectKind | null>(initialKind);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleCreate() {
    if (!kind || !name.trim()) return;
    setSaving(true);
    try {
      const project = await createProject({ kind, name: name.trim() });
      const href =
        project.kind === "deck"
          ? `/${locale}/decks/${project.id}`
          : `/${locale}/smeta/${project.id}`;
      router.push(href);
    } catch {
      setSaving(false);
    }
  }

  const options: {
    key: ProjectKind;
    title: string;
    body: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "smeta",
      title: dict.smeta_title,
      body: dict.smeta_body,
      icon: <FileSpreadsheet className="w-6 h-6" />,
    },
    {
      key: "deck",
      title: dict.deck_title,
      body: dict.deck_body,
      icon: <FileText className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setKind(opt.key)}
            className="text-left"
          >
            <Card
              className={cn(
                "h-full transition-all cursor-pointer",
                kind === opt.key
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-[var(--shadow-md)]"
                  : "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]",
              )}
            >
              <CardContent className="pt-6">
                <div
                  className={cn(
                    "w-14 h-14 rounded-[var(--radius)] grid place-items-center mb-4",
                    kind === opt.key
                      ? "bg-[var(--accent)] text-white"
                      : "bg-sky-50 text-[var(--accent)]",
                  )}
                >
                  {opt.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{opt.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {opt.body}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {kind && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">{dict.name_label}</Label>
                <Input
                  id="project-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={dict.name_placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Link href={`/${locale}/projects`}>
                  <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4" />
                    {dict.cancel}
                  </Button>
                </Link>
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim() || saving}
                >
                  {saving ? "…" : dict.create}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
