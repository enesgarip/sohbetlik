# MVP Plan

## Stack

Finance project cizgisine yakin ilk stack:

- Vite
- React
- TypeScript
- Supabase Postgres
- Supabase Auth, anonymous sign-in ile
- Supabase Realtime
- React Query
- Tailwind CSS v4
- lucide-react
- Vercel
- Playwright
- Vitest

## Faz 1: Calisan Lokal Prototip

- Vite projesi kuruldu.
- Mobile-first ana akış eklendi.
- Demo soru seti eklendi.
- PWA manifest ve service worker config eklendi.
- Playwright smoke test eklendi.

## Faz 2: Supabase Baglantisi

- Anonymous Auth oturumu ac.
- Oda olusturmayi `rooms` tablosuna yaz.
- Host katilimcisini `participants` tablosuna yaz.
- Davet linkinden gelen kisiyi ayni odaya ekle.
- Oda sorularini `room_questions` ile sabitle.
- Cevaplari `answers` tablosuna yaz.
- Realtime ile katilimci ve cevap durumlarini izle.

## Faz 3: AI Sonuc Ozeti

- Iki kisi tamamlayinca server-side endpoint calisir.
- Cevaplar OpenAI API'ye yargilamayan sistem talimatiyla gonderilir.
- Cikti `result_summaries` tablosuna yazilir.
- Sonuc ekrani ortak yonleri, farkli bakis acilarini ve devam sorularini gosterir.

## Faz 4: Uygulama Hissi

- QR kodu gercek uret.
- Oda linklerini route ile destekle.
- Soru havuzunu 100+ soruya cikar.
- Seviye ve kategori secimi ekle.
- Offline/poor-network durumlarini yumusat.
- Installable PWA ikonlarini tamamla.
