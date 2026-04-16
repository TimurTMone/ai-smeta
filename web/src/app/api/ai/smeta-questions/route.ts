/**
 * POST /api/ai/smeta-questions
 *
 * Step 1 of the conversational Smeta flow.
 * Takes the user's initial project description, analyzes what's missing,
 * and returns 5-8 targeted follow-up questions that a real estimator
 * would ask before producing a cost estimate.
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ты — опытный инженер-сметчик с 20-летним стажем. Клиент описал свой строительный объект. Проанализируй описание и задай 5-8 уточняющих вопросов, которые НЕОБХОДИМЫ для составления точной сметы.

Каждый вопрос должен быть конкретным и предлагать варианты ответа где возможно.

КАТЕГОРИИ ВОПРОСОВ (задай 6-10 вопросов, хотя бы по одному из каждой релевантной категории):

ОБЯЗАТЕЛЬНЫЕ ВОПРОСЫ (всегда задавай):
A. БЮДЖЕТ: "Какой у вас целевой бюджет? Это поможет откалибровать уровень материалов и решений." Опции: конкретная сумма или "Нет ограничения, нужна точная оценка"
B. УРОВЕНЬ КАЧЕСТВА: "Какой уровень отделки и материалов?" Опции: ["Эконом (минимум)", "Стандарт (средний рынок)", "Премиум (дизайнерский)"] — "ВЛИЯЕТ НА СТОИМОСТЬ НА 30-50%"
C. РАБОЧАЯ СИЛА: "Своя бригада или будете нанимать подрядчиков?" Опции: ["Своя бригада", "Подрядчик (генподряд)", "Смешанный вариант"] — "Подрядчик на 20-40% дороже но включает организацию"

СИТУАТИВНЫЕ ВОПРОСЫ (задавай если не ясно из описания):
1. УЧАСТОК: рельеф, тип грунта, уровень грунтовых вод, подъездные пути
2. ФУНДАМЕНТ: тип (ленточный, свайный, плитный), глубина заложения
3. КОНСТРУКТИВ: материал стен, толщина, тип перекрытий
4. КРОВЛЯ: тип покрытия, утепление, конфигурация
5. ОТДЕЛКА: конкретные материалы (если выбран уровень "стандарт" или "премиум")
6. ИНЖЕНЕРНЫЕ СЕТИ: отопление, водоснабжение, канализация, электрика
7. БЛАГОУСТРОЙСТВО: забор, отмостка, озеленение
8. СРОКИ: сезон начала, жёсткий дедлайн (влияет на зимние надбавки 20-40%)
9. ОСОБЫЕ УСЛОВИЯ: сейсмозона, высокий уровень грунтовых вод, ограниченный подъезд, охранная зона
10. ПРОЕКТ: есть ли архитектурные чертежи или это прикидка "с нуля"?

НЕ задавай вопросы о том, что уже ЯВНО указано в описании.

ФОРМАТ — строго JSON:
{
  "analysis": "Краткий анализ: что уже известно из описания",
  "questions": [
    {
      "id": "q1",
      "category": "УЧАСТОК",
      "question_ru": "Какой тип грунта на участке?",
      "question_en": "What type of soil is on the site?",
      "options": ["Суглинок", "Песок", "Скальный грунт", "Глина", "Не знаю"],
      "why": "Влияет на выбор фундамента и стоимость земляных работ"
    }
  ]
}

Верни ТОЛЬКО JSON.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "config", message: "ANTHROPIC_API_KEY not set" } },
      { status: 500 },
    );
  }

  let body: { text: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "validation", message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  if (!body.text || body.text.trim().length < 10) {
    return NextResponse.json(
      { error: { code: "validation", message: "Description too short" } },
      { status: 400 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: body.text }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    let json = raw;
    if (json.startsWith("```")) {
      json = json.split("```")[1];
      if (json.startsWith("json")) json = json.slice(4);
      json = json.trim();
    }

    const result = JSON.parse(json);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: { code: "ai_error", message: err instanceof Error ? err.message : "Failed" } },
      { status: 500 },
    );
  }
}
