/**
 * POST /api/deck/render
 *
 * Takes DeckData JSON and returns rendered HTML presentation.
 * This is a server-side renderer that produces the same cream+gold+navy
 * Crystal Diving style deck — but for ANY project, not just Karakol.
 *
 * The frontend can either:
 *   - Show the HTML in an iframe via a blob URL
 *   - Trigger a download as .html file
 */

import { NextResponse } from "next/server";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type BT = { ru: string; en: string };

function renderDeckHtml(deck: Record<string, unknown>): string {
  const cover = deck.cover as Record<string, unknown>;
  const coverTitle = cover?.title as BT;
  const coverSubtitle = cover?.subtitle as BT;
  const items = (deck.items ?? []) as Record<string, unknown>[];
  const fin = deck.financial_summary as Record<string, unknown>;
  const ask = deck.ask as Record<string, unknown>;
  const vision = deck.vision as Record<string, unknown>;
  const problem = deck.problem as Record<string, unknown> | null;
  const roadmap = deck.roadmap as Record<string, unknown>;
  const team = deck.team as Record<string, unknown> | null;

  const totalSlides = 5 + items.length + (problem ? 1 : 0) + (team ? 1 : 0);

  function bt(obj: unknown): string {
    const o = obj as BT | null;
    if (!o) return "";
    return `<span class="ru">${esc(o.ru)}</span>${o.en ? `<span class="en">${esc(o.en)}</span>` : ""}`;
  }

  let slideNum = 0;
  function sn(): string {
    slideNum++;
    return `<div class="sn">${String(slideNum).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}</div>`;
  }

  // Build items HTML
  const itemSlides = items.map((item, i) => {
    const name = item.name as BT;
    const tag = item.concept_tag as BT;
    const tagline = item.tagline as BT;
    const diff = item.differentiator as BT;
    const infra = (item.key_infrastructure ?? []) as BT[];
    return `
    <section class="slide has-gold">
      ${sn()}
      <div class="label">${esc((tag?.en ?? "") + " · " + (tag?.ru ?? ""))}</div>
      <h2>${bt(name)}</h2>
      <p class="lead">${bt(tagline)}</p>
      <div class="stats-row">
        <div class="stat"><div class="k">Инвестиции</div><div class="v">${esc(String(item.investment_usd ?? "—"))}</div></div>
        <div class="stat"><div class="k">Выручка/год</div><div class="v">${esc(String(item.annual_revenue_usd ?? "—"))}</div></div>
        <div class="stat"><div class="k">Окупаемость</div><div class="v">${esc(String(item.payback_years ?? "—"))}</div></div>
      </div>
      ${infra.length > 0 ? `<ul class="infra">${infra.slice(0, 4).map(inf => `<li>${esc(inf.ru)}</li>`).join("")}</ul>` : ""}
      <div class="diff"><div class="dk">Конкурентное преимущество</div><div>${esc(diff?.ru ?? "")}</div></div>
      <div class="gold-bar">${esc((diff?.ru ?? "").slice(0, 120))}</div>
    </section>`;
  }).join("\n");

  // Financial breakdown rows
  const finBreakdown = ((fin?.items_breakdown ?? []) as Record<string, unknown>[]).map(row => {
    const slug = String(row.item_slug ?? "");
    const matchItem = items.find(it => String(it.slug) === slug);
    const itemName = matchItem ? (matchItem.name as BT)?.ru ?? slug : slug;
    return `<tr><td>${esc(itemName)}</td><td class="num">${esc(String(row.investment ?? "—"))}</td><td class="num">${esc(String(row.revenue ?? "—"))}</td><td class="num">${esc(String(row.payback ?? "—"))}</td></tr>`;
  }).join("");

  // Roadmap phases
  const phases = ((roadmap?.phases ?? []) as Record<string, unknown>[]).map(p => {
    const pname = p.name as BT;
    const pdur = p.duration as BT;
    const deliverables = (p.deliverables ?? []) as BT[];
    return `<div class="phase">
      <div class="dot">${p.phase_number}</div>
      <div class="pcard">
        <div class="pn">${esc(pname?.ru ?? "")}</div>
        <div class="pd">${esc(pdur?.ru ?? "")}</div>
        ${deliverables.map(d => `<div class="pr">· ${esc(d.ru)}</div>`).join("")}
      </div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(coverTitle?.ru ?? "Ai-Smeta Deck")}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--cream:#f2ece0;--navy:#0d2847;--gold:#b89544;--gold2:#d4a84a;--slate:#475569;--border:rgba(13,40,71,.16)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#1a1a1a;font-family:'Inter',sans-serif;color:var(--navy)}
.deck{display:flex;flex-direction:column;align-items:center}
.slide{position:relative;width:1440px;height:810px;overflow:hidden;background:var(--cream);margin:24px 0;padding:74px 90px 88px;display:flex;flex-direction:column}
.slide::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(232,195,115,.06),transparent 60%);pointer-events:none;z-index:1}
.slide>*{position:relative;z-index:2}
.sn{position:absolute;bottom:30px;right:44px;font-size:11px;font-weight:600;letter-spacing:.14em;color:var(--slate);opacity:.5;z-index:4}
.label{font-size:10px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
.label::after{content:"";display:inline-block;width:36px;height:1px;background:var(--gold);vertical-align:middle;margin-left:14px}
h2{font-size:40px;font-weight:800;line-height:1.12;letter-spacing:-.012em;max-width:1100px}
h2 .en{display:block;margin-top:10px;font-size:17px;font-weight:400;color:var(--slate);font-style:italic}
.lead{margin-top:18px;font-size:16px;color:var(--slate);line-height:1.5;max-width:900px}
.lead .en{display:block;margin-top:6px;font-size:13px;color:var(--slate);opacity:.7;font-style:italic}
.stats-row{margin-top:24px;display:flex;gap:12px}
.stat{padding:14px 18px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-radius:10px;min-width:160px}
.stat .k{font-size:9px;color:var(--slate);text-transform:uppercase;letter-spacing:.12em;font-weight:700}
.stat .v{margin-top:5px;font-size:18px;font-weight:800;color:var(--navy)}
.infra{margin-top:18px;list-style:none;display:flex;flex-direction:column;gap:6px}
.infra li{font-size:13px;color:var(--slate);padding-left:14px;position:relative}
.infra li::before{content:"";position:absolute;left:0;top:7px;width:8px;height:1px;background:var(--gold)}
.diff{margin-top:18px;padding:14px 18px;background:rgba(184,149,68,.1);border-left:3px solid var(--gold);max-width:800px}
.diff .dk{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:800}
.diff>div:last-child{margin-top:5px;font-size:13px;line-height:1.45;color:var(--navy)}
.gold-bar{position:absolute;left:0;right:0;bottom:0;padding:20px 90px;background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));color:#fff;font-size:15px;font-weight:600;text-align:center;z-index:5}
.has-gold{padding-bottom:110px}
.slide.dark{background:linear-gradient(140deg,#081b32,var(--navy),#143b62);color:#fff}
.slide.dark h2{color:#fff}
.slide.dark h2 .en{color:rgba(255,255,255,.7)}
.slide.dark .label{color:var(--gold2)}
.mega{font-size:120px;font-weight:900;background:linear-gradient(180deg,#e8c373,var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;margin:32px 0 16px}
.sub{text-align:center;font-size:13px;color:rgba(255,255,255,.6);letter-spacing:.14em;text-transform:uppercase}
.bd-row{display:flex;gap:20px;margin-top:32px;justify-content:center}
.bd-card{padding:20px 24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.14);border-top:2px solid var(--gold);border-radius:0 0 10px 10px;min-width:200px}
.bd-card .bk{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2)}
.bd-card .bv{margin-top:8px;font-size:22px;font-weight:800;color:#fff}
table{width:100%;border-collapse:collapse;margin-top:16px}
th{text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:var(--slate);opacity:.7;padding:10px 8px;border-bottom:1.5px solid var(--border);font-weight:800}
td{font-size:13px;padding:11px 8px;border-bottom:1px solid rgba(13,40,71,.05);color:var(--navy)}
td.num{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.phases{display:flex;gap:18px;margin-top:32px;position:relative;flex:1}
.phases::before{content:"";position:absolute;top:34px;left:5%;right:5%;height:2px;background:linear-gradient(90deg,var(--gold2),var(--gold))}
.phase{flex:1;position:relative}
.dot{width:68px;height:68px;border-radius:50%;background:linear-gradient(145deg,var(--gold2),var(--gold));border:3px solid var(--cream);margin:0 auto;display:grid;place-items:center;font-size:24px;font-weight:900;color:var(--navy);position:relative;z-index:2;box-shadow:0 4px 14px rgba(184,149,68,.35)}
.pcard{margin-top:18px;padding:20px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-radius:12px}
.pn{font-size:16px;font-weight:800;color:var(--navy)}
.pd{margin-top:8px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:800}
.pr{font-size:12px;color:var(--slate);margin-top:4px}
.ask-card{background:var(--cream);border:1.5px solid rgba(255,255,255,.8);border-radius:20px;padding:56px 72px;max-width:900px;text-align:center;margin:auto;box-shadow:0 30px 80px rgba(0,0,0,.55)}
.ask-card h2{font-size:38px}
.ask-card p{margin-top:24px;font-size:15px;line-height:1.55;color:var(--slate)}
.sig{margin-top:30px;font-size:32px;font-weight:700;font-style:italic;color:var(--gold);font-family:serif}

.deck-nav{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:10px 14px;background:rgba(13,40,71,.92);border:1px solid rgba(255,255,255,.2);border-radius:999px;z-index:100;font-size:12px;color:rgba(255,255,255,.7);align-items:center}
.deck-nav button{background:none;border:1px solid rgba(255,255,255,.2);color:#fff;padding:7px 14px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600}
.deck-nav button:hover{background:rgba(212,168,74,.2);border-color:var(--gold)}
.deck-nav .ctr{padding:6px 10px;font-variant-numeric:tabular-nums;min-width:62px;text-align:center}
@media screen{.slide{transform-origin:top center;transform:scale(var(--scale,1))}}
@media print{@page{size:1440px 810px;margin:0}.slide{margin:0;box-shadow:none;break-after:page;transform:none!important}.deck-nav{display:none!important}}
</style>
</head>
<body>
<div class="deck" id="deck">

<!-- COVER (dark) -->
<section class="slide dark">
  ${sn()}
  <div class="label" style="margin-top:auto">${esc((deck.project_slug as string ?? "").replace(/-/g, " ").toUpperCase())} · 2026</div>
  <h2 style="font-size:52px;line-height:1.06;max-width:900px">${bt(coverTitle)}</h2>
  <p class="lead" style="color:rgba(255,255,255,.74);font-style:italic;margin-top:26px;max-width:600px">${bt(coverSubtitle)}</p>
</section>

${problem ? `
<!-- PROBLEM -->
<section class="slide has-gold">
  ${sn()}
  <div class="label">Проблема · Problem</div>
  <h2>${bt(problem.title as BT)}</h2>
  <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
    ${((problem.points ?? []) as BT[]).map((p, i) => `
      <div style="padding:20px 26px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-radius:12px;display:flex;gap:18px">
        <div style="font-size:28px;font-weight:900;color:var(--gold);width:40px;flex-shrink:0">${String(i + 1).padStart(2, "0")}</div>
        <div style="font-size:14px;line-height:1.45">${esc(p.ru)}<span style="display:block;margin-top:4px;font-size:12px;color:var(--slate);opacity:.7;font-style:italic">${esc(p.en)}</span></div>
      </div>
    `).join("")}
  </div>
  <div class="gold-bar">—</div>
</section>` : ""}

<!-- VISION -->
<section class="slide has-gold">
  ${sn()}
  <div class="label">Видение · Vision</div>
  <h2>${bt(vision?.title as BT)}</h2>
  <p class="lead" style="margin-top:24px;font-size:18px">${bt(vision?.body as BT)}</p>
  <div class="gold-bar">—</div>
</section>

<!-- PORTFOLIO -->
<section class="slide has-gold">
  ${sn()}
  <div class="label">${items.length} объектов · ${items.length} sites</div>
  <h2>Портфель проектов<span class="en">Project portfolio</span></h2>
  <div style="margin-top:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;flex:1">
    ${items.map(item => {
      const n = item.name as BT;
      const ct = item.concept_tag as BT;
      return `<div style="padding:20px 22px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-radius:12px;display:flex;flex-direction:column">
        <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)">${esc(ct?.en ?? "")}</div>
        <div style="font-size:20px;font-weight:800;margin-top:6px">${esc(n?.ru ?? "")}<span style="display:block;margin-top:2px;font-size:11px;font-weight:400;color:var(--slate);font-style:italic">${esc(n?.en ?? "")}</span></div>
        <div style="margin-top:auto;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:14px">
          <div><div style="font-size:9px;color:var(--slate);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Инвест.</div><div style="font-size:14px;font-weight:800;color:var(--navy);margin-top:1px">${esc(String(item.investment_usd ?? "—"))}</div></div>
          <div><div style="font-size:9px;color:var(--slate);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Окуп.</div><div style="font-size:14px;font-weight:800;color:var(--navy);margin-top:1px">${esc(String(item.payback_years ?? "—"))}</div></div>
        </div>
      </div>`;
    }).join("")}
  </div>
  <div class="gold-bar">—</div>
</section>

${itemSlides}

<!-- FINANCIAL (dark) -->
<section class="slide dark">
  ${sn()}
  <div class="label">Финансы · Financials</div>
  <h2>${bt(fin?.title as BT)}</h2>
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div style="font-size:24px;font-weight:700;text-align:center;color:#fff;max-width:800px">Прямые инвестиции<span class="en" style="display:block;margin-top:6px;font-size:14px;font-weight:300;color:rgba(255,255,255,.7);font-style:italic">Direct investment</span></div>
    <div class="mega">${esc(String((fin?.total_investment ?? "—")))}</div>
    <div class="sub">Совокупно · Combined</div>
    <div class="bd-row">
      <div class="bd-card"><div class="bk">Окупаемость</div><div class="bv">${esc(String(fin?.blended_payback ?? "—"))}</div></div>
      <div class="bd-card"><div class="bk">Структура</div><div class="bv">${items.length} проектов</div></div>
    </div>
  </div>
</section>

<!-- FINANCIAL TABLE -->
<section class="slide">
  ${sn()}
  <div class="label">Разбивка · Breakdown</div>
  <h2>Портфельная структура инвестиций<span class="en">Portfolio investment structure</span></h2>
  <div style="margin-top:24px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-radius:12px;padding:16px 24px">
    <table>
      <thead><tr><th>Порт · Port</th><th style="text-align:right">Инвестиции</th><th style="text-align:right">Выручка/год</th><th style="text-align:right">Окуп.</th></tr></thead>
      <tbody>${finBreakdown}</tbody>
    </table>
  </div>
</section>

<!-- ROADMAP -->
<section class="slide">
  ${sn()}
  <div class="label">Дорожная карта · Roadmap</div>
  <h2>${bt(roadmap?.title as BT)}</h2>
  <div class="phases">${phases}</div>
</section>

${team ? `
<!-- TEAM -->
<section class="slide">
  ${sn()}
  <div class="label">Партнёры · Partners</div>
  <h2>${bt(team.title as BT)}</h2>
  <div style="margin-top:28px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
    ${((team.entities ?? []) as BT[]).map(e => `
      <div style="padding:24px;background:rgba(255,255,255,.5);border:1.5px solid var(--border);border-top:3px solid var(--gold);border-radius:0 0 12px 12px">
        <div style="font-size:14px;font-weight:700">${esc(e.ru)}</div>
        ${e.en ? `<div style="font-size:11px;color:var(--slate);font-style:italic;margin-top:4px">${esc(e.en)}</div>` : ""}
      </div>
    `).join("")}
  </div>
</section>` : ""}

<!-- ASK -->
<section class="slide dark" style="display:flex;align-items:center;justify-content:center">
  ${sn()}
  <div class="ask-card">
    <h2>${bt(ask?.headline as BT)}</h2>
    ${((ask?.supporting_points ?? []) as BT[]).length > 0 ? `<p>${esc(((ask?.supporting_points ?? []) as BT[])[0]?.ru ?? "")}</p>` : ""}
    <div class="sig">Чоң рахмат!</div>
  </div>
</section>

</div>
<div class="deck-nav">
  <button onclick="navSlide(-1)">← Prev</button>
  <div class="ctr" id="ctr">1 / ${totalSlides}</div>
  <button onclick="navSlide(1)">Next →</button>
  <button onclick="window.print()">PDF</button>
</div>
<script>
function fit(){var s=Math.min(window.innerWidth/1440,(window.innerHeight-80)/810);document.documentElement.style.setProperty('--scale',s);document.getElementById('deck').style.width=(1440*s)+'px'}
window.addEventListener('resize',fit);window.addEventListener('load',fit);
var slides=Array.from(document.querySelectorAll('.slide')),idx=0;
function showSlide(i){idx=Math.max(0,Math.min(slides.length-1,i));slides[idx].scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('ctr').textContent=(idx+1)+' / '+slides.length}
function navSlide(d){showSlide(idx+d)}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();navSlide(1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();navSlide(-1)}});
</script>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deck = body.deck ?? body;
    const html = renderDeckHtml(deck);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "render_error", message: err instanceof Error ? err.message : "Render failed" } },
      { status: 500 },
    );
  }
}
