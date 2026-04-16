"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { DeckData } from "@/types/api";
import { getDeck } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Loader2, Sparkles, Eye, AlertCircle, FileText, ArrowRight } from "lucide-react";

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
  const [description, setDescription] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [deck, setDeck] = React.useState<DeckData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showExisting, setShowExisting] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState("/demo-deck/presentation.html");
  const [rendering, setRendering] = React.useState(false);

  async function renderDeckPreview(deckData: DeckData) {
    setRendering(true);
    try {
      const res = await fetch("/api/deck/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck: deckData }),
      });
      if (!res.ok) return;
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      // Fall back to demo deck
    } finally {
      setRendering(false);
    }
  }

  function handleDownloadDeck() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `presentation-${Date.now()}.html`;
    a.click();
  }

  // Try loading existing deck data from mock/API
  React.useEffect(() => {
    getDeck(projectId)
      .then(({ data }) => {
        if (data && data.cover) {
          setDeck(data);
          setShowExisting(true);
        }
      })
      .catch(() => {});
  }, [projectId]);

  async function handleGenerate() {
    if (!description.trim() || description.trim().length < 10) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description, projectId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Generation failed");
        return;
      }
      const generatedDeck = json.deck as DeckData;
      setDeck(generatedDeck);
      setShowExisting(false);
      // Render the deck as real HTML slides
      renderDeckPreview(generatedDeck);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Input section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white grid place-items-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>
                {locale === "en" ? "Describe your investment project" : locale === "ky" ? "Инвестициялык долбооруңузду сүрөттөңүз" : "Опишите инвестиционный проект"}
              </CardTitle>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {locale === "en"
                  ? "Describe the project — location, type, budget, timeline, target investors. Claude will structure it into a bilingual presentation."
                  : locale === "ky"
                    ? "Долбоорду сүрөттөңүз — жери, түрү, бюджети, мөөнөтү. Claude аны эки тилдүү презентацияга түзөт."
                    : "Опишите проект — локация, тип, бюджет, сроки, целевые инвесторы. Claude структурирует данные в двуязычную презентацию."}
              </p>
            </div>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              locale === "en"
                ? "e.g. Tourist resort on Lake Issyk-Kul, 6 ports along the shore. Total investment $25-35M. PPP model with the government. Each port has unique positioning: yacht club, kitesurfing center, eco-lodge, logistics hub..."
                : locale === "ky"
                  ? "мис. Ысык-Көл боюндагы туристик курорт, жээк боюнча 6 порт. Жалпы инвестиция $25-35M. Өкмөт менен МЖП модели..."
                  : "напр. Туристический курорт на озере Иссык-Куль, 6 портов вдоль побережья. Общий объём инвестиций $25-35 млн. Модель ГЧП с правительством. Каждый порт с уникальным позиционированием: яхт-клуб, кайтсёрфинг-центр, эко-лодж, логистический хаб..."
            }
            className="min-h-[140px]"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-[var(--muted-foreground)]">
              {description.length > 0 && `${description.length} ${locale === "en" ? "chars" : "симв."}`}
            </div>
            <Button onClick={handleGenerate} disabled={generating || description.trim().length < 10} className="shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{locale === "en" ? "Generating deck…" : "Генерация презентации…"}</>
              ) : (
                <><Sparkles className="w-4 h-4" />{locale === "en" ? "Generate Presentation" : locale === "ky" ? "Презентация түзүү" : "Сгенерировать презентацию"}</>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--danger)]">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
        </CardContent>
      </Card>

      {generating && !deck && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {locale === "en" ? "Claude is structuring your presentation… 20-40 seconds." : "Claude структурирует презентацию… 20–40 секунд."}
            </p>
          </CardContent>
        </Card>
      )}

      {deck && (
        <>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: structured content summary */}
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {showExisting && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
                <Badge variant="outline">{locale === "en" ? "Loaded from saved data" : "Загружено из сохранённых данных"}</Badge>
              </div>
            )}

            {/* Cover */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="accent">{dict.sections.cover}</Badge>
                </div>
                <h3 className="text-lg font-bold">{deck.cover.title.ru}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{deck.cover.title.en}</p>
                <div className="mt-3 text-sm text-[var(--muted-foreground)] italic">
                  {deck.cover.subtitle.ru}
                </div>
              </CardContent>
            </Card>

            {/* Problem */}
            {deck.problem && (
              <Card>
                <CardContent className="pt-6">
                  <Badge variant="accent" className="mb-3">{dict.sections.problem}</Badge>
                  <h3 className="font-bold">{deck.problem.title.ru}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                    {deck.problem.points.map((p, i) => <li key={i}>• {p.ru}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Vision */}
            <Card>
              <CardContent className="pt-6">
                <Badge variant="accent" className="mb-3">{dict.sections.vision}</Badge>
                <h3 className="font-bold">{deck.vision.title.ru}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{deck.vision.body.ru}</p>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="accent">{dict.sections.items}</Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{deck.items.length} items</span>
                </div>
                <div className="space-y-3">
                  {deck.items.map((item) => (
                    <div key={item.slug} className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">{item.name.ru}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{item.concept_tag.en}</div>
                        </div>
                        <Badge variant="accent">{item.investment_usd}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-foreground)] italic">{item.tagline.ru}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardContent className="pt-6">
                <Badge variant="accent" className="mb-3">{dict.sections.financial}</Badge>
                <div className="text-3xl font-extrabold text-[var(--accent)]">{deck.financial_summary.total_investment}</div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">{deck.financial_summary.blended_payback}</div>
              </CardContent>
            </Card>

            {/* Ask */}
            <Card>
              <CardContent className="pt-6">
                <Badge variant="accent" className="mb-3">{dict.sections.ask}</Badge>
                <h3 className="font-bold">{deck.ask.headline.ru}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{deck.ask.headline.en}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: live preview iframe */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)] text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold">{dict.preview}</span>
                <span className="ml-auto text-[var(--muted-foreground)]">Karakol demo · 17 slides</span>
              </div>
              <div className="bg-slate-900 aspect-video relative">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Deck preview"
                />
              </div>
              <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--muted)]/50 flex items-center justify-between">
                <CardDescription>
                  {locale === "en" ? "Preview shows the Karakol reference deck" : "Превью показывает референсную презентацию Каракол"}
                </CardDescription>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-3.5 h-3.5" />
                    {locale === "en" ? "Full screen" : "Полный экран"}
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Feedback card */}
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white grid place-items-center shrink-0 shadow-lg shadow-violet-500/25 text-xl">
                💬
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-violet-900">
                  {locale === "en" ? "How does this look?" : locale === "ky" ? "Кандай көрүнөт?" : "Как вам результат?"}
                </h3>
                <p className="mt-1 text-sm text-violet-800">
                  {locale === "en"
                    ? "We're in closed beta. Your feedback shapes the product. Message us on Telegram — what worked, what didn't, what's missing."
                    : locale === "ky"
                      ? "Жабык бетадабыз. Пикириңиз продуктту жакшыртат. Telegramга жазыңыз."
                      : "Мы в закрытой бете. Ваш отзыв формирует продукт. Напишите в Telegram — что получилось, что нет, чего не хватает."}
                </p>
                <a
                  href="https://t.me/+996999955000"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#229ED9] text-white text-sm font-semibold hover:bg-[#1a8abf] transition-colors shadow-lg shadow-[#229ED9]/25"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  {locale === "en" ? "Message on Telegram" : locale === "ky" ? "Telegramга жазуу" : "Написать в Telegram"}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
