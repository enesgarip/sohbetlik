# Sohbetlik

[English](README.md) | **Türkçe**

> **Doğru cevaplar değil, güzel sohbetler.**

[![CI](https://github.com/enesgarip/sohbetlik/actions/workflows/ci.yml/badge.svg)](https://github.com/enesgarip/sohbetlik/actions/workflows/ci.yml)
[![Production](https://img.shields.io/badge/live-sohbetlik.vercel.app-blue)](https://sohbetlik.vercel.app)

Sohbetlik, buluşmalar için iki kişilik, AI destekli bir sohbet PWA'sıdır. İki kişi aynı hafif soru setini kendi telefonlarından cevaplar; sonra ortak noktalarını, farklı bakış açılarını ve konuşmaya değer başlıkları birlikte görür.

Bilinçli olarak bir kişilik testi ya da uyumluluk motoru **değildir**:

- Uyumluluk skoru veya yüzdesi yok.
- "Uyumlu / uyumsuz" hükmü yok.
- Yargılayıcı dil yok — sonuçlar insanları notlamak için değil, sohbete davet etmek için yazılır.

**Canlı uygulama:** <https://sohbetlik.vercel.app>

## Nasıl Çalışır

1. **Oda kur** — ev sahibi uygulamayı açıp bir oturum başlatır. Kayıt gerekmez; katılımcılar anonim Supabase Auth kullanıcılarıdır.
2. **Davet et** — ev sahibi davet linkini veya QR kodunu paylaşır. Misafir kendi cihazından katılır.
3. **Cevapla** — iki katılımcı da aynı 16 soruyu cevaplar (çoktan seçmeli ve kaydırmalı). Cevaplar cihazlar arasında gerçek zamanlı senkronize olur.
4. **Sonuçları birlikte görün** — ikisi de bitirince sonuç sayfası ortak noktaları, farklılaşan bakış açılarını, davranışsal eğilimleri, soru soru karşılaştırmayı ve gerçek cevaplara özel AI sohbet önerilerini gösterir.
5. **Derinleş** — bir seviye tamamlandığında çift bir sonrakine geçebilir (Seviye 1–4); önceki oturumun sorularının tekrarlanmayacağı garanti edilir.

### Soru Sistemi

- Soru havuzları kod içinde içerik olarak yaşar (`src/content/`); artan derinlikte 4 seviyeye ayrılmıştır ve her soru kategori ile karakter özelliği (trait) etiketleri taşır.
- Bir seçim motoru (`src/domain/questionSelection.ts`) her 16 soruluk oturumu kurar: seviye karışımı, trait/kategori üst sınırları, soru tipi temposu ve özel açılış/kapanış slotları.
- Kaydırmalı cevaplar asla sayı olarak gösterilmez; seçenek sırası, iki cihazın da paylaştığı oda tohumlu (room-seeded) bir düzenle karıştırılır.
- Cihaz düzeyinde tutulan geçmiş, yeni oda kurarken yakın zamanda görülen soruların tekrar gelmesini engeller.
- Mekanik bir içerik lint'i (`npm run questions:lint`) CI'da soru kalitesini denetler.

### AI Özetleri

İki katılımcı da cevapladığında, bir Vercel serverless fonksiyonu (`api/summary.ts`) Groq (Llama 3.3 70B) ile kişiselleştirilmiş sohbet içgörüleri üretir. API anahtarı yalnızca sunucu tarafında kalır. AI çağrısı başarısız olur ya da erişilemezse uygulama yerel olarak üretilen içgörülere düşer — akış asla kırılmaz.

## Mimari

```
React PWA (Vite + TypeScript)
   │
   ├── RoomRepository arayüzü
   │      ├── supabaseRoomRepository   → production: anonim auth, Postgres, Realtime
   │      └── localRoomRepository     → localStorage fallback (env var gerekmez)
   │
   ├── useRoom hook'u → ilk fetch + Realtime aboneliği + 3 sn'lik polling fallback
   │
   └── Vercel Functions (api/) → sunucu tarafı Groq AI özetleri
```

- **Backend:** Supabase — anonim girişler, satır düzeyi güvenlik (RLS) ve açık yetkilerle (grants) Postgres, iki cihaz senkronu için Realtime. Tüm şema değişiklikleri `supabase/migrations/` altında sürümlü migration'lardır.
- **Fallback öncelikli:** `VITE_SUPABASE_*` env değişkenleri yokken (yerel geliştirme, preview deploy'lar) aynı arayüz, localStorage tabanlı repository üzerinde çalışır.
- **Güvenilirlik detayları:** debounce'lu kaydırıcı yazımları ve "Sonraki soru"da flush, henüz verilen bir cevabın bayat anlık görüntülerce silinmemesi için pending-answers defteri, 7 günden eski odaların otomatik temizliği.

### Rotalar

| Rota | Amaç |
| --- | --- |
| `/` | Ana sayfa — oda kur |
| `/join/:roomCode` | Misafir davet linki / QR ile katılır |
| `/room/:roomId` | Oda lobisi |
| `/answer/:roomId/:participantId` | Cevaplama akışı |
| `/waiting/:roomId/:participantId` | Diğer katılımcıyı bekleme |
| `/results/:roomId/:participantId` | Ortak sonuçlar |

## Teknoloji Yığını

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Radix UI, PWA (yüklenebilir, çevrimdışı çalışabilen kabuk)
- **Backend:** Supabase (Auth, Postgres, Realtime), Vercel Functions
- **AI:** Groq (Llama 3.3 70B), yalnızca sunucu tarafında
- **Kalite:** oxlint, Vitest (birim + içerik lint'i), Playwright (iki cihaz senkron spec'i dahil e2e), GitHub Actions CI, Supabase şema kontrolleri

## Başlarken

```bash
npm install
npm run dev
```

Bu kadar — env değişkeni olmadan uygulama tamamen localStorage fallback üzerinde çalışır; oda → davet → cevap → sonuç akışının tamamını yerelde deneyebilirsin (iki katılımcı için iki tarayıcı profili/sekmesi kullan).

### Ortam Değişkenleri

`.env.example` dosyasına bak:

```bash
VITE_SUPABASE_URL=              # Supabase proje URL'i (yerelde opsiyonel)
VITE_SUPABASE_PUBLISHABLE_KEY=  # Supabase publishable key (yerelde opsiyonel)
GROQ_API_KEY=                   # Yalnızca sunucu tarafı — asla VITE_* olarak verilmez
```

- `VITE_SUPABASE_*` boş bırakılırsa localStorage fallback kullanılır.
- `GROQ_API_KEY` yalnızca Vercel Functions tarafından tüketilir; asla `VITE_` öneki almamalı ve istemciye gitmemelidir.
- Preview deploy'larda `VITE_SUPABASE_*` bilinçli olarak boş bırakılır; böylece test odaları asla production verisine yazılmaz.

### Komutlar

```bash
npm run lint          # oxlint
npm run test:unit     # Vitest (soru içerik lint'i dahil)
npm run questions:lint # yalnızca içerik kalite kontrolü
npm run build         # tsc + vite build
npm run test:e2e      # Playwright
npm run ci:local      # lint + typecheck + birim + build + e2e tek seferde
```

### Yerel Supabase (opsiyonel)

Docker gerektirir.

```bash
npm run db:start:local              # yerel Supabase yığınını başlat
npm run db:lint:local               # veritabanı şemasını lint'le
npx supabase migration list --local # migration'ları doğrula
npm run db:reset:local              # migration + seed'leri yeniden uygula
npm run db:stop:local
```

## Proje Yapısı

```
api/                  Vercel serverless fonksiyonları (AI özeti, admin araçları)
src/
  components/        UI bileşenleri (paylaşım kartı, karşılaştırmalar, tema düğmesi, ...)
  content/           Soru havuzları (Seviye 1-4), kategoriler, trait kayıt defteri
  domain/            Çekirdek mantık: odalar, sonuçlar, soru seçimi
  hooks/             useRoom ve arkadaşları
  lib/               görülen soru geçmişi, bekleyen cevap defteri, yardımcılar
  repositories/      RoomRepository arayüzü + Supabase / localStorage implementasyonları
supabase/migrations/  Sürümlü şema: tablolar, RLS, grant'ler, seed'ler, temizlik fonksiyonu
tests/                Playwright e2e (uygulama akışı + iki cihaz senkronu)
docs/                 Ürün spesifikasyonu, MVP planı, mimari ve AI ajan devir dokümanları
```

## Dokümantasyon

- [Ürün Spesifikasyonu](docs/PRODUCT_SPEC.md)
- [MVP Planı](docs/MVP_PLAN.md)
- [Backend Senkron Stratejisi](docs/architecture/BACKEND_SYNC_STRATEGY.md)
- [GitHub ve CI/CD](docs/GITHUB_CICD.md)
- [Proje Durumu](docs/ai/PROJECT_STATE.md) · [Sonraki Adımlar](docs/ai/NEXT_ACTIONS.md) · [Karar Günlüğü](docs/ai/DECISION_LOG.md)
- [Ajan Rehberi](AGENTS.md) · [Claude Devir Notu](CLAUDE.md) — bu repo AI ajanlarla birlikte geliştiriliyor
- [İlk Tasarım Konsepti](docs/design/initial-mobile-flow-concept.png)

## Deployment

`main`'e yapılan push'lar CI'ı çalıştırır (lint, birim testleri, build, Playwright smoke, Supabase şema kontrolleri) ve Vercel'e deploy eder. Veritabanı değişiklikleri Supabase CLI migration'ları olarak gider. Production için Vercel ortamında `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` ve `GROQ_API_KEY` gerekir.

## Ürün İlkeleri

Bunlar pazarlık edilemez ve kod tabanı ile dokümanlar genelinde uygulanır:

1. Uygulama bir test değil, sohbet yardımcısıdır — sonuçlar diyaloğa davet etmeli, asla yargılamamalıdır.
2. Uyumluluk skoru yok, asla.
3. Ücretsiz katman dostu: Supabase + Vercel ücretsiz planları MVP'yi taşır.
4. Tasarım gereği mahremiyet-hafif: anonim auth, hesap yok, odalar 7 gün sonra otomatik silinir.
