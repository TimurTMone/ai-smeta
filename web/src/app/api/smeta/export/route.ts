/**
 * POST /api/smeta/export
 *
 * Takes Smeta JSON and returns a downloadable CSV file.
 * CSV is tab-separated for easy paste into Excel.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const smeta = body.smeta ?? body;

    const lines: string[] = [];

    // Header
    lines.push(`СМЕТНЫЙ РАСЧЁТ / COST ESTIMATE`);
    lines.push(`Регион\t${smeta.region ?? ""}`);
    lines.push(`Валюта\t${smeta.currency ?? ""}`);
    lines.push(`Площадь\t${smeta.building_area_sqm ?? "—"} м²`);
    lines.push(`Уровень\t${smeta.quality_tier ?? "—"}`);
    lines.push(``);

    // Column headers
    lines.push(`Раздел\tНаименование\tDescription\tЕд.\tКол-во\tМатериалы\tРабота\tМеханизмы\tРасценка\tСумма\tПотери %\tПотери сумма\tИсточник\tНорма`);

    // Line items
    const sections = smeta.sections ?? [];
    for (const section of sections) {
      const sectionName = section.name?.ru ?? "";
      for (const item of section.items ?? []) {
        const desc = item.description ?? {};
        lines.push([
          sectionName,
          desc.ru ?? "",
          desc.en ?? "",
          item.unit ?? "",
          item.qty ?? 0,
          item.material_cost ?? "",
          item.labor_cost ?? "",
          item.equipment_cost ?? "",
          item.rate ?? 0,
          item.total ?? 0,
          item.waste_pct != null ? `${(item.waste_pct * 100).toFixed(0)}%` : "",
          item.waste_amount ?? "",
          item.source ?? "",
          item.norm_code ?? "",
        ].join("\t"));
      }
      // Section subtotal
      if (section.section_total) {
        lines.push(`\t\t\t\t\t\t\t\tИтого по разделу:\t${section.section_total}\t\t\t\t`);
      }
    }

    lines.push(``);

    // Summary
    if (smeta.summary) {
      lines.push(`СВОДКА ПО КАТЕГОРИЯМ`);
      lines.push(`Материалы\t${smeta.summary.materials_total ?? ""}`);
      lines.push(`Работа\t${smeta.summary.labor_total ?? ""}`);
      lines.push(`Механизмы\t${smeta.summary.equipment_total ?? ""}`);
      lines.push(`Потери\t${smeta.summary.waste_total ?? ""}`);
      lines.push(``);
    }

    // Markups
    lines.push(`ПРЯМЫЕ ЗАТРАТЫ\t${smeta.direct_cost ?? smeta.total ?? ""}`);
    if (smeta.markups) {
      lines.push(`Накладные расходы (${((smeta.markups.overhead_pct ?? 0) * 100).toFixed(0)}%)\t${smeta.markups.overhead_amount ?? ""}`);
      lines.push(`Сметная прибыль (${((smeta.markups.profit_pct ?? 0) * 100).toFixed(0)}%)\t${smeta.markups.profit_amount ?? ""}`);
      lines.push(`Непредвиденные (${((smeta.markups.contingency_pct ?? 0) * 100).toFixed(0)}%)\t${smeta.markups.contingency_amount ?? ""}`);
      lines.push(`Региональный коэффициент\t${smeta.markups.regional_coefficient ?? ""}\t${smeta.markups.regional_note ?? ""}`);
    }
    lines.push(``);
    lines.push(`ИТОГО С НАКЛАДНЫМИ\t${smeta.total_with_markups ?? smeta.total ?? ""}`);
    if (smeta.cost_per_sqm) {
      lines.push(`Стоимость за м²\t${smeta.cost_per_sqm}`);
    }

    lines.push(``);

    // Assumptions
    if (smeta.assumptions?.length) {
      lines.push(`ДОПУЩЕНИЯ`);
      for (const a of smeta.assumptions) lines.push(`\t${a}`);
    }

    const csv = lines.join("\n");

    // BOM for Excel compatibility with Cyrillic
    const bom = "\uFEFF";

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="smeta-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "export_error", message: err instanceof Error ? err.message : "Export failed" } },
      { status: 500 },
    );
  }
}
