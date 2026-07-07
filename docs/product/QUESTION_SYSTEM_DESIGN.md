# Sohbetlik Soru Sistemi Tasarımı

Sürüm: 1.0 (Aşama 2 çıktısı — onay bekliyor)
Son güncelleme: 2026-07-07
Ön koşul: `docs/product/QUESTION_WRITING_GUIDE.md` (kalite standardı, onaylandı)

Bu doküman soru havuzunun mimarisini tanımlar: kategoriler, ilişki aşamaları, soru tipleri, metadata, veritabanı modeli, seçim/rastgelelik/tekrarsızlık algoritması ve gelecekteki AI analizi. Mevcut şemanın (`questions`, `room_questions`, `answers`) üzerine kuruludur; onu değiştirmez, genişletir.

---

## 1. Tasarımın Üç Bağımsız Ekseni

Her soru üç bağımsız eksende konumlanır. Bunları ayırmak, sistemin ölçeklenmesinin anahtarıdır:

| Eksen | Soru | Örnek |
|---|---|---|
| **Kategori** (konu) | Soru *ne hakkında*? | seyahat, yemek, nostalji |
| **Seviye** (derinlik) | Soru ilişkinin *hangi aşamasına* uygun? | 1-4 |
| **Trait** (yoklanan özellik) | Soru kişinin *hangi yönünü* görünür kılıyor? | spontanlık, alan ihtiyacı |

Aynı trait farklı kategorilerde, aynı kategori farklı seviyelerde var olabilir. Rehberdeki "özellik × bağlam matrisi" (Bölüm 13) bu eksenlerin çaprazlanmasıdır: `spontanlık × seyahat × seviye 1` bir soru, `spontanlık × yemek × seviye 1` başka bir sorudur; kullanıcı tekrar hissetmez ama sistem ikisinin aynı özelliği yokladığını bilir.

Dördüncü boyut olan **soru tipi** (ikilem/çoktan seçmeli/slider) içerik değil sunum boyutudur ve oturum ritmi için kullanılır.

## 2. Kategoriler

Kategoriler kullanıcıya görünür (sonuç ekranında "Seyahat konusunda..." gibi başlık olabilir), bu yüzden isimler sıcak ve yargısız olmalı. Slug'lar sabittir, isimler serbestçe değişebilir.

| Slug | İsim | Kapsam | Ağırlıklı seviye |
|---|---|---|---|
| `lezzet` | Tat & Mutfak | yemek ritüelleri, tuhaf kombinler, sokak/ev | 1-2 |
| `kesif` | Seyahat & Keşif | plan vs akış, rota hayalleri, tatil ritmi | 1-2 |
| `kultur` | Kültür & Eğlence | film/dizi/müzik *deneyimi* (liste değil, davranış) | 1 |
| `nostalji` | Nostalji & Çocukluk | yaz tatilleri, ilk'ler, çocukluk kahramanları | 1 |
| `ritim` | Günlük Ritim | sabah/gece, hafta sonu, küçük alışkanlıklar | 1-2 |
| `hayal` | Hayaller & Olasılıklar | hipotetikler, süper güç, bir günlük hayatlar | 1 |
| `itiraf` | Küçük İtiraflar | suçlu zevkler, zararsız tuhaflıklar | 1 |
| `sosyal` | Sosyal Dünya | arkadaş grubundaki rol, kalabalık vs baş başa | 1-2 |
| `ev` | Ev Hâli | düzen/kaos, ev günü, kişisel alan | 1-2 |
| `para` | Para Alışkanlıkları | harcama keyfi vs biriktirme keyfi (rakamsız) | 2-3 |
| `iletisim` | İletişim & Duygular | tartışma tarzı, alan ihtiyacı, ifade biçimi | 3 |
| `gelecek` | Gelecek & Ufuk | yaşam hayali, şehir, uzun vade, öncelikler | 4 |

Kurallar:

- Kategori kaydı kod tarafında tek kaynak: `src/content/categories.ts` (slug, isim, açıklama, emoji, ağırlıklı seviye aralığı). DB'de `questions.category` bu slug'ı taşır. Ayrı bir DB tablosu MVP'de gerekmez (RLS/grant yükü olmadan içerik koduyla versiyonlanır); ileride admin paneli gelirse tabloya taşınır.
- Alt kategori serbest metindir (`subcategory`), raporlama/çeşitlilik içindir, algoritma zorunlu kullanmaz.
- Mevcut seed'deki Türkçe serbest kategori adları ("Günlük yaşam", "Ritim"...) bu slug'lara migrate edilir.

## 3. İlişki Aşamaları (Seviyeler)

Mevcut 1-4 seviye modeli korunur; her seviyeye kimlik ve oturum karışım kuralı eklenir:

| Seviye | İsim | Kapsam | Yasak bölge |
|---|---|---|---|
| 1 | Tanışma | rehber Bölüm 6'daki güvenli konular | kişisel geçmiş sorgusu |
| 2 | Karakter & Ritim | para *alışkanlıkları*, düzen, sosyal enerji, stres tarzı | ilişki geçmişi |
| 3 | Yakınlaşma | tartışma/özür/alan, mesajlaşma beklentisi, yalnız zaman | üçüncü kişiler, kıyas |
| 4 | Ufuk | uzun vade, çocuk bakışı, şehir/ülke, kariyer-yaşam dengesi | kesin karar dili |

**Oturum karışımı:** Bir oda seviye N ile açıldığında set tamamen N'den oluşmaz; alt seviyelerden ısınma soruları alır (rehberdeki kademeli öz-açılım ilkesinin oturum içi uygulaması):

| Oda seviyesi | Karışım |
|---|---|
| 1 | %100 S1 |
| 2 | %25 S1 + %75 S2 |
| 3 | %15 S1 + %25 S2 + %60 S3 |
| 4 | %10 S1 + %20 S2 + %20 S3 + %50 S4 |

Ek ritim kuralları (peak-end, rehber 14.7):

- İlk 2 soru daima setteki en düşük seviyeden, `fun_score ≥ 4`, `intensity = 1` olmalı (**açılış soruları**).
- Son soru gülümseten bir **kapanış sorusu** olmalı: `fun_score ≥ 4`, `intensity = 1`, tercihen `nostalji`/`hayal` kategorisi.
- Seviye içi yoğunluk (`intensity`, aşağıda) sette kabaca artan eğri çizer; en ağır soru asla ilk üçte ve son sırada olmaz.

## 4. Soru Tipleri

MVP'de mevcut üç tip, DB check'i ile aynı adlarla kalır:

| Tip | DB değeri | Seçenek kuralı | Rehber bölümü |
|---|---|---|---|
| İkilem | `either_or` | tam 2 seçenek, ikisi de cazip | 12 |
| Çoktan seçmeli | `choice` | 3-4 seçenek, eşit çekicilik | 10 |
| Slider | `slider` | sayı gösterilmez; iki uç etiketi zorunlu | 11 |

Oturum tip dağılım hedefi: ~%35 ikilem, ~%45 çoktan seçmeli, ~%20 slider; aynı tipten en fazla 2 art arda.

**Slider veri modeli değişikliği:** Mevcut seed slider'ı `options` içinde `1..5` etiketleri taşıyor — bu, rehberin "sayı asla gösterilmez" kuralını ihlal eder. Yeni model: slider sorularında `options = []`, ölçek `meta.slider = { min: 1, max: 5, lowLabel, highLabel }` olarak taşınır (frontend `Question.lowLabel/highLabel` alanları zaten var). Cevap değeri sayı olarak `answers.answer_value`'da kalır ama UI ve sonuç ekranı sayıyı asla göstermez, mesafeye çevirmez.

**Gelecek tipler** (şimdi tasarla, sonra aç — check constraint genişletilerek eklenir):

- `ranking`: 3-4 öğeyi sıralama (ürün spec'te faz 2). Cevap değeri: id dizisi.
- `guess`: karşı tarafın cevabını tahmin et — iki kişilik yapının en güçlü oyun mekaniği adayı; bir `either_or`/`choice` sorusuna bağlı ikinci adım olarak tasarlanır (`meta.guessFor: <slug>`).
- `open`: açık uçlu, minimum sayıda (spec gereği); cevap kısa metin.

## 5. Trait Kaydı

Trait'ler sistemin iç sözlüğüdür: **kullanıcıya asla gösterilmez, asla puanlanmaz, asla profile dönüştürülmez.** İki işlevi vardır: (a) seçim algoritmasında çeşitlilik (aynı trait art arda gelmez), (b) AI'ya "bu soru neyi görünür kılıyor" bağlamı vermek.

Başlangıç kaydı (`src/content/traits.ts`, kebab-case slug + tek satır açıklama):

- **Enerji & ritim:** `sabah-gece-ritmi`, `enerji-kaynagi` (yalnız/kalabalık şarj), `tempo` (hızlı/sakin)
- **Yenilik & plan:** `spontanlik`, `plan-sevgisi`, `macera-istahi`, `konfor-alani`, `merak-tarzi`
- **Günlük hayat:** `duzen-kaos`, `ritual-bagliligi` (alışkanlıklara bağlılık), `ev-disari-dengesi`
- **Sosyal:** `grup-rolu`, `sosyal-istah`, `mizah-tarzi`, `paylasim-istahi` (deneyimi paylaşma vs içte yaşama)
- **Duygusal (S3+):** `alan-ihtiyaci`, `ifade-tarzi`, `tartisma-tarzi`, `temas-ritmi` (iletişim sıklığı beklentisi)
- **Değer & ufuk (S2-4):** `para-keyif-dengesi`, `risk-istahi`, `koklenme-gocebelik`, `oncelik-puslasi` (kariyer/ilişki/deneyim öncelikleri), `nostalji-bagi`

Kayıt yaşayan bir listedir; yeni soru mevcut trait'e oturmuyorsa önce trait eklenir (tek satır tanımıyla). Kural: bir soru tam bir trait taşır (birincil); ikincil eğilimler `meta.tags` içine yazılabilir.

## 6. Metadata Şeması

İçeriğin tek doğruluk kaynağı repodur: sorular `src/content/questions/` altında TypeScript modülleri olarak yaşar (code review'dan geçer, rehber checklist'i PR'da uygulanır), DB'ye idempotent seed migration'la gider (`insert ... on conflict (slug) do update`). Bu, mevcut "sorular migration'la seed edilir" kararının devamıdır.

```ts
type QuestionContent = {
  slug: string                 // kalıcı kimlik, kebab-case ('gece-yolculugu-teklifi')
  category: CategorySlug       // Bölüm 2
  subcategory?: string         // serbest, raporlama için
  trait: TraitSlug             // Bölüm 5, birincil özellik
  level: 1 | 2 | 3 | 4         // ilişki aşaması
  intensity: 1 | 2 | 3         // seviye İÇİ derinlik: 1 hafif, 3 o seviyenin en derini
  type: 'either_or' | 'choice' | 'slider'
  estSeconds: number           // tahmini cevap süresi (5-30)
  sparkScore: 1 | 2 | 3 | 4 | 5 // sohbet başlatma gücü (tartışma puanı — yazarın kalibre tahmini)
  funScore: 1 | 2 | 3 | 4 | 5  // cevaplama keyfi
  prompt: string               // soru metni, tek nefes
  options?: { id: string; label: string; emoji?: string }[]  // either_or: 2, choice: 3-4
  slider?: { min: number; max: number; lowLabel: string; highLabel: string }
  shuffleOptions: boolean      // seçenek sırası karıştırılabilir mi (sıra yanlılığı, rehber 9.7)
  followupPrompt: string       // sonuç ekranı sohbet önerisi ("Birbirinize ... anlatın")
  aiHint?: string              // AI'ya yorum rehberi ("fark tatlı kontrasttır, kıyaslama")
  qualityNote: string          // "bu soru neden kaliteli" — SADECE repoda kalır, DB'ye gitmez
  status: 'draft' | 'active' | 'retired'
}
```

Notlar:

- `intensity` ile `level` farklıdır: `level` hangi aşamada sorulabileceğini, `intensity` o aşama içindeki ağırlığını söyler. Oturum eğrisi `intensity` ile kurulur.
- `sparkScore`/`funScore` yazar kalibrasyonudur; ileride gerçek kullanım verisiyle (cevap süresi, sonuç ekranında o soruya tıklama) düzeltilebilir.
- İçerik doğrulayıcı (`npm run questions:lint`, basit bir vitest/script) mekanik kuralları zorlar: seçenek sayıları, slider etiket zorunluluğu, prompt uzunluğu (≤ 140 karakter hedef), yasak kelimeler (`normal`, `hâlâ`, `bile`, `en azından` — rehber 14.10), `followupPrompt` zorunluluğu, slug benzersizliği.

## 7. Veritabanı Modeli

Mevcut şema korunur; `questions` genişletilir, `rooms`'a bir kolon eklenir. Taslak migration (onaydan sonra yazılacak):

```sql
alter table public.questions
  add column subcategory text,
  add column trait text not null default 'genel',
  add column intensity smallint not null default 1 check (intensity between 1 and 3),
  add column spark_score smallint check (spark_score between 1 and 5),
  add column fun_score smallint check (fun_score between 1 and 5),
  add column est_seconds smallint not null default 10 check (est_seconds between 3 and 60),
  add column shuffle_options boolean not null default true,
  add column followup_prompt text,
  add column ai_hint text,
  add column meta jsonb not null default '{}'::jsonb;  -- slider ölçeği, tags, guessFor vb.

create index questions_pool_idx on public.questions (is_active, level, trait);

-- Rövanş / seviye atlama zinciri (tekrarsızlık, Bölüm 10)
alter table public.rooms
  add column previous_room_id uuid references public.rooms(id) on delete set null;
```

Kararlar:

- Algoritmanın filtrelediği alanlar (level, trait, intensity, skorlar) **gerçek kolon** (index + check constraint); sunum/uzantı alanları (`slider`, `tags`, `guessFor`) `meta` jsonb içinde. `qualityNote` DB'ye hiç gitmez.
- `followup_prompt` ve `ai_hint` DB'dedir çünkü sonuç ekranı ve gelecekteki AI fonksiyonu bunları okur.
- RLS değişmez: `questions` zaten yalnızca `is_active` satırlar için select'e açık; yeni kolonlar aynı politikayla görünür (gizli alan yok — `qualityNote` repoda kaldığı için sızacak bir şey yok).
- Eski 8 demo sorusu yeni havuz geldiğinde `is_active = false` yapılır (silinmez; `answers` FK'leri `on delete restrict`). Birkaçı rehberi ihlal ediyor (ör. `message-rhythm` slider'ı sayı gösteriyor, `daily-pace` klişeye yakın).
- `room_questions` aynen kalır: seçim oda kurulurken bir kez yapılır, pozisyonla saklanır; iki cihaz aynı seti aynı sırayla görür. Bu tablo aynı zamanda tekrarsızlık sisteminin kalıcı hafızasıdır.

## 8. Soru Seçim Algoritması

Seçim, oda oluşturulurken client'ta (host cihazında) çalışır ve `room_questions`'a yazılır. Girdi: oda seviyesi `L`, soru sayısı `N` (varsayılan 24), dışlama listesi `excluded` (Bölüm 10). Üç faz:

### Faz 1 — Filtre

```
pool = aktif sorular
     - excluded (zincir + cihaz geçmişi)
     where level <= L  (karışım tablosundaki seviyeler)
```

Açlık koruması: bir seviye kotası için havuz yetersizse önce cihaz-geçmişi dışlamaları en eskiden başlayarak gevşetilir, zincir dışlamaları asla gevşetilmez (aynı çiftin gördüğü soru geri gelmez); yine yetmezse kota komşu seviyeye kaydırılır.

### Faz 2 — Katmanlı örnekleme (rastgelelik burada)

1. Karışım tablosundan seviye kotaları hesaplanır (24 soru, oda S2 → 6×S1 + 18×S2).
2. Her seviye kotası için havuz **trait → kategori** gruplanır ve şu kısıtlarla ağırlıksız rastgele (Fisher-Yates üzerinden) çekilir:
   - aynı trait'ten sette en fazla 2 soru,
   - aynı kategoriden sette en fazla 3 soru,
   - tip dağılımı hedefi (%35/%45/%20) ±1 tolerans.
3. Rastgelelik kaynağı `crypto.getRandomValues` (mevcut `randomIndex` altyapısı). Deterministik seed gerekmez çünkü sonuç `room_questions`'a sabitlenir — "rastgelelik oda kurulumunda bir kez, sonrası herkes için aynı".

### Faz 3 — Sıralama (ritim)

1. **Açılış:** en düşük seviyeden, `fun ≥ 4`, `intensity = 1`, tercihen `either_or` olan 2 soru öne.
2. **Kapanış:** `fun ≥ 4`, `intensity = 1`, tercihen `nostalji`/`hayal` olan 1 soru sona.
3. **Orta blok:** kalanlar `level, intensity` artan sıralanır, komşu ağırlıklı hafif karıştırma (jitter) uygulanır ki eğri hissedilsin ama mekanik durmasın.
4. **Onarım geçişi:** liste üzerinde tek geçiş; ihlal gören elemanlar ileriye takas edilir:
   - aynı trait art arda gelmez,
   - aynı kategori art arda gelmez,
   - aynı tip en fazla 2 art arda.
   Takasla çözülemeyen nadir durumda ihlal kabul edilir (kural katılığı > oturum kurulamaması olmasın).

Toplam süre bütçesi kontrolü: `sum(est_seconds)` kişi başı ~5-8 dk bandında değilse `N` kullanıcıya önerilirken uyarlanır (ileride; MVP'de sadece loglanır).

Bu algoritma saf fonksiyon olarak `src/domain/questionSelection.ts`'e yazılır ve unit test edilir (kota, kısıt, onarım senaryoları).

## 9. Rastgele Soru Mantığı (özet ilkeler)

- Rastgelelik **katman içinde** uygulanır; katmanlar (seviye kotası, trait/kategori tavanı, tip dağılımı) deterministik kurallardır. Böylece her oturum farklı hissettirir ama hiçbir oturum "3 slider üst üste, 5 yemek sorusu" gibi bozuk çıkmaz.
- Seçenek sırası: `shuffle_options = true` olan sorularda seçenekler **cevaplama ekranında karıştırılır** ama karıştırma her iki katılımcı için aynı olmalıdır (sonuç ekranında hizalı görünmesi için) → karıştırma seed'i `room_id + question_id` hash'inden türetilir. Slider'da sıra kavramı yok.
- İleride "kullanım dengeleme" (az gösterilen soruya hafif ağırlık) eklenebilir; bunun için server-side `served_count` gerekir (client `questions`'ı update edemez, RLS doğru şekilde engeller). MVP'ye girmez.

## 10. Tekrar Etmeyen Soru Sistemi

Hesap yok, bu yüzden iki katman:

**Katman 1 — Oda zinciri (aynı çift, kesin tekrarsızlık):**
Sonuç ekranına "Bir sonraki seviye" aksiyonu eklenir: yeni oda `previous_room_id` ile eskisine bağlanır. Seçim algoritması zinciri geriye yürür (güvenlik sınırı: 10 halka) ve zincirdeki tüm `room_questions`'ı dışlar. Aynı iki insan uygulamayı seviye seviye oynadıkça hiç soru tekrarı görmez. Hesapsız dünyada çift-kimliği kurmanın en sağlam yolu budur çünkü kimlik "kişi" değil "ortak oda geçmişi"dir.

**Katman 2 — Cihaz geçmişi (aynı kişi, farklı kişilerle, yumuşak tekrarsızlık):**
Host cihazında `localStorage: sohbetlik.seenQuestions = [{slug, lastSeenAt}]`. Oda kurulurken bu liste dışlamaya eklenir. Kurallar:

- 90 günden eski kayıtlar dışlamadan düşer (havuz küçükken açlığı önler; ayrıca "aynı soruyu başka biriyle 3 ay sonra almak" sorun değildir).
- Liste 200 kayıtla sınırlanır (en eski atılır).
- Guest'in geçmişi MVP'de bilinemez (oda kurulduğunda guest henüz yok) — bilinçli kabul; zincir katmanı asıl garantiyi verir.

Havuz açlığında gevşetme sırası Bölüm 8/Faz 1'de tanımlandı.

## 11. Gelecekte AI Analizi

AI (Vercel Function + OpenAI, `NEXT_ACTIONS` Adım 4) yalnızca iki taraf tamamlayınca çalışır. Bu tasarım AI'ya şu zemini hazırlar:

**Girdi inşası** — her cevaplanmış soru için fonksiyona giden paket:

```json
{
  "questionSlug": "...",
  "prompt": "...",
  "trait": "spontanlik",
  "category": "kesif",
  "answers": { "host": "Gece yola çıkarım", "guest": "Sabah erken yola çıkalım derim" },
  "followupPrompt": "...",
  "aiHint": "Fark tatlı bir kontrasttır; kim haklı çerçevesi kurma."
}
```

Cevaplar daima **etiket metni** olarak gider (id/sayı değil); slider cevabı iki uç etiketiyle konuma çevrilir ("'Valizim hazır' ucuna yakın"), asla sayı olarak verilmez.

**Çıktı sözleşmesi** — `result_summaries.summary` jsonb şeması:

```json
{
  "version": 1,
  "highlights": [
    { "kind": "common" | "different" | "curious", "questionSlug": "...", "title": "...", "body": "..." }
  ],
  "talkPrompts": ["Birbirinize ... anlatın"],
  "nextTime": ["Bir sonraki buluşma için ..."]
}
```

`kind` üçlüsü mevcut `ConversationInsight.tone` (`common`/`different`/`prompt`) ile bilinçli olarak hizalıdır; frontend değişimi minimal olur.

**Sert korkuluklar** (system prompt + şema doğrulama ile çift katman):

- Sayı, yüzde, skor, "uyum" kelimesi çıktıda geçemez (regex doğrulama; geçerse yanıt reddedilir ve yeniden üretilir).
- Trait'ler üzerinden toplulaştırma yapılmaz: AI tek tek sorular hakkında konuşur, "genel olarak sen X'sin" profili çıkarmaz.
- Kişi hakkında sıfat kullanılmaz; cevap hakkında konuşulur ("sen sabahcısın" değil, "sabah enerjisi cevabında öne çıkmış").
- `different` daima merak çerçevesinde yazılır; `aiHint` soru bazında bu tonu yönlendirir.

**Veri zemini:** `answers` + `questions` join'i tüm bu paketi tek sorguda üretir; ekstra tablo gerekmez. İleride anonim toplu analiz (hangi soru en çok sohbet üretiyor) `spark_score` kalibrasyonunu besleyebilir — kişi bazlı değil soru bazlı analitik.

## 12. Uygulama Sırası (onay sonrası)

1. `src/content/` iskeleti: `categories.ts`, `traits.ts`, `questions/` + tip tanımları ve `questions:lint` doğrulayıcısı.
2. Migration: `questions` genişletme + `rooms.previous_room_id` + eski 8 sorunun pasifleştirilmesi (Aşama 3 havuzu hazır olduğunda tek migration'da).
3. `src/domain/questionSelection.ts` + unit testler.
4. Aşama 3: İlk Tanışma (S1) soruları — rehber kalite kapısıyla.
5. Repository katmanına zincir dışlaması + cihaz geçmişi entegrasyonu.
6. (Ayrı iş) AI fonksiyonu — `NEXT_ACTIONS` Adım 4 ile birleşir.

Not: Üretim önceliği hâlâ Supabase sync'in canlıya alınması (`NEXT_ACTIONS` Adım 1-3); bu tasarımın implementasyonu onu bloklamaz, migration'lar aynı akışla push edilir.
