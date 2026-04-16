"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Smeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/input";
import { Download, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Dict = {
  add_line: string;
  import_voice: string;
  total: string;
  export_xlsx: string;
  export_pdf: string;
  loading: string;
};

export function SmetaEditorClient({
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
  const [smeta, setSmeta] = React.useState<Smeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  void projectId;

  async function handleGenerate() {
    if (!description.trim() || description.trim().length < 10) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-smeta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description, projectId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Generation failed");
        return;
      }
      setSmeta(json.smeta as Smeta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>
                {locale === "en" ? "Describe your project" : locale === "ky" ? "Долбооруңузду сүрөттөңүз" : "Опишите ваш объект"}
              </CardTitle>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {locale === "en"
                  ? "Describe the construction project — type, area, location, materials, floors. More detail = more accurate estimate."
                  : locale === "ky"
                    ? "Курулуш объектисин сүрөттөңүз — түрү, аянты, жери, материалдары, кабаттары. Маалымат толук болсо, смета так болот."
                    : "Опишите объект — тип, площадь, локацию, материалы, этажность. Чем подробнее, тем точнее смета."}
              </p>
            </div>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              locale === "en"
                ? "e.g. Two-story house, 120 m², Bishkek, brick walls, strip foundation, metal tile roof, PVC windows, gas heating"
                : locale === "ky"
                  ? "мис. Эки кабат үй, 120 м², Бишкек, кирпич, лента фундамент, металлочерепица, ПВХ терезелер, газ жылытуу"
                  : "напр. Двухэтажный дом, 120 м², Бишкек, кирпич, фундамент ленточный, кровля металлочерепица, окна ПВХ, отопление газ"
            }
            className="min-h-[120px]"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-[var(--muted-foreground)]">
              {description.length > 0 && `${description.length} ${locale === "en" ? "chars" : "симв."}`}
            </div>
            <Button onClick={handleGenerate} disabled={generating || description.trim().length < 10} className="shadow-lg shadow-sky-500/20">
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{locale === "en" ? "Generating…" : "Генерация…"}</>
              ) : (
                <><Sparkles className="w-4 h-4" />{locale === "en" ? "Generate Smeta" : locale === "ky" ? "Смета түзүү" : "Сгенерировать смету"}</>
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

      {generating && !smeta && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {locale === "en" ? "Claude is calculating… 15-30 seconds." : "Claude рассчитывает смету… 15–30 секунд."}
            </p>
          </CardContent>
        </Card>
      )}

      {smeta && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{locale === "en" ? "Cost Estimate" : "Сметный расчёт"}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Badge variant="success">AI-generated</Badge>
                <span>{smeta.region} · {smeta.currency}</span>
              </div>
            </div>
            <Button variant="secondary" disabled title="Coming soon"><Download className="w-4 h-4" />{dict.export_xlsx}</Button>
          </div>

          {smeta.sections.map((section, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <h3 className="text-base font-bold mb-4">
                  {section.name.ru}
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">{section.name.en}</span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{locale === "en" ? "Description" : "Наименование"}</TableHead>
                      <TableHead>{locale === "en" ? "Unit" : "Ед."}</TableHead>
                      <TableHead className="text-right">{locale === "en" ? "Qty" : "Кол-во"}</TableHead>
                      <TableHead className="text-right">{locale === "en" ? "Rate" : "Цена"}</TableHead>
                      <TableHead className="text-right">{locale === "en" ? "Total" : "Сумма"}</TableHead>
                      <TableHead>{locale === "en" ? "Source" : "Источник"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description.ru}
                          <span className="block text-xs text-[var(--muted-foreground)]">{item.description.en}</span>
                        </TableCell>
                        <TableCell className="text-[var(--muted-foreground)]">{item.unit}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.rate.toLocaleString(locale)}</TableCell>
                        <TableCell className="text-right font-semibold text-[var(--accent)] tabular-nums">
                          {formatCurrency(item.total, smeta.currency, locale)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.source === "history" ? "success" : item.source === "market" ? "warning" : "danger"}>
                            {item.source}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          <Card className="border-[var(--accent)] border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-wider font-bold text-[var(--muted-foreground)]">{dict.total}</div>
                <div className="text-4xl font-extrabold text-[var(--accent)] tabular-nums">
                  {formatCurrency(smeta.total, smeta.currency, locale)}
                </div>
              </div>
            </CardContent>
          </Card>

          {(smeta.assumptions?.length > 0 || smeta.clarifying_questions?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {smeta.assumptions?.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <CardTitle className="text-sm mb-3">{locale === "en" ? "Assumptions" : "Допущения"}</CardTitle>
                    <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                      {smeta.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {smeta.clarifying_questions?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="pt-6">
                    <CardTitle className="text-sm mb-3 text-amber-800">{locale === "en" ? "Questions" : "Уточняющие вопросы"}</CardTitle>
                    <ul className="space-y-2 text-sm text-amber-900">
                      {smeta.clarifying_questions.map((q, i) => <li key={i}>❓ {q}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
