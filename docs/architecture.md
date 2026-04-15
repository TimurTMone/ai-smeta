# Architecture

## V1 component map

```
┌──────────────┐    voice     ┌──────────────────┐
│   Telegram   │─────────────▶│  python-telegram │
│    client    │              │       -bot       │
└──────────────┘              └────────┬─────────┘
                                       │
                         ┌─────────────┼─────────────┐
                         │             │             │
                         ▼             ▼             ▼
                   ┌─────────┐   ┌──────────┐  ┌──────────┐
                   │ Whisper │   │  Claude  │  │ Postgres │
                   │   API   │   │ Sonnet   │  │ (Supabase│
                   │         │   │   4.6    │  │          │
                   └─────────┘   └──────────┘  └──────────┘
                                       ▲
                                       │
                                  firm rate
                                   memory
                                 (retrieval)
```

## Data flow (happy path)

1. `bot.on_voice` downloads audio → `transcribe.transcribe_voice`
2. Transcript saved to `voice_notes` (confirmed=false)
3. Inline keyboard → user confirms/edits
4. `bot._run_smeta_and_reply` calls `agent.generate_smeta_draft`
5. Draft JSON saved to `smeta_drafts` (status=draft)
6. User approves → status=approved → rates logged to `rates` table

## Why single-agent, not a swarm

A 5-agent framework (transcriber → researcher → pricer → validator → formatter) is tempting but premature. One Claude call with a strong system prompt + retrieved firm context can handle 80% of cases in v1. Add agents only when a specific subtask demonstrably fails (e.g. when we need live supplier-site scraping for real-time prices, that becomes a tool).

## Scaling posture

- **Week 1-4**: long polling, single process, one firm. Fine.
- **Month 2**: webhook mode, multi-firm, FastAPI admin endpoints alongside bot.
- **Month 3+**: separate transcription worker (queue), self-hosted Whisper GPU box, rate-aggregation scheduled jobs.

## The moat, technically

`rates` table is the crown jewel. Every approved line item = one row. After 1000 approved Smetas × ~20 line items = 20K real-world rate observations. That's a data asset no competitor can replicate without going through the same estimator approvals. Retrieval-augmented Smeta generation using this table is what makes the agent progressively better than any generic LLM.
