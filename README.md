# Sohbetlik

Iki kisilik AI destekli tanisma ve sohbet PWA'si.

Sohbetlik bir uyumluluk testi degil; iki insanin ayni soru setini cevaplayip ortak yonlerini, farkli bakis acilarini ve konusmaya deger basliklari gormesine yardim eden bir deneyimdir.

Production: https://sohbetlik.vercel.app

## Stack

- Vite + React + TypeScript
- Local-first room adapter, production sync icin Supabase'e tasinacak
- Supabase Auth, Postgres ve Realtime
- Vercel Functions, server-side AI ozeti icin
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
OPENAI_API_KEY=
```

`OPENAI_API_KEY` frontend'e `VITE_` ile verilmez; sadece server-side/Vercel environment olarak kullanilir.

## Komutlar

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

DB gerektiren adimlara gelmeden oda, davet linki, cevap ve sonuc akisi localStorage tabanli adapter ile calisir. Ilk gercek iki-cihaz sync icin ayni repository arayuzune Supabase baglanacak.

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
