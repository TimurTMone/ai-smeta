"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { DeckData, Project } from "@/types/api";
import { getDeck, renderDeck, ingestDeckFiles, exportDeckPdf } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, RefreshCw, Eye } from "lucide-react";

type Dict = {
  upload: string;
  preview: string;
  download_pdf: string;
  loading: string;
  sections: Record<string, string>;
};

export function DeckEditorClient({
  projectId,
  locale,
  dict,
}: {
  projectId: string;
  locale: Locale;
  dict: Dict;
}) {
  const [loading, setLoading] = React.useState(true);
  const [project, setProject] = React.useState<Project | null>(null);
  const [deck, setDeck] = React.useState<DeckData | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [rendering, setRendering] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  void locale;

  React.useEffect(() => {
    let alive = true;
    getDeck(projectId)
      .then(({ project: p, data }) => {
        if (!alive) return;
        setProject(p);
        setDeck(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [projectId]);

  async function handleRender() {
    setRendering(true);
    try {
      const { preview_url } = await renderDeck(projectId);
      setPreviewUrl(preview_url + "?t=" + Date.now()); // cache-bust
    } finally {
      setRendering(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setRendering(true);
    try {
      await ingestDeckFiles(projectId, files);
      const { data } = await getDeck(projectId);
      setDeck(data);
      const { preview_url } = await renderDeck(projectId);
      setPreviewUrl(preview_url + "?t=" + Date.now());
    } finally {
      setRendering(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownload() {
    const { download_url } = await exportDeckPdf(projectId);
    window.open(download_url, "_blank");
  }

  if (loading || !deck || !project) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">{dict.loading}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {project.name}
          </h1>
          <div className="mt-1 text-sm text-[var(--muted-foreground)]">
            <Badge variant="outline">{project.status}</Badge>
            <span className="ml-2 text-xs">{deck.items.length} items · {deck.project_slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".docx,.pdf,.txt"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={rendering}
          >
            <Upload className="w-4 h-4" />
            {dict.upload}
          </Button>
          <Button
            variant="secondary"
            onClick={handleRender}
            disabled={rendering}
          >
            <RefreshCw className={rendering ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
            {dict.preview}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4" />
            {dict.download_pdf}
          </Button>
        </div>
      </div>

      {/* Two-column layout: form left, preview right */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: structured form (minimal v1 — read-only summary) */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3">{dict.sections.cover}</CardTitle>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                    RU
                  </div>
                  <div className="font-semibold">{deck.cover.title.ru}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                    EN
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    {deck.cover.title.en}
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)]">
                  <CardDescription>{deck.cover.subtitle.ru}</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          {deck.problem && (
            <Card>
              <CardContent className="pt-6">
                <CardTitle className="mb-3">{dict.sections.problem}</CardTitle>
                <div className="text-sm font-semibold">{deck.problem.title.ru}</div>
                <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                  {deck.problem.points.map((p, i) => (
                    <li key={i}>• {p.ru}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3">
                {dict.sections.items} ({deck.items.length})
              </CardTitle>
              <div className="space-y-2">
                {deck.items.map((item) => (
                  <div
                    key={item.slug}
                    className="p-3 rounded-[var(--radius-sm)] bg-[var(--muted)] border border-[var(--border)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm">{item.name.ru}</div>
                      <Badge variant="accent">{item.investment_usd}</Badge>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {item.concept_tag.en}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3">{dict.sections.financial}</CardTitle>
              <div className="text-2xl font-extrabold text-[var(--accent)]">
                {deck.financial_summary.total_investment}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">
                {deck.financial_summary.blended_payback}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3">{dict.sections.ask}</CardTitle>
              <div className="text-sm font-semibold">{deck.ask.headline.ru}</div>
            </CardContent>
          </Card>
        </div>

        {/* Right: preview iframe */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)] text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-semibold">{dict.preview}</span>
            </div>
            <div className="bg-slate-900 h-[70vh] flex items-center justify-center">
              <iframe
                src={previewUrl || "/demo-deck/presentation.html"}
                className="w-full h-full bg-slate-900 border-0"
                title="Deck preview"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
