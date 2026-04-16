/**
 * POST /api/ai/generate-smeta
 *
 * Professional-grade construction estimate powered by Claude.
 * Every line item breaks into material + labor + equipment with
 * waste factors, CIS norm references, and proper markups
 * (overhead, profit, contingency, regional coefficient).
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ты — главный инженер-сметчик с 25-летним стажем (Skanska, Turner Construction), специализирующийся на строительных проектах в Центральной Азии и России. Составь ПРОФЕССИОНАЛЬНУЮ локальную смету.

═══════════════════════════════════════════════════════
ПРАВИЛА СОСТАВЛЕНИЯ СМЕТЫ (обязательные, без исключений):
═══════════════════════════════════════════════════════

1. РАЗБИВКА КАЖДОЙ СТРОКИ НА 3 КОМПОНЕНТА:
   Для КАЖДОГО line item укажи отдельно:
   - material_cost: стоимость материалов на единицу
   - labor_cost: стоимость работ на единицу
   - equipment_cost: стоимость машин и механизмов на единицу
   rate = material_cost + labor_cost + equipment_cost
   total = qty × rate

2. КОЭФФИЦИЕНТЫ ПОТЕРЬ (waste):
   - Бетон: waste_pct = 0.03 (3%)
   - Кирпич, блоки: waste_pct = 0.05 (5%)
   - Пиломатериалы: waste_pct = 0.10 (10%)
   - Плитка, керамика: waste_pct = 0.10 (10%)
   - Металлопрокат: waste_pct = 0.03 (3%)
   - Сыпучие материалы: waste_pct = 0.02 (2%)
   - Кабель, трубы: waste_pct = 0.05 (5%)
   waste_amount = material_cost × qty × waste_pct

3. ССЫЛКИ НА НОРМЫ:
   Где возможно, указывай norm_code — код расценки ТЕР/ФЕР/ГЭСН.
   Примеры: "ТЕР-01-01-003" (земляные), "ФЕР-06-01-001" (бетон), "ГЭСН-08-02-001" (кладка).
   Если не можешь точно определить код — ставь null и source: "market".

4. НАКЛАДНЫЕ РАСХОДЫ И ПРИБЫЛЬ (обязательно):
   После всех разделов рассчитай:
   - direct_cost = сумма всех total по строкам + сумма всех waste_amount
   - overhead_pct: 18-22% от direct_cost (накладные расходы)
   - profit_pct: 8-12% от direct_cost (сметная прибыль)
   - contingency_pct: 3-10% от direct_cost (непредвиденные, зависит от сложности)
   - regional_coefficient: КН для региона (Бишкек=1.0, Ош=0.85, Каракол=0.9, Алматы=1.2, Москва=1.4, Ташкент=0.95)
   - total_with_markups = (direct_cost + overhead + profit + contingency) × regional_coefficient

5. СВОДНАЯ ТАБЛИЦА (summary):
   - materials_total: сумма material_cost × qty по всем строкам
   - labor_total: сумма labor_cost × qty
   - equipment_total: сумма equipment_cost × qty
   - waste_total: сумма waste_amount

6. СТОИМОСТЬ ЗА м²:
   Если площадь здания известна — рассчитай cost_per_sqm = total_with_markups / площадь.

7. УРОВЕНЬ КАЧЕСТВА:
   Определи quality_tier из описания или ответов заказчика:
   - "economy": минимальные материалы, типовые решения
   - "standard": средний рынок, хорошее качество
   - "premium": дорогие материалы, дизайнерские решения

8. РЕАЛИСТИЧНОСТЬ ЦЕН:
   Цены для 2025-2026 года. Для Кыргызстана в KGS, России в RUB, Казахстана в KZT.
   Не занижай — лучше завысить на 10% чем занизить. Заказчику нужна правда.

═══════════════════════════════════════════════════════
ФОРМАТ — строго JSON:
═══════════════════════════════════════════════════════
{
  "region": "Бишкек",
  "currency": "KGS",
  "building_area_sqm": 150,
  "quality_tier": "standard",
  "sections": [
    {
      "name": {"ru": "Земляные работы", "en": "Earthworks"},
      "section_total": 118000,
      "items": [
        {
          "id": "li_1",
          "description": {"ru": "Разработка грунта экскаватором", "en": "Excavation by excavator"},
          "unit": "м³",
          "qty": 120,
          "material_cost": 0,
          "labor_cost": 250,
          "equipment_cost": 200,
          "rate": 450,
          "total": 54000,
          "waste_pct": 0,
          "waste_amount": 0,
          "source": "market",
          "norm_code": "ТЕР-01-01-003"
        }
      ]
    }
  ],
  "summary": {
    "materials_total": 2800000,
    "labor_total": 950000,
    "equipment_total": 320000,
    "waste_total": 145000
  },
  "markups": {
    "overhead_pct": 0.20,
    "overhead_amount": 843000,
    "profit_pct": 0.10,
    "profit_amount": 421500,
    "contingency_pct": 0.05,
    "contingency_amount": 210750,
    "regional_coefficient": 1.0,
    "regional_note": "Бишкек, зона 1, КН=1.0"
  },
  "direct_cost": 4215000,
  "total_with_markups": 5690250,
  "cost_per_sqm": 37935,
  "assumptions": ["Глубина промерзания 1.2 м", "Грунт — суглинок средней плотности"],
  "clarifying_questions": [],
  "norms_referenced": ["ТЕР-01-01-003", "ФЕР-06-01-001"]
}

Верни ТОЛЬКО JSON. Никаких комментариев. Каждое число должно быть точно рассчитано.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "config", message: "ANTHROPIC_API_KEY not set. Add it in Vercel environment variables." } },
      { status: 500 },
    );
  }

  let body: { text: string; answers?: Record<string, string>; projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "validation", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  if (!body.text || body.text.trim().length < 10) {
    return NextResponse.json(
      { error: { code: "validation", message: "Provide a project description (at least 10 characters)" } },
      { status: 400 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    let userContent = body.text;
    if (body.answers && Object.keys(body.answers).length > 0) {
      const answersText = Object.entries(body.answers)
        .map(([q, a]) => `Вопрос: ${q}\nОтвет: ${a}`)
        .join("\n\n");
      userContent = `ОПИСАНИЕ ОБЪЕКТА:\n${body.text}\n\nУТОЧНЁННЫЕ ДАННЫЕ (ответы заказчика):\n${answersText}`;
    }

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();

    let json = raw;
    if (json.startsWith("```")) {
      json = json.split("```")[1];
      if (json.startsWith("json")) json = json.slice(4);
      json = json.trim();
    }

    const smeta = JSON.parse(json);

    smeta.id = "smeta_" + Date.now().toString(36);
    smeta.project_id = body.projectId ?? "proj_adhoc";
    smeta.status = "draft";
    smeta.created_at = new Date().toISOString();

    return NextResponse.json({ smeta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json(
      { error: { code: "ai_error", message } },
      { status: 500 },
    );
  }
}
