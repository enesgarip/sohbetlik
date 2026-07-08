# Sohbetlik

Iki kisilik AI destekli tanisma ve sohbet PWA'si.

Sohbetlik bir uyumluluk testi degil; iki insanin ayni soru setini cevaplayip ortak yonlerini, farkli bakis acilarini ve konusmaya deger basliklari gormesine yardim eden bir deneyimdir.

Production: https://sohbetlik.vercel.app

## Stack

- Vite + React + TypeScript
- Supabase Auth, Postgres ve Realtime ile production room sync
- localStorage fallback, Supabase env vars yokken dev/preview akisi icin
- Vercel Functions, server-side Groq AI ozeti icin
- React Query
- Tailwind CSS v4
- Vercel
- Playwright + Vitest

## Baslatma

```bash
npm install
npm run dev
```

## Ortam Degiskenleri

`.env.example` dosyasini referans al.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
GROQ_API_KEY=
```

`GROQ_API_KEY` frontend'e `VITE_` ile verilmez; sadece server-side/Vercel environment olarak kullanilir.

Production Vercel ortaminda `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` ve `GROQ_API_KEY` gerekir. Preview deploy'larda production Supabase'e yazmamak icin `VITE_SUPABASE_*` varsayilan olarak bos birakilir; ayri bir preview Supabase projesi acilirsa o zaman preview env vars olarak set edilir.

## Komutlar

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

Supabase env vars varsa oda, davet linki, cevap, bekleme ve sonuc akisi production backend'e yazar. Env vars yoksa ayni repository arayuzu localStorage fallback ile calisir.

Yerel Supabase kontrolu:

```bash
npm run db:start:local
npm run db:lint:local
npx supabase migration list --local
npm run db:stop:local
```

## Dokumanlar

- [Agent Guide](AGENTS.md)
- [Claude Handoff](CLAUDE.md)
- [Project State](docs/ai/PROJECT_STATE.md)
- [Next Actions](docs/ai/NEXT_ACTIONS.md)
- [Source Index](docs/ai/SOURCE_INDEX.md)
- [Claude Bootstrap Prompt](docs/ai/CLAUDE_BOOTSTRAP_PROMPT.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [MVP Plan](docs/MVP_PLAN.md)
- [Backend Sync Strategy](docs/architecture/BACKEND_SYNC_STRATEGY.md)
- [GitHub and CI/CD](docs/GITHUB_CICD.md)
- [Initial Design Concept](docs/design/initial-mobile-flow-concept.png)
