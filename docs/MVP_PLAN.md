# MVP Plan

## Stack

Finance project cizgisine yakin ilk stack:

- Vite
- React
- TypeScript
- Local-first room adapter
- Ilk prod sync icin Vercel Functions + Upstash Redis karari
- Kalici relational backend icin Supabase veya Neon opsiyonlari
- Supabase lokal Docker denemeleri icin migration yapisi
- React Query
- Tailwind CSS v4
- lucide-react
- qrcode.react
- Vercel
- Playwright
- Vitest

## Faz 1: Calisan Lokal Prototip

- Vite projesi kuruldu.
- Mobile-first ana akış eklendi.
- Demo soru seti eklendi.
- PWA manifest ve service worker config eklendi.
- Playwright smoke test eklendi.
- Route destekli oda, davet, cevap, bekleme ve sonuc akisi eklendi.
- Oda ve cevaplar icin versiyonlu localStorage adapter eklendi.
- Davet linkinden gercek QR kod uretimi eklendi.

## Faz 2: Kalici Backend Baglantisi

- Upstash Redis store'u Vercel Marketplace uzerinden hazirla.
- Oda olusturmayi TTL'li Redis room snapshot olarak yaz.
- Host ve davetli katilimcisini kaydet.
- Davet linkinden gelen kisiyi ayni odaya ekle.
- Oda sorularini oturum bazinda sabitle.
- Cevaplari Redis snapshot'a yaz.
- Kisa polling ile katilimci ve cevap durumlarini izle.
- Supabase veya Neon'a gecis ihtiyacini kalici gecmis/admin ihtiyaci cikinca tekrar degerlendir.

## Faz 3: AI Sonuc Ozeti

- Iki kisi tamamlayinca server-side endpoint calisir.
- Cevaplar OpenAI API'ye yargilamayan sistem talimatiyla gonderilir.
- Cikti `result_summaries` tablosuna yazilir.
- Sonuc ekrani ortak yonleri, farkli bakis acilarini ve devam sorularini gosterir.

## Faz 4: Uygulama Hissi

- Soru havuzunu 100+ soruya cikar.
- Seviye ve kategori secimi ekle.
- Offline/poor-network durumlarini yumusat.
- Installable PWA ikonlarini tamamla.
