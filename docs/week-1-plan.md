# Week 1 — ship ugly, ship fast

## Goal
Client's estimator records one voice note in Telegram, gets a draft Smeta back in <60 seconds, can approve/edit in chat. That's it.

## Day-by-day

**Day 1** — infrastructure
- Register Telegram bot with @BotFather
- Create Supabase project, run `db/schema.sql`
- Fill `backend/.env`, run `python -m app.main` locally
- Send /start from your phone, confirm it responds

**Day 2** — transcription loop
- Send 5 real voice notes from the client (KG/RU mixed)
- Measure Whisper API accuracy
- If <70% usable, plan Whisper large-v3 self-host for day 8+

**Day 3** — Smeta agent tuning
- Feed 3 historical Smetas from the client into the system prompt as examples
- Test on day-2 transcripts, measure how close drafts come to reality
- Iterate prompt in `backend/app/prompts.py`

**Day 4** — first real estimator in the loop
- Put a real estimator on the bot for a half-day
- Log every edit they make — that's your training signal

**Day 5** — rate memory
- Every approved Smeta → write line items to `rates` table
- Add a retrieval step: before generating, pull top-K similar past rates and include in agent context

**Day 6-7** — polish loop
- PDF/Excel export of approved Smetas
- Handle re-record / edit / redo edge cases
- Ship to 2-3 estimators at the firm

## Metrics to watch
- Time from voice → draft sent (target: <60s)
- Lines edited per Smeta (target: trending down over weeks)
- Estimator approval rate (target: >80% of drafts get approved, not redone)

## Explicitly NOT doing week 1
- Admin dashboard (Telegram is enough)
- Client-facing intake
- Multi-language UI
- Team permissions / roles
- Exports to 1C
- Fine-tuned Whisper

## Week 2+ horizon
- Self-hosted Whisper large-v3 fine-tuned on client voice notes
- Next.js admin panel for estimator supervisors
- Rate benchmark dashboard (the moat, made visible)
- GESN/FER/NRS norm template exports
