# Sohbetlik

Iki kisilik AI destekli tanisma ve sohbet PWA'si.

Sohbetlik bir uyumluluk testi degil; iki insanin ayni soru setini cevaplayip ortak yonlerini, farkli bakis acilarini ve konusmaya deger basliklari gormesine yardim eden bir deneyimdir.

Production: https://sohbetlik.vercel.app

## Stack

- Vite + React + TypeScript
- Supabase Postgres/Auth/Realtime
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

## Dokumanlar

- [Product Spec](docs/PRODUCT_SPEC.md)
- [MVP Plan](docs/MVP_PLAN.md)
- [GitHub and CI/CD](docs/GITHUB_CICD.md)
- [Initial Design Concept](docs/design/initial-mobile-flow-concept.png)
