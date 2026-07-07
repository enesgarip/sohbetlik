# Sohbetlik

Iki kisilik AI destekli tanisma ve sohbet PWA'si.

Sohbetlik bir uyumluluk testi degil; iki insanin ayni soru setini cevaplayip ortak yonlerini, farkli bakis acilarini ve konusmaya deger basliklari gormesine yardim eden bir deneyimdir.

Production: https://sohbetlik.vercel.app

## Stack

- Vite + React + TypeScript
- Local-first room adapter, ilk prod sync icin Upstash Redis'e tasinabilir
- Vercel Functions API siniri
- Supabase lokal Docker denemeleri icin hazir migration yapisi
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
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENAI_API_KEY=
```

`OPENAI_API_KEY` ve `UPSTASH_REDIS_REST_TOKEN` frontend'e `VITE_` ile verilmez; sadece server-side/Vercel environment olarak kullanilir.

## Komutlar

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

DB gerektiren adimlara gelmeden oda, davet linki, cevap ve sonuc akisi localStorage tabanli adapter ile calisir. Ilk gercek iki-cihaz sync icin ayni repository arayuzune Vercel Functions + Upstash Redis baglanacak.

## Dokumanlar

- [Product Spec](docs/PRODUCT_SPEC.md)
- [MVP Plan](docs/MVP_PLAN.md)
- [Backend Sync Strategy](docs/architecture/BACKEND_SYNC_STRATEGY.md)
- [GitHub and CI/CD](docs/GITHUB_CICD.md)
- [Initial Design Concept](docs/design/initial-mobile-flow-concept.png)
