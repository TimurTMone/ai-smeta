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
СПРАВОЧНИК ЦЕН КЫРГЫЗСТАНА 2025-2026 (Бишкек, в KGS)
Источники: aviastal.kg, oir.kg, stroicom.kg, santehnica.kg
═══════════════════════════════════════════════════════

МАТЕРИАЛЫ:
Бетон M200(B15)=4,270-5,050/м³ | M250(B20)=4,290-4,800/м³ | M300(B22.5)=4,990-5,500/м³ | M350(B25)=4,380-5,200/м³
Арматура A500C: d12=56,020/т | d16=55,030/т | d10=62,590/т | d20=54,180/т
Кирпич керам.: одинарный=10-14/шт | М150=14-18/шт | облицовочный=18-30/шт
Газоблок D500-D600 600×300×200: 55-70/шт | 4,200-5,500/м³
Цемент: M400=330-380/мешок 50кг | M500=370-430/мешок
Песок строит.=800-1,200/м³ | Щебень=900-1,400/м³ | Отсев=600-900/м³
Металлочерепица: 0.4мм=415-623/м² | 0.45мм=434-880/м² | 0.5мм=476-1,050/м²
Профнастил=250-450/м²
Окна ПВХ: 2-камерн=4,500-6,500/м² | 3-камерн=6,500-9,500/м²
Двери вход.: эконом=16,000-22,500/шт | стандарт=27,900-40,200/шт
Двери межком.: эконом=11,900-14,300/шт | стандарт=14,300-17,000/шт | премиум=17,000-28,800/шт
Ламинат: эконом(32кл)=830-1,000/м² | стандарт(33кл)=1,000-1,500/м² | премиум=1,500-2,940/м²
Плитка: эконом=450-800/м² | стандарт=800-1,500/м² | премиум=1,500-3,000/м²
Штукатурка цем.-песч.=200-300/25кг | Ротбанд=520-650/30кг | Шпаклёвка=250-400/25кг
Утеплитель: минвата 100мм=150-280/м² | 150мм=230-400/м²
Кабель ВВГ 3×2.5=35-55/м | Труба ППР 20мм=25-45/м | Канализация 110мм=120-200/м

РАБОТЫ (только работа, без материалов):
Разработка грунта вручную=757-1,170/м³ | экскаватором=177-577/м³
Бетонирование вручную=2,600/м³ | Стены монолит=3,708/м³ | Ленточный фундамент=2,860/м³
Опалубка деревянная=312-390/м² | металлическая=910-1,170/м²
Армирование сетка=117-169/м² | Вязка каркаса=22,595-31,200/т
Кирпичная кладка=9.9-10.1/шт | Блочная кладка 20×20×40=65/шт
Штукатурка внутр.=234-285/м² | наружная=520-624/м² | Потолок=585/м²
Стяжка пола ≤5см=360-469/м² | ≤8см=395/м² | Наливной пол=455/м²
Плитка укладка=802/м² | Ламинат укладка=390/м² | Линолеум=325/м²
Покраска стен=125/м² | Обои бумажные=202/м² | Обои виниловые=244-398/м²
Стропильная система=650-1,170/м² | Металлочерепица с каркасом=1,391/м²
Электроточка (розетка)=196/шт | Выключатель=207/шт | Светильник=371/шт | Люстра=933/шт
Труба ПВХ d20-63=293/м | Раковина=1,950/шт | Унитаз=3,510/шт | Ванна=3,743/шт | Душ.кабина=5,070/шт
Окно ПВХ монтаж=845/м² | Дверь межком. монтаж=3,510/шт | Дверь вход. монтаж=2,990/шт
Котёл ≤15кВт=7,280/шт | Радиатор/точка отопления=3,900/шт | Тёплый пол=1,430/м²

ТЕХНИКА:
Экскаватор=177-577/м³ | Бульдозер=14,300/час | Кран=13,861/час
КамАЗ 10т=8,840/час | Бетономешалка=910/день | Генератор=1,560/день

БЕНЧМАРК ст-ть/м² (2025):
Эконом: 25,000-35,000 сом/м² | Стандарт: 35,000-50,000 | Премиум: 50,000-80,000
Среднее по Бишкеку: 40,200 сом/м² | По КР: 22,500 сом/м²

РЕГИОНАЛЬНЫЕ КОЭФФИЦИЕНТЫ (КН vs Бишкек=1.0):
Бишкек=1.0 | Чуй обл.=0.92 | Ош=0.80 | Жалал-Абад=0.75 | Иссык-Куль/Каракол=0.70 | Нарын=0.65 | Талас=0.65 | Баткен=0.60

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
   ИСПОЛЬЗУЙ ЦЕНЫ ИЗ СПРАВОЧНИКА ВЫШЕ. Не выдумывай цены — бери из справочника.
   Для Кыргызстана работай в KGS, для России в RUB, для Казахстана в KZT.
   Если позиции нет в справочнике — используй рыночную оценку и помечай source: "market".
   Не занижай — лучше завысить на 10% чем занизить. Заказчику нужна правда.
   Итоговая стоимость за м² ДОЛЖНА попадать в диапазон бенчмарка для выбранного уровня качества.

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
