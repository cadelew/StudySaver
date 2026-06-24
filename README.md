# StudySaver

> The AI savings copilot for college life.

**Hackathon Track:** Track 01 — Money, Jobs & AI

## What it does

StudySaver helps college students manage everyday spending, discover student discounts, optimize textbook costs, and plan toward personal goals — before they overspend.

Five modules:

1. **Voice Budgeting** — Say "$14 Chipotle" and it's logged, categorized, and deducted.
2. **Course Cost Optimizer** — Upload a syllabus → find the cheapest legal way to get every required item.
3. **Goal Planner** — Plan a concert, trip home, or emergency fund with real cost estimates.
4. **Check Before I Buy** — Verdict: Yes / Yes, but / Wait — with goal impact and savings suggestions.
5. **Student Savings Finder** — Personalized checklist of student deals, free tools, and campus perks.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) — mobile-first PWA
- **Styling:** Tailwind CSS v4
- **State:** Zustand (in-memory, demo-safe)
- **Voice:** Deepgram Nova-3 (speech-to-text)
- **AI:** Claude (Anthropic) — expense parsing, goal planning, course optimization
- **Data:** Supabase (Postgres) — optional, app runs with seed data

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## Environment variables

```
DEEPGRAM_API_KEY=
ANTHROPIC_API_KEY=
BROWSERBASE_API_KEY=          # enables live web research (Search API)
BROWSERBASE_PROJECT_ID=       # optional — not needed for Search API
NEXT_PUBLIC_SUPABASE_URL=     # optional
NEXT_PUBLIC_SUPABASE_ANON_KEY= # optional
```

The app runs fully with the Maya demo user even without a Supabase instance.

## Demo

1. Dashboard opens with Maya's pre-loaded budget.
2. Tap the mic → say "Fourteen dollars at Chipotle" → expense logged.
3. Tap **Course Costs** → load the Biology 1A demo syllabus → see cheapest safe plan saving $296.
4. Tap **Apply Savings** → savings redirected to Oakland Concert goal (3 weeks early).
5. Tap **Check Before I Buy** → "$120 headphones" → "Wait — delays goal by 9 days."

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor. The schema includes Maya's demo data seed.
