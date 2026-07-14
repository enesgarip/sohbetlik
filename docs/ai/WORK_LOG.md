# Work Log

## 2026-07-14 (Codex, all-level flow verification)

- Production L1 -> L4 smoke test found Level 4 sessions could contain 17 questions (`Soru 17/17`) because opener reservation could exceed the Level 1 quota in the Level 4 mix.
- Capped reserved opening questions by the available minimum-level quota and added a real-pool regression test that every room level returns exactly 16 questions across multiple seeds.
- Added short anonymous sign-in retry/backoff in the Supabase room repository after e2e exposed transient anonymous auth failures under parallel browser load.

## 2026-07-14 (Codex, admin demo room reliability)

- Fixed AdminDashboard "Demo oda oluştur" failing with `participants_room_id_user_id_key`: the old client-side flow tried to create host and guest participants with the same anonymous Supabase user in one browser session.
- Added `api/admin/demo-room.ts`, an admin-authenticated server-side demo room creator using the service role and separate synthetic participant user ids.
- Updated `DemoRoomButton` to call the server endpoint and show a friendly generic error instead of raw database constraint messages.
- Admin analytics fetch now also avoids echoing backend error strings directly into the UI.

## 2026-07-14 (Codex, expanded L2-L4 seed migration)

- Added `supabase/migrations/20260714133000_seed_expanded_level2_level4_questions.sql`, generated from active source questions missing from existing migrations: L2 +16, L3 +14, L4 +14.
- Verified source-vs-migration coverage now has no missing active L2-L4 slugs.
- Ran Supabase remote dry-run; only the new migration was pending. Pushed it to the linked production Supabase project.
- Verified production via anonymous Supabase reads: active question counts are L1=43, L2=40, L3=38, L4=38; expected L2-L4 source slugs = 116, remote active L2-L4 slugs = 116, missing = 0.
- Local Supabase reset/lint could not run because Docker Desktop was not running on the machine; remote dry-run/push and remote read verification passed.

## 2026-07-14 (Codex, report download and 16-question copy cleanup)

- Fixed report download reliability by removing the async dynamic import from the button path, generating the report synchronously on click, and adding a new-tab fallback for browsers that do not support anchor downloads.
- Cleaned current 16-question UX copy on the landing page and removed stale hardcoded pool-count copy.
- Replaced admin drop-off buckets tied to 24 answers with room-length-relative progress buckets, so 16-question and legacy 24-question rooms are labeled correctly.
- Updated Playwright flows to use `SESSION_QUESTION_COUNT` and added a report download assertion.

## 2026-07-14 (Claude, critical fix — missing questions breaking room creation)

- **Bug**: "Oda oluştur" production'da tamamen kırıktı. `createRoom` → `getQuestionMaps` slug-to-UUID map oluştururken 19 soru DB'de bulunamıyordu: `Error: Soru veritabanında bulunamadı: playlist-tercihi`.
- **Kök neden**: `src/content/questions/level1.ts`'te 43 soru var ama Supabase'te sadece ilk 24'ü seed edilmişti. Havuz genişletme partisi (buzdolabi-kapagi, telefon-alarmi, playlist-tercihi, yolda-kaybolmak, enerji-saati, arkadas-cagri, para-harcama, yeni-insanlar, haber-tuketimi, surpriz-tepki, yardim-isteme, film-secimi + 7 easter egg soru) hiç migrate edilmemişti.
- **Fix**: `supabase/migrations/20260714090000_seed_missing_level1_questions.sql` — 19 soruyu `ON CONFLICT (slug) DO NOTHING` ile idempotent ekledi. `supabase db push` ile production'a uygulandı.
- **Demo oda**: AdminDashboard'a `DemoRoomButton` eklendi (admin auth arkasında). Aynı browser'da Supabase anonymous auth aynı userId verdiği için guest doğrudan `participants` tablosuna insert edilir, cevaplar batch insert.
- **Confetti**: Reveal mode'da eşleşen cevaplarda CSS-only confetti animasyonu (12 dot, 1.1s).
- Commit `3558069`, pushed to main.

## 2026-07-14 (Claude, polishing batch — dark mode, mobile UX, reorder, onboarding, perf)

- **Dark mode**: `prefers-color-scheme: dark` media query ile otomatik. Yeni CSS variable'lar: `--ink-rgb`, `--glass`, `--glass-strong`, `--choice-bg`, `--choice-active`, `--output-bg`, `--match-same`, `--match-diff`, `--line-alpha`, `--shadow-alpha`. App.css'teki tüm hardcoded renkler (`#fffaf3`, `#22201c`, `rgba(255,...)`, `rgba(34,32,28,...)`) CSS variable'lara çevrildi. Dual `theme-color` meta tag.
- **Mobil UX**: 48px minimum touch target tüm butonlarda (860px altı). `scale(0.97)` active feedback. Reveal mode mobilde tek kolonlu cevap kartları. `scroll-behavior: smooth`.
- **Sonuç sayfası sıralaması**: "Birlikte keşfet" butonu hero section'a taşındı. Time Stats AI Insights'tan hemen sonraya alındı. Yeni sıra: Hero+Reveal → Tendencies → Insights → Cross-Level → Time Stats → Comparisons → Community → Actions.
- **Onboarding**: Join sayfasında `sohbetlik_visited` localStorage flag'i ile ilk kez gelen kullanıcılara 3 adımlı kısa bilgi notu. Landing hero, steps, features'a staggered `fade-up` giriş animasyonları.
- **Performans**: AdminDashboard `React.lazy` + `Suspense` ile lazy load. `pdfReport` dynamic import — sadece buton tıklandığında yüklenir. QR kodu dark/light scheme'e göre `fgColor` adapte eder.
- Commits: `be1c265`, `c9f989c`, `a887b05`, `bbbf37c`, `d53674b`. All pushed to main.

## 2026-07-14 (Claude, "Birlikte keşfet" reveal mode)

- **RevealMode bileşeni**: Tam ekran overlay — sonuç sayfasından "Birlikte keşfet" butonuyla açılır. Çiftler yanyana otururken bir telefondan cevapları tek tek keşfederler.
- Akış: Soru gösterilir → "Cevapları göster" tap → 🎯 Aynı cevap! veya ✨ Farklı bakış açıları badge'i + yan yana cevap kartları → Sonraki soruya geç.
- Animasyonlar: `reveal-fade-in` overlay girişi, `reveal-slide-up` soru geçişi, `reveal-card-in` (scale bounce) cevap kartları, `reveal-bounce` tap icon.
- Progress bar ve counter (1/24), prev/next navigasyon, close butonu.
- Canlı mod (AnswerPage'deki `?live=1`) yerinde kaldı ama asıl önerilen deneyim bu — cevaplama sırasında baskı oluşturmuyor.
- Committed `9898b5a` and pushed to main.

## 2026-07-13 (Claude, live mode + batch 3)

- **Canlı mod**: RoomPage'de "Canlı mod" toggle'ı → `?live=1` URL parametresiyle AnswerPage'e geçiş. Canlı modda: kullanıcı cevapladıktan sonra partner'ın cevabını bekler (pulsing dot animasyonu), ikisi de cevapladığında mini reveal kartı çıkar (aynı/farklı badge, slide-in animasyon), "Sonraki soru" butonu ancak ikisi de cevaplayınca aktif olur. Son soruda "Sonuçlara git" olarak değişir. `.live-mode-toggle`, `.live-waiting`, `.live-reveal`, `.live-mode-badge` CSS class'ları.
- Committed `d80e88c` and pushed to main.

## 2026-07-13 (Claude, batch 3 — reactions, bookmarks, time stats, PDF, invite page)

- **Emoji reactions**: `ReactionBar` bileşeni — insight'lar ve cevap karşılaştırmalarına 😂🤔💯❤️😮 tepki toggle. localStorage'da persist. `src/lib/reactions.ts` modülü.
- **Question bookmarks**: Cevap karşılaştırma kartlarında ⭐ Konuşalım → ✅ Konuştuk → temizle döngüsü. `src/lib/questionBookmarks.ts` modülü. `cycleBookmark()` ile 3-state toggle.
- **Time stats**: Supabase `answered_at` timestamp'leri artık client'a geliyor (`supabaseRoomRepository` güncellendi, `AnswerTimestamps` type eklendi). `src/lib/answerStats.ts` — `calculateTimeStats()` toplam süre, ortalama, en hızlı/en yavaş cevap hesaplar. Sonuç sayfasında "Zamanlama" bölümü olarak gösterilir.
- **PDF rapor**: `src/lib/pdfReport.ts` — `generateReport()` browser print dialog'unu açan HTML sayfa oluşturur. Yorumlar, eğilimler ve cevap tablosu içerir. "Rapor indir" butonu actions bölümüne eklendi.
- **Invite page iyileştirme**: "Seni bekliyorlar!" başlığı, odadaki kişi sayısı, tahmini süre, host'un başlayıp başlamadığına göre contextual açıklama. `join-info-row` ve `join-info-card` bileşenleri.
- CSS: `.r-reaction-*`, `.r-bookmark-*`, `.r-time-*`, `.join-info-*` class'ları eklendi.
- Checks: `tsc --noEmit` ✅, `vite build` ✅, browser console hatasız.
- Committed `d687b32` and pushed to main.

## 2026-07-13 (Claude, batch 2 — share card, notifications, norms fix, A/B test, cross-level summary)

- **ShareCard redesign**: Gradient circles, position labels (e.g. "Dengede", "X tarafına yakın"), level badge, "Sen de dene!" CTA footer with sohbetlik.vercel.app button. Inline styles for html-to-image compatibility (1080×1920 Instagram Story format).
- **Push notifications**: New `src/lib/notifications.ts` — `canAskNotificationPermission()`, `requestNotificationPermission()`, `sendLocalNotification()`. WaitingPage requests permission on mount and fires a local notification when partner completes.
- **Norms API fix**: `api/norms.ts` was querying `answers.question_id` with client-sent slugs, but DB stores UUIDs. Fixed by resolving slugs → UUIDs via `questions` table before querying answers, then mapping results back to slugs. Community norms section enriched: shows question prompt text and expanded from 4 to 6 items.
- **Landing page A/B testing**: New `src/lib/abTest.ts` — `getVariant()` (sticky localStorage, 50/50 split), `trackEvent()` (localStorage event log, last 100). `HomePage` renders variant copy for subtitle, CTA, and bottom CTA. `trackEvent('room_created', variant)` fires on room creation.
- **Cross-level AI summary**: New `api/cross-level-summary.ts` endpoint — accepts tendency data from multiple levels, generates "big picture" insights with tones: growth (cross-level change), pattern (consistent traits), prompt (conversation starters). Client walks `previousRoomId` chain to load prior rooms, calculates tendencies per level, and sends to the endpoint. Appears as "Büyük Resim" section on results page for L2+ rooms with loading state. New types/functions in `src/lib/summaryApi.ts`: `CrossLevelInsight`, `LevelTendencyData`, `buildLevelTendencyData()`, `fetchCrossLevelSummary()`.
- Checks: `tsc --noEmit` ✅, `vite build` ✅. ESLint has a pre-existing broken `ajv` dependency (not related to our changes).
- Committed `7a55bb7` and pushed to main.

## 2026-07-13 (Claude, sonuç sayfası + analytics dashboard)

- Confirmed answerWeights for L3-L4 were already implemented — all 48 questions have full answerWeights and `tendencyScoring.ts` processes them. Marked as done.
- Confirmed ShareCard component already exists with html-to-image, native share + download fallback. Marked as done.
- **Sonuç sayfası zenginleştirme**: Added `AnswerComparison` component to the results page — shows soru-soru karşılaştırma (question-by-question comparison) between two participants. Features: same/different cevap vurgusu, aynı/farklı sayıları, highlight reel (top 2 farklı + top 2 aynı), expand/collapse for full list. Positioned between AI Insights and Community Norms sections.
- **Analytics dashboard genişletme**: Extended `api/admin/analytics.ts` API with new metrics: dönüşüm hunisi (funnel: created → paired → first answer → one completed → both completed), terk noktaları (drop-off buckets by answer count for incomplete rooms), saatlik dağılım (hourly room creation pattern, UTC), ortalama ve medyan tamamlama süresi (minutes from room creation to last answer). Added `question_id` and `answer_value` to answer query for future soru bazlı istatistik.
- Updated `AdminDashboard.tsx` with new sections: completion time stat cards, funnel visualization with percentage bars, drop-off analysis bar chart, hourly pattern bar chart, and dedicated CSS for all new components.
- CSS additions: `.r-compare-*` classes for answer comparison cards with same/diff styling, `.admin-funnel-*` classes for funnel visualization, `.admin-hourly-*` classes for hourly pattern chart, `.admin-bar-fill.dropoff` variant.
- Checks: `npm run build` ✅, `npm run lint` ✅ (existing warnings only), `npm run test:unit` ✅ (24 passed).

## 2026-07-13 (Codex, Vercel build fix)

- Investigated repeated Vercel production build failures after `cf7fc49`; local checkout was 14 commits behind, so the previously passing local build was not using the same source as Vercel.
- Reproduced the Vercel `npm run build` failure locally after fast-forwarding to `origin/main`.
- Fixed TypeScript build blockers: removed unused result/share-card symbols, added `midLabel` to slider content/domain types and mapping, and added missing `min: 1` / `max: 5` to the newly added slider questions.
- Installed the new `html-to-image` dependency already present in `package.json`/`package-lock.json`.
- Checks: `npm run build` passed, `npm run lint` passed with existing warnings, and `npm run test:unit` passed (24).
- Investigated the admin analytics dashboard: production has 85 test rooms from 2026-07-07 through 2026-07-09, all with DB `rooms.status = waiting` because the MVP intentionally never updates room status.
- Fixed `api/admin/analytics.ts` to infer completed/active/waiting rooms from participants and answers, page through Supabase rows past the 1000-row API response cap, and infer level distribution from the room's actual questions.
- Checks: `npm run build` passed, `npm run lint` passed with existing warnings, and `npm run test:unit` passed (24).

## 2026-07-08 (Codex, Level 3-4 continuation)

- Picked up after `908f5df` (`Add Level 3 and Level 4 question pools with full 4-level progression`): code was committed locally and `main` was ahead of `origin/main` by one commit; the Level 3-4 seed migration was present but untracked.
- Verified the L3/L4 seed migration against the TypeScript source: 48 slugs total, Level 3 = 24, Level 4 = 24, with no missing, extra, or duplicate slugs.
- Fixed one source/seed mismatch in Level 4 (`guclü` option id -> `guclu`) and tightened `questions:lint` so option ids must be ASCII kebab-case like slugs.
- Local Supabase verification: `db reset --local` applied all six migrations including `20260710090000_seed_level3_level4_questions.sql`; `db lint --local` passed; local active question counts are L1=24, L2=24, L3=24, L4=24.
- Production Supabase: dry-run showed only `20260710090000_seed_level3_level4_questions.sql`; pushed it to the linked project, confirmed remote migration history includes `20260710090000`, and authenticated production reads show active question counts L1=24, L2=24, L3=24, L4=24. CLI emitted the known non-fatal pg-delta catalog cache warning after applying the migration.
- Rebasing onto the latest `origin/main` brought in the new tendency/results work. Fixed its unused type imports, added an `answerWeights` undefined guard required by TypeScript, and updated the Playwright app smoke to complete a real two-person room now that results wait for both participants.
- Checks: `npm run questions:lint`, `npm run lint`, `npm run test:unit` (24), `npm run build`, and `npm run test:e2e` (6, with local Supabase env override) passed.
- Production deploy: pushed `ad1dc06` + `dd3f1e5` to `main`; Vercel built `sohbetlik-h4hzuwrbn-enesgarips-projects.vercel.app` and aliased it to `https://sohbetlik.vercel.app`.
- Live production QA: two browser contexts completed Levels 1, 2, 3, and 4 (24 answers per participant per level), opened results at each level, saw `Seviye 2'ye geç`, `Seviye 3'e geç`, and `Seviye 4'e geç`, and confirmed Level 4 has no Level 5 CTA. Vercel runtime error/fatal logs for the deployment were clean.

## 2026-07-08 (Codex, preview backend docs)

- Documented the preview backend decision: preview deploys leave `VITE_SUPABASE_*` unset by default and use localStorage fallback unless a separate preview Supabase project exists.
- Updated `.env.example`, README, CI/CD, Supabase setup, backend strategy, source index, product/MVP notes, Claude bootstrap, project state, next actions, and decision log to match the live Groq-backed summary setup (`GROQ_API_KEY`, server-side only).

## 2026-07-09 (Codex, home sample flow cleanup)

- Removed the homepage `Örnek akışı dene` CTA so the static preview no longer creates a real 24-question room from the production pool.
- Replaced the phone preview's pool question with a short, static, pool-independent mini prompt (`Bugün sohbetin hangi tonda aksın?`) to avoid users seeing duplicated question content later in the actual room.
- Verified rendered homepage in the in-app browser on desktop and mobile: only `Oda oluştur` is visible, the old pool preview question is absent, the mini preview is present, no horizontal overflow on mobile, and browser console logs are clean. Clicking `Oda oluştur` still opens the room invite screen.
- Checks: `npm run test:unit` passed (23), `npm run test:e2e -- --project=chromium` passed (3). Follow-up: fixed the unrelated `src/content/questions/level2.ts` quote syntax issue around line 107; `npm run lint` and `npm run build` now pass again.
- Continued into the Level 2 pool: included `src/content/questions/level2.ts` in `questionContents`, expanded `questions:lint` to validate every implemented level, fixed the `normalde` banned-word hit, adjusted `tatil-butcesi` trait to keep per-level trait caps, and added a 24th L2 slider (`heyecan-paylasma`).
- Continued into Level 2 exposure: added `20260709093000_seed_level2_questions.sql`, extended room creation with `previousRoomId`, added hard question exclusions so a next-level room cannot refill from the immediately previous room, and added the results CTA `Seviye 2'ye geç` after all participants complete Level 1.
- Local Supabase verification: `db reset --local` applied all five migrations including the Level 2 seed; `db lint --local` passed; active DB question counts are Level 1 = 24 and Level 2 = 24.
- Browser QA: local Supabase + two Playwright contexts completed host and guest 24/24, opened results, clicked `Seviye 2'ye geç`, and rendered the first Level 2 question (`Kültür & Eğlence · Seviye 2`). The only console error was a Vite-dev 404 from the summary API path; production/Vercel handles that API route.
- Checks: `npm run questions:lint`, `npm run lint`, `npm run test:unit` (24), `npm run build`, and `npm run test:e2e` (6) passed.
- Continued rollout: pushed `20260709093000_seed_level2_questions.sql` to production Supabase. Remote migration history now includes it, and authenticated production reads show active question counts L1=24 and L2=24. The app deploy and live L1 -> L2 browser verification are next.
- Production deploy: committed `f37ab29` (`Add Level 2 next-level flow`), pushed to `main`, Vercel built `sohbetlik-cnfvxaape-enesgarips-projects.vercel.app`, and `sohbetlik.vercel.app` was manually re-aliased to it.
- Live production QA: two separate browser contexts completed guest and host 24/24, opened results, saw `Seviye 2'ye geç`, created the next room, and rendered the first Level 2 question (`Para Alışkanlıkları · Seviye 2`). Browser console and failed request capture were clean; Vercel runtime error/fatal scan for the deployment found no logs.
- Follow-up monitoring: Vercel runtime error clusters, error/fatal logs, 5xx counts, and 4xx counts are still clean after rollout. Updated AGENTS/NEXT_ACTIONS/DECISION_LOG to remove stale "AI summary next", "localStorage live flow", and "room-chain UI pending" notes.

## 2026-07-09 (Claude, nice-to-have polishes)

- `/room/:roomId` viewer resolution: replaced `getHostParticipant` with `getViewerParticipant` (finds participant with label "Sen"). Non-participants are redirected to `/join/:roomCode` instead of seeing the host's view. Removed dead `getHostParticipant` export.
- Slider debounce: split `selectAnswer` into two paths — choice/either_or writes immediately, slider debounces 300ms via `useRef` timer. `flushSliderDebounce()` fires on "Sonraki soru" to prevent answer loss at question boundary.
- Stale room cleanup: new migration `20260709090000_cleanup_stale_rooms.sql` — `SECURITY DEFINER` function deletes rooms >7 days old (CASCADE handles participants, answers, room_questions, result_summaries). Client calls `supabase.rpc('cleanup_stale_rooms')` on homepage load, throttled to once per 24h via localStorage timestamp. `src/types/supabase.ts` updated with function signature.
- Checks: lint ✅, 23 unit tests ✅, build ✅, `db reset` (4 migrations) ✅, 6 e2e tests ✅.
- Migration pushed to production Supabase, committed and pushed to main.
- AI Summary implemented: `api/summary.ts` Vercel serverless function. Initially tried Gemini 2.0 Flash but hit regional quota block (Turkey, `limit: 0` on all Gemini models). Switched to Groq (Llama 3.3 70B, OpenAI-compatible API). Prompt enforces no scores/judgments, Turkish, conversation-focused insights. Client (`src/lib/summaryApi.ts`) calls `/api/summary` on results page when both participants have answered; falls back to local `buildConversationInsights` if API unavailable. Loading spinner with pulse animation. `@vercel/node` added as devDependency. `vercel.json` updated to pass `/api/*` through. `GROQ_API_KEY` needed as Vercel production env var.
- Fixed AI retry loop: `useEffect` was re-running because polling-driven re-renders created new object references for dependencies. Switched from `useState` guard to `useRef` (`aiAttemptedRef.current = true` is synchronous, prevents re-execution).
- AI badge: results page shows green "Cevaplarınıza özel AI analizi" pill when AI insights are present, distinguishing them from local fallback.
- Simulate-guest button removed from WaitingPage UI. `api/simulate-guest.ts` endpoint kept for programmatic testing only.
- Production alias updated: `sohbetlik.vercel.app` → `sohbetlik-7v7p3d4bt-enesgarips-projects.vercel.app`.

## 2026-07-08 (Codex, production deploy verification)

- Picked up after Claude. `main` was already clean and pushed at `0d4cd3f` (`Take two-device sync and the level 1 question system to production`), but `https://sohbetlik.vercel.app` still pointed at an older 8-question deployment.
- Found the current production deployment (`sohbetlik-fegy1pp7j...`) had the 24-question build but failed room creation in the browser because the Vercel `VITE_SUPABASE_*` env values produced a non-Latin-1 header error during Supabase anonymous sign-in.
- Re-set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel production from the local `.env.local` values without printing secrets, then forced a production deploy: `sohbetlik-dq606gis8-enesgarips-projects.vercel.app`.
- Repointed `sohbetlik.vercel.app` to the new deployment with `vercel alias set`.
- Verified live production with Playwright using separate host and guest browser contexts: 24-question build visible, room created, guest joined, host saw guest progress `1/24`, both completed 24 answers, and results opened on both. Browser console error capture was clean.
- Checks run: `npm run lint` passed, `npm run test:unit` passed (23), `npm run build` passed, `vercel logs --level error --since 1h --environment production --limit 20` found no logs.

## 2026-07-08 (Claude, Supabase production setup)

- Created the real Supabase project via CLI (user approved): name `sohbetlik`, ref `ojhncwhagydpmfnygdfy`, region `eu-central-1`, org `qvuzhiugndmlovoniegv`. DB password generated locally and saved to gitignored `db-password.local` (never echoed; user should move it to a password manager — it can also be reset in the dashboard).
- `supabase link` done; all three migrations pushed (`db push --linked`, dry-run verified first, `migration list --linked` confirms). Non-fatal pg-delta catalog cache warning during push; migrations applied cleanly.
- Anonymous sign-ins enabled via `supabase config push` (config.toml already had `enable_anonymous_sign_ins = true`; remote diff showed it flipping false→true). Other diffs benign (localhost site_url variants, email confirmations off, MFA TOTP off) — we use anonymous auth only. Production `site_url` still points at localhost; cosmetic for now, set to the Vercel URL if email auth ever arrives.
- `.env.local` now points at the production project (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY replaced in place). To use the local Docker stack again, restore the local values (`supabase start` prints them).
- Types regenerated from the linked project (`gen types --linked`), build passes.
- Vercel env: `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` added to **production** via CLI (project already linked as `sohbetlik`). Preview env add kept demanding a git branch despite `--yes` (CLI quirk) — skipped; previews fall back to localStorage mode, add via dashboard if needed.
- **Found and fixed a real production bug during verification:** the optimistic-write/polling race (a known MVP tradeoff) actually bites at real network latency — a stale snapshot could briefly wipe the just-selected answer, disabling the continue button and swallowing taps (mobile e2e stalled at question 23 twice). Fix: pending-answers ledger (`src/lib/pendingAnswers.ts`, 15s TTL) overlaid on every network snapshot in `useRoom` and after `saveAnswer`. Mobile full-flow e2e went from 60s-timeout to 5.9s.
- Playwright global timeout 30s→60s (24-question flow against a real backend needs headroom).
- Checks: `npm run lint` ✅, `npm run test:unit` ✅ (23), `npm run build` ✅, `npm run test:e2e` ✅ 6/6 **against the production Supabase project** (two-device sync included).
- Remaining to go live: commit + push to main so Vercel Git integration deploys with the new env vars, then verify `https://sohbetlik.vercel.app` on two devices.

## 2026-07-08 (Claude, question system implementation)

- Stage 3 content approved; implemented the full question system per `docs/product/QUESTION_SYSTEM_DESIGN.md`.
- New content layer (repo = single source of truth):
  - `src/content/categories.ts` (12 category slugs + display names), `src/content/traits.ts` (25-trait registry; `oncelik-pusulasi` spelling corrected from the design doc's typo), `src/content/types.ts` (`QuestionContent` schema).
  - `src/content/questions/level1.ts`: the 24 approved Level 1 questions with full metadata. Three tiny wording fixes vs the doc (removed `bile`/`hâlâ` to honor the guide's banned-word rule; doc updated to match).
  - `src/content/questions.validate.test.ts`: mechanical quality gate (`npm run questions:lint`, also part of `test:unit`): option counts per type, slider label rules, banned words, batch caps (≤3/category, ≤2/trait), opener/closer availability.
- Selection algorithm `src/domain/questionSelection.ts` (+ 10 unit tests, seeded PRNG):
  - level-mix quotas, trait ≤2 / category ≤3 caps, soft type targets (35/45/20), seen-question refill (starvation guard), reserved openers (light+fun, either_or first), warm closer (nostalji/hayal preferred), greedy curve ordering with no same-trait/category neighbors and no 3-type runs, insertion fallback for tail conflicts.
- Non-repeat layer 2: `src/lib/seenQuestions.ts` (localStorage, 90-day TTL, 200 cap); host exclusions applied at room creation, slugs recorded after create succeeds.
- Option order shuffle: `src/domain/optionOrder.ts` — Fisher-Yates seeded by `roomId:questionId` so both devices see the same order; only for `shuffleOptions: true` questions (gece-mutfagi keeps its punchline last).
- Slider results no longer show numbers: `getAnswerLabel` renders end-label positions ("Tam …", "… tarafına yakın", "İkisinin ortasında").
- App wiring: room creation uses selection + exclusions (24 questions per session), answer screen renders shuffled options, home preview updated to a new question.
- Migration `20260708090000_question_metadata_and_level1_pool.sql`:
  - `questions` + subcategory/trait/intensity/spark_score/fun_score/est_seconds/shuffle_options/followup_prompt/ai_hint/meta (slider scale lives in `meta.slider`; qualityNote intentionally repo-only), pool index.
  - `rooms.previous_room_id` (rematch chain FK; UI not built yet).
  - Old 8 demo questions deactivated (kept for FK integrity; legacy rooms still render via the client lookup map).
  - 24 questions seeded idempotently (`on conflict (slug) do update`).
- `src/types/supabase.ts` hand-updated for the new columns; regenerate after remote push as usual.
- Tests updated: e2e loops 24 questions, sync spec expects `1/24`, results test asserts number-free slider labels.
- Checks run: `npm run lint` ✅, `npm run test:unit` ✅ (23), `npm run build` ✅, `npm run db:reset:local` ✅ (3 migrations), `npm run db:lint:local` ✅, `npm run test:e2e` ✅ (6, including two-device sync against the local stack with the new pool).
- Note: e2e initially failed because the local DB predated the new migration (new slugs unmapped → room creation failed); `db reset` fixed it. Remote push will need the same migration before the frontend deploy (already the standing Step 2 in NEXT_ACTIONS).
- Not built yet (by design, needs product/UI decisions): rematch "next level" flow using `previous_room_id`, level selector UI (sessions are Level 1 / 24 questions for now), level 2-4 question pools.

## 2026-07-07 (Claude, question system design — Stage 1)

- New multi-stage product task started: full question system design (guide → system architecture → question production). Staged workflow; each stage waits for user approval.
- Stage 1 delivered: `docs/product/QUESTION_WRITING_GUIDE.md` — the quality standard for the entire future question pool. Covers good/bad question patterns, conversation-starting vs conversation-killing types, level 1-4 topic mapping, answer option design, per-type rules (multiple choice, slider, two-option), trait × context matrix for generating variants, psychological/UX principles, and a hard quality checklist.
- Notable design constraints captured in the guide that affect Stage 2: questions need `trait` metadata (no same-trait back-to-back), option order should be shuffleable, slider results must never be rendered as distance/score, session ordering should follow peak-end (light open, warm close).
- No code changed; docs only. No commands needed.
- Status: Stage 1 approved by the user.
- Stage 2 delivered: `docs/product/QUESTION_SYSTEM_DESIGN.md` — question system architecture on top of the existing schema. Key points: three orthogonal axes (category slug / level 1-4 / trait registry) + presentation type; 12 categories; per-room level mix table (e.g. L2 room = 25% L1 + 75% L2); content-as-code in `src/content/questions/` seeded via idempotent migration; `questions` table extension sketch (trait, intensity, spark/fun scores, followup_prompt, ai_hint, meta jsonb — qualityNote stays repo-only); slider scale moves to `meta.slider` so numbers are never shown; 3-phase selection algorithm (filter → stratified random sampling → peak-end ordering with adjacency repair) to live in `src/domain/questionSelection.ts`; non-repeat via `rooms.previous_room_id` chain (hard guarantee per pair) + device localStorage history (soft, 90-day decay); AI summary jsonb contract aligned with existing `ConversationInsight.tone`, with hard no-score guardrails.
- Old 8 demo questions flagged for deactivation once the new pool lands (some violate the guide, e.g. slider showing numbers).
- Status: Stage 2 approved by the user.
- Stage 3 delivered: `docs/product/QUESTIONS_LEVEL1.md` — first Level 1 (İlk Tanışma) question pool, 24 questions with full metadata (slug, category, subcategory, trait, level, intensity, type, est. seconds, spark/fun scores, prompt, options/slider labels, quality rationale, followup prompt). Batch self-satisfies the set constraints: ≤3 per category (9 categories), ≤2 per trait (18 traits), 8 either_or / 10 choice / 6 slider, opener/closer candidates marked, ~6-7 min per-person budget, banned-word scan clean. Rejected drafts documented for future author calibration. New trait `kucuk-keyifler` added to the registry; `temas-ritmi` and `para-keyif-dengesi` used at L1 via safe reframing (friendship/childhood scenes) with per-question justification.
- Status: waiting for user approval of Stage 3 content. After approval, implementation follows design doc §12: encode into `src/content/questions/level1.ts`, add `questions:lint` validator, seed migration, deactivate the 8 demo questions. No code/schema changed yet.

## 2026-07-07 (Claude, Supabase room sync)

- `RoomRepository` interface converted to async and extended with `subscribeToRoom`.
- `localRoomRepository` made async; cross-tab sync via `storage` events.
- `supabaseRoomRepository` implemented: anonymous auth bootstrap, create/join room, answer upserts, room snapshot reads, Realtime Postgres Changes subscription.
- `activeRoomRepository` selects Supabase when `VITE_SUPABASE_*` env vars exist, otherwise localStorage fallback.
- `useRoom` hook added: initial load + Realtime subscription + 3s polling fallback (only while tab is visible).
- `App.tsx` refactored to async loading with loading/error states on all room pages.
- New migration `20260707150000_seed_questions_and_room_access.sql`:
  - `questions.slug` column (unique) + seed of the 8 MVP questions, so frontend slug ids map to DB uuids.
  - Participants select policy widened: guests can now read the host's participant row for open rooms (old policy blocked guest progress view).
  - `delete` grant + policy on rooms for the creator ("Yeni oda" reset flow).
- `supabase/seed.sql` emptied; questions now seed via migration so remote `db push` gets them too.
- `src/types/supabase.ts` rewritten in CLI format (added missing `room_questions`, `result_summaries`, `Relationships` arrays — without them supabase-js collapses all table types to `never`).
- New e2e test `tests/sync.spec.ts`: host + guest in separate browser contexts, real two-device sync verified against the local Supabase stack. Skips automatically when `.env.local` has no Supabase env (CI stays green).
- Checks run: `npm run lint` ✅, `npm run test:unit` ✅ (7), `npm run build` ✅, `npm run db:lint:local` ✅, `npx supabase migration list --local` ✅ (2 migrations), `npm run test:e2e` ✅ (6, including two-device sync against local Supabase).
- Known MVP tradeoffs: room `status` is intentionally never set to `completed` (RLS read access for guests depends on open status); `/room/:roomId` assumes the viewer is the host; answer writes are optimistic with polling reconciliation.
- Still pending (needs dashboard access): link real Supabase project, enable anonymous sign-ins, set env in `.env.local` + Vercel, `db push --linked`, regenerate types.

## 2026-07-07

- Project named Sohbetlik.
- Public GitHub repo created: `https://github.com/enesgarip/sohbetlik`.
- Production Vercel URL configured: `https://sohbetlik.vercel.app`.
- GitHub Actions CI/CD configured with lint/test/build, Playwright smoke, and Supabase schema checks.
- Branch protection enabled on `main`; admin direct pushes currently bypass PR requirement.
- Initial Vite + React + TypeScript PWA flow built.
- Local room, invite, answer, waiting, and results flow implemented.
- Real QR generation added.
- `RoomRepository` interface added for backend swapping.
- Initial Supabase schema migration and local Docker config added.
- Temporary backend strategy was Upstash-first while Supabase free slot was blocked.
- Supabase slot became available, so backend strategy changed to Supabase-first.
- Agent collaboration system added with `AGENTS.md`, `CLAUDE.md`, and `docs/ai/*` files.
- Claude web bootstrap prompt and source index added so Claude Pro can join without rescanning the repo.
