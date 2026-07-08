-- Seviye 2 (Karakter & Ritim) soru havuzu.
-- Source of truth: src/content/questions/level2.ts
-- This migration idempotently seeds the same content by slug.

insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
values
  (
    'hesap-geldi', 'para', 'harcama refleksi', 'para-keyif-dengesi', 2, 1, 'either_or',
    'Arkadaş grubuyla güzel bir akşam yemeği. Hesap geldi. Sen hangisisin?',
    '[{"id":"ortala","label":"Ortadan bölelim, hesap yapmasak rahat ederiz"},{"id":"ayri","label":"Herkes kendininki — bir de başkasının şarabını mı ödeyeceğim?"}]'::jsonb,
    4, 4, 8, true,
    'Hesap geldiğinde en tuhaf yaşadığınız anı anlatın. Kim ödedi, nasıl bitti?',
    null,
    '{}'::jsonb
  ),
  (
    'pazar-cimriligi', 'para', 'harcama tercihi', 'para-keyif-dengesi', 2, 2, 'choice',
    'Paranı rahat harcadığın şey hangisi, "buna bu kadar verilmez" dediğin hangisi?',
    '[{"id":"yemek","label":"Yemeğe rahat harcarım, kıyafete \"bu kadar mı?\" derim"},{"id":"deneyim","label":"Deneyime (konser, tatil) harcarım, eşyada hesap yaparım"},{"id":"kiyafet","label":"Güzel bir parçaya yatırım derim, dışarı yemek gereksiz lüks"},{"id":"teknoloji","label":"Teknolojiye gözümü kırpmam, ama takside gideceksem iki kere düşünürüm"}]'::jsonb,
    4, 4, 12, true,
    'En son "buna bu kadar verilir mi?" dediğiniz ama sonra hiç pişman olmadığınız harcama ne?',
    'Harcama tercihi kişilik yansıtır ama doğru/yanlış yoktur; tutumluluğu erdem olarak çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'beklenmedik-para', 'para', 'para psikolojisi', 'risk-istahi', 2, 2, 'choice',
    'Beklenmedik bir yerden güzel bir para geldi. İlk refleksin hangisine daha yakın?',
    '[{"id":"sakla","label":"Hiç yokmuş gibi davranıp kenara koyarım — geleceğe hediye"},{"id":"harca","label":"Bedava para harcanır; ertelemek onu sıkıcı yapar"},{"id":"borc","label":"Önce bir borç/yükümlülük kapatırım, sonra rahat ederim"},{"id":"paylas","label":"Birilerine güzel bir sürpriz yapmak için kullanırım"}]'::jsonb,
    4, 5, 12, true,
    'Beklenmedik gelen paranın en güzel harcandığı anınızı anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'kalabalik-enerji', 'sosyal', 'sosyal enerji yönetimi', 'sosyal-istah', 2, 1, 'slider',
    'Haftalık sosyal enerjin nasıl dağılır?',
    '[]'::jsonb,
    3, 4, 6, false,
    'Bir haftanızı birlikte planlasanız, kaç akşam dışarıda olurdunuz? Üzerinde anlaşın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Haftada bir-iki buluşma yeter, arada şarj lazım","highLabel":"Boş akşam istemem; her gün biri bir yerde"}}'::jsonb
  ),
  (
    'davet-refleksi', 'sosyal', 'plan tercihi', 'spontanlik', 2, 2, 'either_or',
    'Cuma akşamı planın yok. Telefon çaldı: "Yarım saate geliyoruz, hazır ol." Hangisi?',
    '[{"id":"hadi","label":"Tamam! Beş dakikaya hazırım, nereye gidiyoruz?"},{"id":"uyari","label":"Geleceğinizi önceden söyleseniz keşke — ama bu sefer tamam"}]'::jsonb,
    4, 4, 8, true,
    'Son dakika planlarınızdan biri güzel mi bitti, felaket mi? Anlatın.',
    'İki cevap da sosyal birini gösterir; fark sadece hazırlık ihtiyacında.',
    '{}'::jsonb
  ),
  (
    'tartisma-stili', 'sosyal', 'çatışma yönetimi', 'tartisma-tarzi', 2, 2, 'choice',
    'Arkadaşınla bir konuda ters düştünüz. Senin doğal refleksin hangisi?',
    '[{"id":"hemen","label":"Hemen konuşalım — çözülmemiş mesele kafamda büyür"},{"id":"bekle","label":"Biraz bekleyeyim, sakinleşince daha iyi anlatırım"},{"id":"yaz","label":"Yazarak daha iyi ifade ederim; uzun mesaj atacağım"},{"id":"ges","label":"Büyütmem — çoğu şey birkaç gün sonra kendiliğinden ufalar"}]'::jsonb,
    5, 3, 12, true,
    'Tartışma tarzlarınızı kıyaslayın: hanginiz daha çabuk konuşur, hanginiz daha çok bekler?',
    'Dört tarz da sağlıklı olabilir; "kaçınma" veya "yüzleşme sorunu" çerçevesi kurma.',
    '{}'::jsonb
  ),
  (
    'misafir-gelecek', 'ev', 'ev düzeni', 'duzen-kaos', 2, 1, 'either_or',
    'Misafir gelecek diye ev toplamak: sen hangisisin?',
    '[{"id":"panik","label":"Panik temizlik — bu hâlim vitrin modu, yemin ederim"},{"id":"rahat","label":"Olduğu gibi gelsinler; bu kadar yakın değilsek zaten gelmesinler"}]'::jsonb,
    4, 5, 8, true,
    'Misafir gelmeden önce sakladığınız en komik eşya ne? İtiraf turu.',
    null,
    '{}'::jsonb
  ),
  (
    'ortak-alan-kurali', 'ev', 'alan paylaşımı', 'alan-ihtiyaci', 2, 2, 'choice',
    'Biriyle aynı evi paylaşsan, senin için en önemli kural hangisi olurdu?',
    '[{"id":"sessizlik","label":"Sessizlik saatleri — bazı saatler kutsal ve dokunulmaz"},{"id":"mutfak","label":"Mutfak düzeni — bulaşık kuralları evrensel anayasadır"},{"id":"alan","label":"Kişisel alan — benim köşem, benim kurallarım"},{"id":"spontan","label":"Tek kural: kural olmasın, konuşarak çözeriz"}]'::jsonb,
    5, 4, 12, true,
    'Ev arkadaşı hikâyelerinden en iyi ve en kötü senaryoyu paylaşın.',
    'Alan ihtiyacı kişilikle ilgili, olgunlukla değil; kuralcı olmayı olumsuz çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'stres-kacisi', 'ev', 'stres yönetimi', 'enerji-kaynagi', 2, 2, 'choice',
    'Zor bir gün geçirdin, eve geldin. Otomatik pilotun seni nereye götürür?',
    '[{"id":"yatak","label":"Yatağa — uyku çözer, sabah başka gün"},{"id":"mutfak","label":"Mutfağa — bir şeyler pişirmek beni indirir"},{"id":"ekran","label":"Ekrana — beynimi kapatacak bir şey açarım, ne olduğu önemli değil"},{"id":"disari","label":"Tekrar dışarı — yürüyüş, müzik, hareket"}]'::jsonb,
    4, 4, 12, true,
    'Kötü gün ilacınız ne? Birbirinize reçete yazın.',
    null,
    '{}'::jsonb
  ),
  (
    'alarm-iliskisi', 'ritim', 'sabah rutini', 'sabah-gece-ritmi', 2, 1, 'either_or',
    'Sabah alarmınla ilişkin nasıl?',
    '[{"id":"ilk","label":"İlk alarm, hemen kalkarım — erteleyen kim?"},{"id":"ertele","label":"Erteleme butonu benim en yakın arkadaşım; en az üç tur"}]'::jsonb,
    3, 5, 8, true,
    'Sabahları kendinize kaç dakikada insan hissettirirsiniz? Dürüstlük turu.',
    null,
    '{}'::jsonb
  ),
  (
    'hafta-sonu-plani', 'ritim', 'hafta sonu yönetimi', 'plan-sevgisi', 2, 2, 'slider',
    'Hafta sonunu nasıl geçireceğin konusunda neredesin?',
    '[]'::jsonb,
    4, 4, 6, false,
    'Birlikte bir hafta sonu planlasanız: planı kim yapar, kim akışına bırakır?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Cuma akşamı planım hazırdır; saati bile belli","highLabel":"Cumartesi sabahı karar veririm; belki hiçbir şey yapmam"}}'::jsonb
  ),
  (
    'gecikme-itirafi', 'ritim', 'zaman yönetimi', 'tempo', 2, 1, 'choice',
    'Bir buluşmaya gitme vaktin geldi. Sen büyük ihtimalle hangisisin?',
    '[{"id":"erken","label":"On dakika erken: kapıda beklerim, geç kalmaktansa"},{"id":"tam","label":"Dakikasında: ne erken ne geç, bu bir sanattır"},{"id":"gec","label":"\"Yoldayım\" mesajını evden atıyorum — ve bunda pişmanlık yok"}]'::jsonb,
    4, 5, 10, true,
    'En çok geç kaldığınız anınız: ne kadar geç, ne oldu sonra?',
    null,
    '{}'::jsonb
  ),
  (
    'yemek-yapma-hali', 'lezzet', 'mutfak ilişkisi', 'ritual-bagliligi', 2, 1, 'choice',
    'Mutfakla ilişkin hangisine en yakın?',
    '[{"id":"sevgi","label":"Mutfak sevgi dilidir; pişirdiğimi paylaşmak en büyük keyiflerimden"},{"id":"surec","label":"Tarif takibi, malzeme ayarlama — sürecin kendisi meditasyon"},{"id":"hizli","label":"Pratik olsun: makarna, tost, hayatta kal yemekleri"},{"id":"disari","label":"Mutfağım sadece çay ocağı; gerisini dışarıya bırakıyorum"}]'::jsonb,
    4, 4, 12, true,
    'Birbirinize en iyi yaptığınız yemeği ve en büyük mutfak felaketinizi anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'yemek-macerasi', 'lezzet', 'tat macerası', 'merak-tarzi', 2, 2, 'slider',
    'Yeni ve yabancı tatlar konusunda neredesin?',
    '[]'::jsonb,
    3, 4, 6, false,
    'Şimdiye kadar denediğiniz en tuhaf yemeği anlatın. Tekrar yer miydiniz?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Bildiklerim bana yeter; macera başka konularda","highLabel":"Ne kadar tuhaf o kadar iyi; ismi garip olan tabağı isterim"}}'::jsonb
  ),
  (
    'kahvalti-ciddiyeti', 'lezzet', 'günlük ritüel', 'ritual-bagliligi', 2, 1, 'either_or',
    'Kahvaltı senin için ne?',
    '[{"id":"kutsal","label":"Günün en önemli anı — masası, düzeni, ritüeli var"},{"id":"atlanan","label":"Kahve yeter; yemek öğlen başlar benim için"}]'::jsonb,
    3, 4, 8, true,
    'Rüya kahvaltınızı tarif edin: nerede, ne var masada, yanınızda kim?',
    null,
    '{}'::jsonb
  ),
  (
    'kaybolma-refleksi', 'kesif', 'keşif tarzı', 'macera-istahi', 2, 2, 'either_or',
    'Yeni bir şehirdesin, Google Maps bitti. Ne yaparsın?',
    '[{"id":"kaybol","label":"Mükemmel — en iyi keşifler kaybolunca olur"},{"id":"sor","label":"Birine sorarım; kaybolmak romantik değil, zaman kaybı"}]'::jsonb,
    5, 4, 8, true,
    'Bir şehirde gerçekten kaybolduğunuz anı anlatın. Ne buldunuz?',
    'İki yaklaşım da geçerli; "cesaret" ve "korkaklık" çerçevesi kurma.',
    '{}'::jsonb
  ),
  (
    'tatil-butcesi', 'kesif', 'tatil harcaması', 'oncelik-pusulasi', 2, 2, 'choice',
    'Tatilde paranın en çok nereye gittiğini düşünürsün?',
    '[{"id":"konaklama","label":"Güzel kalacak yer — uyku ve konfor tatili yapar"},{"id":"yemek","label":"Yemek ve mekan — o şehrin tadını çıkarmak lazım"},{"id":"deneyim","label":"Aktivite ve deneyimler — uyumaya vakit yok"},{"id":"hepsi","label":"Ucuz kal, ucuz ye, parayı süreye yatır — daha uzun tatil"}]'::jsonb,
    4, 4, 12, true,
    'Birlikte tatil planlasanız bütçeyi neye harcardınız? Üzerinde anlaşın.',
    null,
    '{}'::jsonb
  ),
  (
    'rutin-bozma', 'kesif', 'konfor alanı', 'konfor-alani', 2, 2, 'slider',
    'Rutinini bozmak konusunda neredesin?',
    '[]'::jsonb,
    4, 3, 6, false,
    'En son rutininizi kırdığınızda ne oldu? İyi mi bitti, kötü mü?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Rutinim beni tutar; bozarsam günüm kayar","highLabel":"Aynı şeyi iki hafta yaparsam sıkılırım; değişiklik şart"}}'::jsonb
  ),
  (
    'oneri-direnci', 'kultur', 'tavsiye alma', 'konfor-alani', 2, 1, 'either_or',
    'Biri sana "şu diziyi kesinlikle izle" dedi. İlk refleksin?',
    '[{"id":"hemen","label":"Listeye eklenir, yakında izlerim — tavsiyeye açığım"},{"id":"ters","label":"Bir tık geri çekilirim; herkes izle deyince izleyesim kaçar"}]'::jsonb,
    4, 4, 8, true,
    'Tavsiye üzerine izleyip/okuyup/dinleyip aşık olduğunuz bir şey var mı? Ya da tam tersi?',
    null,
    '{}'::jsonb
  ),
  (
    'tekrar-keyfi', 'kultur', 'tekrar deneyimi', 'nostalji-bagi', 2, 1, 'slider',
    'Aynı filmi, kitabı veya şarkıyı tekrar tekrar deneyimlemek konusunda neredesin?',
    '[]'::jsonb,
    3, 4, 6, false,
    'En çok tekrar ettiğiniz şeyi söyleyin: film, şarkı, kitap, ne olursa. Kaç kez?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"İlk seferden sonra bitmiştir; yeni şeyler bekliyor","highLabel":"En iyi şeyler tekrarla güzelleşir; her seferinde yeni bir şey bulurum"}}'::jsonb
  ),
  (
    'cocukluk-kahramani', 'nostalji', 'ilk etkiler', 'nostalji-bagi', 2, 2, 'choice',
    'Çocukken en çok etkilendiğin karakter nereden geliyordu?',
    '[{"id":"cizgi","label":"Çizgi film / anime — o dünya gerçeğinden iyiydi"},{"id":"kitap","label":"Bir kitap veya hikâye — hayal gücüm orada açıldı"},{"id":"gercek","label":"Gerçek bir insan — aile, öğretmen, sporcu"},{"id":"oyun","label":"Bir oyundaki karakter — kontrol bende olunca daha derindi"}]'::jsonb,
    4, 4, 15, true,
    'O karakterin/kişinin size bıraktığı en büyük iz ne? Birbirinize anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'paralel-hayat', 'hayal', 'alternatif benlik', 'oncelik-pusulasi', 2, 2, 'choice',
    'Paralel bir evrende bambaşka bir hayat yaşıyorsun. Hangisi olsa "aa, o da bendim ha" derdin?',
    '[{"id":"sanatci","label":"Küçük bir kasabada atölye açmış bir sanatçı"},{"id":"gezgin","label":"Sırt çantalı, evden eve sürüklenen bir gezgin"},{"id":"akademik","label":"Bir üniversitede tuhaf bir konu araştıran akademisyen"},{"id":"isletme","label":"Kendi küçük işletmesini kurmuş, rutini olan biri"}]'::jsonb,
    5, 5, 15, true,
    'Paralel hayatınızın bir gününü detaylıca anlatın. Sabahtan akşama ne yapıyorsunuz?',
    null,
    '{}'::jsonb
  ),
  (
    'erteleme-sanati', 'itiraf', 'erteleme alışkanlığı', 'tempo', 2, 1, 'either_or',
    'Yapılacaklar listende bir şey var, son gün yarın. Sen hangisisin?',
    '[{"id":"erken","label":"Çoktan bitti; son güne bırakmak bana stres verir"},{"id":"son-gece","label":"Son gece mucizesi — baskı altında parlıyorum"}]'::jsonb,
    3, 5, 8, true,
    'Ertelemenin sizi en çok kurtardığı veya en çok batırdığı anı anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'heyecan-paylasma', 'iletisim', 'ifade tarzı', 'ifade-tarzi', 2, 2, 'slider',
    'Bir şeyi çok sevdiğinde bunu gösterme tarzın nereye yakın?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Son zamanlarda sizi heyecanlandıran bir şeyi anlatın; nasıl anlattığınıza da bakın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Sessizce sahiplenirim; detayları sonra açılır","highLabel":"Hemen anlatırım; heyecanım odada dolaşır"}}'::jsonb
  )
on conflict (slug) do update set
  category = excluded.category,
  subcategory = excluded.subcategory,
  trait = excluded.trait,
  level = excluded.level,
  intensity = excluded.intensity,
  type = excluded.type,
  prompt = excluded.prompt,
  options = excluded.options,
  spark_score = excluded.spark_score,
  fun_score = excluded.fun_score,
  est_seconds = excluded.est_seconds,
  shuffle_options = excluded.shuffle_options,
  followup_prompt = excluded.followup_prompt,
  ai_hint = excluded.ai_hint,
  meta = excluded.meta,
  is_active = true;
