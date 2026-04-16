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
              <Button variant="secondary" disabled><Download className="w-4 h-4" />{dict.export_xlsx}</Button>
            </div>
          </div>
          {smeta.sections.map((section, i) => (
            <Card key={i}><CardContent className="pt-6">
              <h3 className="text-base font-bold mb-4">{section.name.ru}<span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">{section.name.en}</span></h3>
              <Table><TableHeader><TableRow>
                <TableHead>{t("Наименование", "Description")}</TableHead><TableHead>{t("Ед.", "Unit")}</TableHead>
                <TableHead className="text-right">{t("Кол-во", "Qty")}</TableHead><TableHead className="text-right">{t("Цена", "Rate")}</TableHead>
                <TableHead className="text-right">{t("Сумма", "Total")}</TableHead><TableHead>{t("Источник", "Source")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>{section.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description.ru}<span className="block text-xs text-[var(--muted-foreground)]">{item.description.en}</span></TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">{item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.rate.toLocaleString(locale)}</TableCell>
                  <TableCell className="text-right font-semibold text-[var(--accent)] tabular-nums">{formatCurrency(item.total, smeta.currency, locale)}</TableCell>
                  <TableCell><Badge variant={item.source === "history" ? "success" : item.source === "market" ? "warning" : "danger"}>{item.source}</Badge></TableCell>
                </TableRow>
              ))}</TableBody></Table>
            </CardContent></Card>
          ))}
          <Card className="border-[var(--accent)] border-2"><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm uppercase tracking-wider font-bold text-[var(--muted-foreground)]">{dict.total}</div>
              <div className="text-4xl font-extrabold text-[var(--accent)] tabular-nums">{formatCurrency(smeta.total, smeta.currency, locale)}</div>
            </div>
          </CardContent></Card>
          {(smeta.assumptions?.length > 0 || smeta.clarifying_questions?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {smeta.assumptions?.length > 0 && <Card><CardContent className="pt-6"><CardTitle className="text-sm mb-3">{t("Допущения", "Assumptions")}</CardTitle><ul className="space-y-2 text-sm text-[var(--muted-foreground)]">{smeta.assumptions.map((a, i) => <li key={i}>• {a}</li>)}</ul></CardContent></Card>}
              {smeta.clarifying_questions?.length > 0 && <Card className="border-amber-200 bg-amber-50/50"><CardContent className="pt-6"><CardTitle className="text-sm mb-3 text-amber-800">{t("Ещё вопросы", "More questions")}</CardTitle><ul className="space-y-2 text-sm text-amber-900">{smeta.clarifying_questions.map((q, i) => <li key={i}>❓ {q}</li>)}</ul></CardContent></Card>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
