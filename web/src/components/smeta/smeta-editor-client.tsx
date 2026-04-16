"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Smeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Sparkles, AlertCircle, ArrowRight, Download, CheckCircle2, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Dict = { add_line: string; import_voice: string; total: string; export_xlsx: string; export_pdf: string; loading: string };
type Question = { id: string; category: string; question_ru: string; question_en: string; options?: string[]; why: string };
type Step = "describe" | "questions" | "generating" | "result";

export function SmetaEditorClient({ projectId, locale, dict }: { projectId: string; locale: Locale; dict: Dict }) {
  const [step, setStep] = React.useState<Step>("describe");
  const [description, setDescription] = React.useState("");
  const [analysis, setAnalysis] = React.useState("");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [smeta, setSmeta] = React.useState<Smeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  void projectId;

  const t = (ru: string, en: string, ky?: string) => locale === "en" ? en : locale === "ky" ? (ky ?? ru) : ru;

  async function handleAskQuestions() {
    if (!description.trim() || description.trim().length < 10) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/smeta-questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: description }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Failed"); return; }
      setAnalysis(json.analysis ?? ""); setQuestions(json.questions ?? []);
      const init: Record<string, string> = {}; for (const q of json.questions ?? []) init[q.id] = "";
      setAnswers(init); setStep("questions");
    } catch (e) { setError(e instanceof Error ? e.message : "Network error"); } finally { setLoading(false); }
  }

  async function handleGenerate() {
    setStep("generating"); setError(null);
    try {
      const answersMap: Record<string, string> = {};
      for (const q of questions) { const qText = locale === "en" ? q.question_en : q.question_ru; if (answers[q.id]?.trim()) answersMap[qText] = answers[q.id].trim(); }
      const res = await fetch("/api/ai/generate-smeta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: description, answers: answersMap, projectId }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Failed"); setStep("questions"); return; }
      setSmeta(json.smeta as Smeta); setStep("result");
    } catch (e) { setError(e instanceof Error ? e.message : "Network error"); setStep("questions"); }
  }

  const answeredCount = Object.values(answers).filter(v => v.trim().length > 0).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {(["describe", "questions", "result"] as const).map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              step === s || (step === "generating" && s === "result") ? "bg-[var(--accent)] text-white"
              : (smeta && s !== "result") || (questions.length > 0 && s === "describe") ? "bg-emerald-100 text-emerald-700"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}>
              {i + 1}. {s === "describe" ? t("Описание", "Description") : s === "questions" ? t("Уточнение", "Details") : t("Смета", "Estimate")}
            </div>
            {i < 2 && <div className="h-px flex-1 bg-[var(--border)]" />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1 */}
      {step === "describe" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center shrink-0 shadow-lg shadow-sky-500/25"><Sparkles className="w-5 h-5" /></div>
              <div>
                <CardTitle>{t("Опишите ваш объект", "Describe your project")}</CardTitle>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("Что строите, где, какие материалы? AI задаст уточняющие вопросы перед расчётом.", "What are you building, where, what materials? AI will ask follow-up questions before calculating.")}</p>
              </div>
            </div>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder={t("напр. Двухэтажный жилой дом, 150 м², Бишкек, газоблок, ленточный фундамент, металлочерепица, 4 спальни, газовое отопление", "e.g. Two-story house, 150 m², Bishkek, gas block, strip foundation, metal tile roof, 4 bedrooms, gas heating")}
              className="min-h-[140px]" />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">{description.length > 0 && `${description.length} ${t("симв.", "chars")}`}</span>
              <Button onClick={handleAskQuestions} disabled={loading || description.trim().length < 10} className="shadow-lg shadow-sky-500/20">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{t("Анализ…", "Analyzing…")}</> : <><ArrowRight className="w-4 h-4" />{t("Далее — уточнить детали", "Next — clarify details")}</>}
              </Button>
            </div>
            {error && <div className="mt-4 flex items-center gap-2 text-sm text-[var(--danger)]"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          </CardContent>
        </Card>
      )}

      {/* STEP 2 */}
      {step === "questions" && (
        <>
          {analysis && (
            <Card className="border-sky-200 bg-sky-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div><div className="font-semibold text-sky-900">{t("Анализ описания", "Description analysis")}</div><p className="text-sky-800 mt-1">{analysis}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white grid place-items-center shrink-0 shadow-lg shadow-amber-500/25"><MessageSquare className="w-5 h-5" /></div>
                <div>
                  <CardTitle>{t("Уточняющие вопросы", "Follow-up questions")}</CardTitle>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t(`AI задал ${questions.length} вопросов. Ответьте на максимум — чем больше деталей, тем точнее смета.`, `AI generated ${questions.length} questions. Answer as many as you can for accuracy.`)}</p>
                </div>
              </div>
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 grid place-items-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{locale === "en" ? q.question_en : q.question_ru}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-0.5 italic">{q.why}</div>
                        <Badge variant="outline" className="mt-1 text-[10px]">{q.category}</Badge>
                        <div className="mt-3">
                          {q.options && q.options.length > 0 ? (
                            <Select value={answers[q.id] ?? ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}>
                              <option value="">{t("— Выберите —", "— Select —")}</option>
                              {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </Select>
                          ) : (
                            <Input value={answers[q.id] ?? ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={t("Ваш ответ", "Your answer")} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setStep("describe")}>{t("← Назад", "← Back")}</Button>
                  <span className="text-xs text-[var(--muted-foreground)]">{answeredCount}/{questions.length} {t("отвечено", "answered")}</span>
                </div>
                <Button onClick={handleGenerate} disabled={answeredCount === 0} className="shadow-lg shadow-sky-500/20">
                  <Sparkles className="w-4 h-4" />{t("Рассчитать смету", "Calculate estimate")}
                </Button>
              </div>
              {error && <div className="mt-4 flex items-center gap-2 text-sm text-[var(--danger)]"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
            </CardContent>
          </Card>
        </>
      )}

      {/* STEP 3: Generating */}
      {step === "generating" && (
        <Card><CardContent className="pt-16 pb-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)] mx-auto mb-6" />
          <h3 className="text-lg font-bold mb-2">{t("Claude рассчитывает смету", "Claude is calculating the estimate")}</h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">{t("Используя описание + ваши ответы. 20–40 секунд.", "Using your description + answers. 20-40 seconds.")}</p>
        </CardContent></Card>
      )}

      {/* STEP 4: Result */}
      {step === "result" && smeta && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{t("Сметный расчёт", "Cost Estimate")}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Badge variant="success">AI-generated</Badge><span>{smeta.region} · {smeta.currency}</span><span>·</span><span>{answeredCount} {t("ответов учтено", "answers used")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => { setStep("describe"); setSmeta(null); }}>{t("Новый расчёт", "New estimate")}</Button>
              <Button variant="secondary" onClick={async () => {
                const res = await fetch("/api/smeta/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ smeta }) });
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `smeta-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
              }}><Download className="w-4 h-4" />{dict.export_xlsx}</Button>
            </div>
          </div>
          {/* Cost per m² headline (if available) */}
          {(smeta as Record<string, unknown>).cost_per_sqm && (
            <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-sky-900">{t("Стоимость за м²", "Cost per m²")}</div>
                    <div className="text-xs text-sky-700 mt-0.5">
                      {(smeta as Record<string, unknown>).building_area_sqm ? `${String((smeta as Record<string, unknown>).building_area_sqm)} м² · ` : ""}
                      {(smeta as Record<string, unknown>).quality_tier ? <Badge variant="accent" className="mr-1">{String((smeta as Record<string, unknown>).quality_tier)}</Badge> : null}
                      {smeta.region}
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-sky-700 tabular-nums">
                    {formatCurrency(Number((smeta as Record<string, unknown>).cost_per_sqm), smeta.currency, locale)}/м²
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Line item sections with material/labor/equipment columns */}
          {smeta.sections.map((section, i) => (
            <Card key={i}><CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">{section.name.ru}<span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">{section.name.en}</span></h3>
                {(section as Record<string, unknown>).section_total != null && <span className="text-sm font-semibold text-[var(--accent)] tabular-nums">{formatCurrency(Number((section as Record<string, unknown>).section_total), smeta.currency, locale)}</span>}
              </div>
              <div className="overflow-x-auto">
              <Table><TableHeader><TableRow>
                <TableHead>{t("Наименование", "Description")}</TableHead>
                <TableHead>{t("Ед.", "Unit")}</TableHead>
                <TableHead className="text-right">{t("Кол-во", "Qty")}</TableHead>
                <TableHead className="text-right">{t("Мат.", "Mat.")}</TableHead>
                <TableHead className="text-right">{t("Работа", "Labor")}</TableHead>
                <TableHead className="text-right">{t("Мех.", "Equip.")}</TableHead>
                <TableHead className="text-right">{t("Расц.", "Rate")}</TableHead>
                <TableHead className="text-right">{t("Сумма", "Total")}</TableHead>
                <TableHead>{t("Ист.", "Src")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>{section.items.map(item => {
                const li = item as Record<string, unknown>;
                return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs">
                    {item.description.ru}
                    {li.norm_code ? <span className="block text-[10px] text-violet-600 font-mono">{String(li.norm_code)}</span> : null}
                  </TableCell>
                  <TableCell className="text-[var(--muted-foreground)] text-xs">{item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{item.qty}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-emerald-700">{li.material_cost != null ? Number(li.material_cost).toLocaleString(locale) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-blue-700">{li.labor_cost != null ? Number(li.labor_cost).toLocaleString(locale) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-amber-700">{li.equipment_cost != null ? Number(li.equipment_cost).toLocaleString(locale) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{item.rate.toLocaleString(locale)}</TableCell>
                  <TableCell className="text-right font-semibold text-[var(--accent)] tabular-nums text-xs">{formatCurrency(item.total, smeta.currency, locale)}</TableCell>
                  <TableCell><Badge variant={item.source === "history" || item.source === "ter" || item.source === "fer" || item.source === "gesn" ? "success" : item.source === "market" ? "warning" : "danger"} className="text-[10px]">{item.source}</Badge></TableCell>
                </TableRow>
                );
              })}</TableBody></Table>
              </div>
            </CardContent></Card>
          ))}

          {/* Summary by cost category */}
          {(smeta as Record<string, unknown>).summary && (
            <Card><CardContent className="pt-6">
              <CardTitle className="text-sm mb-4">{t("Сводка по категориям затрат", "Cost breakdown by category")}</CardTitle>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: t("Материалы", "Materials"), value: ((smeta as Record<string, unknown>).summary as Record<string, number>)?.materials_total, color: "emerald" },
                  { label: t("Работа", "Labor"), value: ((smeta as Record<string, unknown>).summary as Record<string, number>)?.labor_total, color: "blue" },
                  { label: t("Механизмы", "Equipment"), value: ((smeta as Record<string, unknown>).summary as Record<string, number>)?.equipment_total, color: "amber" },
                  { label: t("Потери", "Waste"), value: ((smeta as Record<string, unknown>).summary as Record<string, number>)?.waste_total, color: "red" },
                ].map((cat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                    <div className={`text-lg font-extrabold tabular-nums text-${cat.color}-700`}>
                      {cat.value ? formatCurrency(cat.value, smeta.currency, locale) : "—"}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] font-semibold mt-1">{cat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          )}

          {/* Markups */}
          {(smeta as Record<string, unknown>).markups && (
            <Card><CardContent className="pt-6">
              <CardTitle className="text-sm mb-4">{t("Накладные, прибыль, непредвиденные", "Overhead, profit, contingency")}</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-sm">{t("Прямые затраты", "Direct cost")}</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(Number((smeta as Record<string, unknown>).direct_cost) || smeta.total, smeta.currency, locale)}</span>
                </div>
                {[
                  { label: t("Накладные расходы", "Overhead"), pct: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.overhead_pct, amount: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.overhead_amount },
                  { label: t("Сметная прибыль", "Estimated profit"), pct: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.profit_pct, amount: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.profit_amount },
                  { label: t("Непредвиденные", "Contingency"), pct: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.contingency_pct, amount: ((smeta as Record<string, unknown>).markups as Record<string, number>)?.contingency_amount },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                    <span className="text-sm">{row.label} <span className="text-[var(--muted-foreground)]">({row.pct ? `${(row.pct * 100).toFixed(0)}%` : "—"})</span></span>
                    <span className="font-semibold tabular-nums">{row.amount ? formatCurrency(row.amount, smeta.currency, locale) : "—"}</span>
                  </div>
                ))}
                {((smeta as Record<string, unknown>).markups as Record<string, unknown>)?.regional_note ? (
                  <div className="text-xs text-[var(--muted-foreground)] italic pt-1">
                    {t("Региональный коэффициент", "Regional coefficient")}: {String(((smeta as Record<string, unknown>).markups as Record<string, unknown>).regional_note)}
                  </div>
                ) : null}
              </div>
            </CardContent></Card>
          )}

          {/* GRAND TOTAL */}
          <Card className="border-[var(--accent)] border-2"><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-wider font-bold text-[var(--muted-foreground)]">{t("ИТОГО С НАКЛАДНЫМИ", "TOTAL WITH MARKUPS")}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{t("включая накладные, прибыль, непредвиденные", "incl. overhead, profit, contingency")}</div>
              </div>
              <div className="text-4xl font-extrabold text-[var(--accent)] tabular-nums">
                {formatCurrency((smeta as Record<string, unknown>).total_with_markups ? Number((smeta as Record<string, unknown>).total_with_markups) : smeta.total, smeta.currency, locale)}
              </div>
            </div>
          </CardContent></Card>
          {(smeta.assumptions?.length > 0 || smeta.clarifying_questions?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {smeta.assumptions?.length > 0 && <Card><CardContent className="pt-6"><CardTitle className="text-sm mb-3">{t("Допущения", "Assumptions")}</CardTitle><ul className="space-y-2 text-sm text-[var(--muted-foreground)]">{smeta.assumptions.map((a, i) => <li key={i}>• {a}</li>)}</ul></CardContent></Card>}
              {smeta.clarifying_questions?.length > 0 && <Card className="border-amber-200 bg-amber-50/50"><CardContent className="pt-6"><CardTitle className="text-sm mb-3 text-amber-800">{t("Ещё вопросы", "More questions")}</CardTitle><ul className="space-y-2 text-sm text-amber-900">{smeta.clarifying_questions.map((q, i) => <li key={i}>❓ {q}</li>)}</ul></CardContent></Card>}
            </div>
          )}

          {/* Feedback card */}
          <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center shrink-0 shadow-lg shadow-sky-500/25 text-xl">
                  💬
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sky-900">
                    {t("Насколько точна эта смета?", "How accurate is this estimate?", "Бул смета канчалык так?")}
                  </h3>
                  <p className="mt-1 text-sm text-sky-800">
                    {t(
                      "Мы в закрытой бете. Ваш отзыв поможет сделать расчёт точнее. Напишите нам в Telegram — что совпало, что нет, чего не хватает.",
                      "We're in closed beta. Your feedback helps improve accuracy. Message us on Telegram — what was right, what was off, what's missing.",
                      "Жабык бета. Пикириңиз тактыкты жакшыртууга жардам берет. Telegramга жазыңыз."
                    )}
                  </p>
                  <a
                    href="https://t.me/+996999955000"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#229ED9] text-white text-sm font-semibold hover:bg-[#1a8abf] transition-colors shadow-lg shadow-[#229ED9]/25"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    {t("Написать в Telegram", "Message on Telegram", "Telegramга жазуу")}
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
