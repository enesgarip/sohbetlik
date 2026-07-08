-- Seviye 3 (Yakınlaşma) ve Seviye 4 (Ufuk) soru havuzları.
-- Source of truth: src/content/questions/level3.ts, src/content/questions/level4.ts
-- This migration idempotently seeds the same content by slug.

-- ============ LEVEL 3 ============

insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
values
  (
    'ozur-dili', 'iletisim', 'özür biçimi', 'ifade-tarzi', 3, 1, 'either_or',
    'Bir yakının kırıldığında, senin doğal özür dilin hangisi?',
    '[{"id":"sozcuk","label":"Sözcüklerle — ne hissettiğimi, neden üzgün olduğumu açıkça söylerim"},{"id":"eylem","label":"Eylemle — konuşmak yerine bir şey yaparım, jest gösteririm"}]'::jsonb,
    5, 4, 8, true,
    'Bir özrün sizi gerçekten rahatlatması için ne gerekir? Birbirinize anlatın.',
    'İki dil de samimi; sözcük dilini daha olgun gösterme.',
    '{}'::jsonb
  ),
  (
    'duygu-termometresi', 'iletisim', 'duygusal ifade', 'ifade-tarzi', 3, 2, 'slider',
    'Bir şey seni üzdüğünde çevrendekiler ne kadar fark eder?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Birbirinizin "bir şeyler var" işaretlerini tahmin edin. Nelere bakarsınız?',
    'İki uç da bir iletişim biçimi; içe kapanmayı sorun olarak çerçeveleme.',
    '{"slider":{"min":1,"max":5,"lowLabel":"Pek belli etmem; kendi içimde işlerim","highLabel":"Yüzümden okunur; saklamayı beceremem zaten"}}'::jsonb
  ),
  (
    'destek-ihtiyaci', 'iletisim', 'destek beklentisi', 'alan-ihtiyaci', 3, 2, 'choice',
    'Kötü bir gün geçirdin. Sana en iyi gelen destek hangisi?',
    '[{"id":"dinle","label":"Sadece dinle, çözüm önerme — anlaşıldığımı hissetmek yeter"},{"id":"cozum","label":"Birlikte çözüm düşünelim — harekete geçmek rahatlatır beni"},{"id":"alan","label":"Beni rahat bırak — biraz kendi kendime toparlayınca gelirim"},{"id":"dikkat","label":"Dikkatimi dağıt — konuşmadan güzel bir şey yapalım"}]'::jsonb,
    5, 3, 12, true,
    'Bu dört yoldan hangisi en çok işinize yarar? Birbirinize "beni böyle destekle" rehberi verin.',
    'Dört ihtiyaç da sağlıklı; "alan isteme" yi kaçınma olarak yorumlama.',
    '{}'::jsonb
  ),
  (
    'enerji-siniri', 'sosyal', 'sosyal sınır', 'alan-ihtiyaci', 3, 1, 'either_or',
    'Çok sevdiğin insanlarla bile "yeter, biraz yalnız kalmalıyım" anın olur mu?',
    '[{"id":"olur","label":"Kesinlikle — sevmekle sürekli birlikte olmak farklı şeyler"},{"id":"nadir","label":"Pek olmaz; sevdiğim insanlar beni yormaz, aksine şarj eder"}]'::jsonb,
    4, 4, 8, true,
    '"Yeter" sinyalinizi nasıl verirsiniz? Birbirinize ipuçlarınızı söyleyin.',
    null,
    '{}'::jsonb
  ),
  (
    'kiskanclik-termometresi', 'sosyal', 'kıskançlık eşiği', 'temas-ritmi', 3, 2, 'slider',
    'Yakın ilişkilerinde kıskançlık eşiğin nerede?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Kıskançlık hissettiren bir an yaşadınız mı? Ne yaptınız?',
    'İki uç da sahiplenilebilir; sahipleniciyi olumsuz, rahatı kayıtsız gösterme.',
    '{"slider":{"min":1,"max":5,"lowLabel":"Çok rahatım; güvendiğim kişi istediği yere gider","highLabel":"Biraz sahiplenici olabilirim; önemsemek böyle bir şey"}}'::jsonb
  ),
  (
    'cevapsiz-mesaj', 'sosyal', 'iletişim beklentisi', 'temas-ritmi', 3, 2, 'choice',
    'Önemsediğin biri mesajına saatlerdir cevap vermedi. Kafandan ne geçer?',
    '[{"id":"mesgul","label":"Meşguldür — herkesin kendi hayatı var, döner bir yerden"},{"id":"merak","label":"Bir şey mi oldu acaba? Hafif bir merak başlar"},{"id":"tedirgin","label":"Acaba bir şey mi yaptım? Kafamda senaryolar döner"},{"id":"tekrar","label":"Bir mesaj daha atarım; belki görmemiştir"}]'::jsonb,
    5, 4, 12, true,
    'Mesaj beklentinizi açıkça konuşun: ne kadar sürede cevap bekliyorsunuz?',
    'Dört tepki de insani; tedirginliği güvensizlik olarak etiketleme.',
    '{}'::jsonb
  ),
  (
    'birlikte-sessizlik', 'ev', 'birlikte vakit', 'enerji-kaynagi', 3, 1, 'either_or',
    'Sevdiğin biriyle aynı evdesin, ikiniz de ayrı şeylerle meşgul, sessizlik var. Bu an senin için ne?',
    '[{"id":"ideal","label":"Tam da bu — aynı yerde olmak yeter, sürekli konuşmak gerekmez"},{"id":"eksik","label":"Bir şeyler yapalım istiyorum; yan yana ama ayrı olmak bana az gelir"}]'::jsonb,
    4, 4, 8, true,
    'Birlikte sessizlik sizin için ne ifade ediyor? Aynı şeyi mi hissediyorsunuz?',
    null,
    '{}'::jsonb
  ),
  (
    'ev-kural-catismasi', 'ev', 'çatışma çözümü', 'tartisma-tarzi', 3, 2, 'choice',
    'Birlikte yaşadığın biriyle ufak bir ev meselesi üzerine ters düştünüz. Doğal refleksin?',
    '[{"id":"hemen","label":"O an konuşurum — küçük şeyler birikmeden çözülmeli"},{"id":"yaz","label":"Not alır, uygun bir anda derli toplu anlatırım"},{"id":"uyum","label":"Çoğu şeyde uyum sağlarım; kavga etmeye değmez"},{"id":"espri","label":"Espriyle açarım; gerginliği düşürüp öyle konuşuruz"}]'::jsonb,
    4, 3, 12, true,
    'Ev içi anlaşmazlıklarda "benim kırmızı çizgim" dediğiniz konu ne?',
    'Dört stil de olgun olabilir; uyum sağlamayı pasiflik olarak çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'yalniz-zaman-ihtiyaci', 'ev', 'kişisel zaman', 'enerji-kaynagi', 3, 2, 'slider',
    'Haftada ne kadar "tamamen yalnız" zamana ihtiyaç duyarsın?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Yalnız zamanınızda ne yaparsınız? Birbirinize "dokunulmaz saatinizi" anlatın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Pek duymam; birisi varsa daha iyi","highLabel":"Düzenli yalnız zamanım olmazsa performansım düşer"}}'::jsonb
  ),
  (
    'stres-sinyali', 'ritim', 'stres yönetimi', 'konfor-alani', 3, 1, 'choice',
    'Stresli bir dönemde çevrendekiler senden ilk neyi fark eder?',
    '[{"id":"sessiz","label":"Sessizleşirim — konuşmam azalır, kendi kabuğuma çekilirim"},{"id":"hizli","label":"Hızlanırım — çok iş yapar, çok hareket eder, duramam"},{"id":"gergin","label":"Sabırsızlaşırım — küçük şeylere bile tepki veririm"},{"id":"kontrol","label":"Her şeyi kontrol etmeye çalışırım — listeler, planlar, düzen"}]'::jsonb,
    4, 4, 12, true,
    'Birbirinizin stres sinyallerini öğrenin: "beni böyle görürsen, o gün zor geçiyor demektir."',
    null,
    '{}'::jsonb
  ),
  (
    'karar-verme-hizi', 'ritim', 'karar mekanizması', 'tempo', 3, 2, 'either_or',
    'Önemli bir karar vereceksin. Sen hangisisin?',
    '[{"id":"hizli","label":"İçgüdüme güvenirim; düşündükçe kafam karışır, hızlı karar iyidir"},{"id":"yavas","label":"Her açıdan tartarım; acele karar pişmanlık getirir"}]'::jsonb,
    4, 4, 8, true,
    'En zor kararınız ne oldu? Nasıl verdiniz, pişman oldunuz mu?',
    null,
    '{}'::jsonb
  ),
  (
    'degisim-refleksi', 'ritim', 'değişime uyum', 'konfor-alani', 3, 2, 'slider',
    'Hayatında beklenmedik bir değişiklik olduğunda ilk tepkin nereye düşer?',
    '[]'::jsonb,
    3, 3, 6, false,
    'Hayatınızı en çok değiştiren beklenmedik olay ne oldu? İyi mi bitti?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Tedirginlik — bildik düzenim bozulmasın","highLabel":"Heyecan — değişiklik yeni kapılar açar"}}'::jsonb
  ),
  (
    'para-konusmak', 'para', 'para iletişimi', 'para-keyif-dengesi', 3, 2, 'either_or',
    'Yakın biriyle para konusunu açmak senin için nasıl?',
    '[{"id":"rahat","label":"Rahat — para da hayatın bir parçası, konuşulur"},{"id":"zor","label":"Biraz zor — para konuşmak beni hep tedirgin eder"}]'::jsonb,
    5, 3, 8, true,
    'Para konusunda birbirinize sormaktan çekindiğiniz bir soru var mı?',
    'İki tutum da anlaşılabilir; para konuşmaktan kaçınmayı olgunluk eksikliği olarak çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'guvenlik-hissi', 'para', 'finansal güvenlik', 'risk-istahi', 3, 2, 'choice',
    'Finansal güvenlik hissi senin için nereden gelir?',
    '[{"id":"birikim","label":"Kenarda yeterli birikim — beklenmedik durumlar için hazır olmak"},{"id":"gelir","label":"Düzenli gelir — gelen bildikçe rahatım, birikime takılmam"},{"id":"yetenek","label":"Kendime güven — ne olursa olsun bir şekilde çözerim"},{"id":"az","label":"Az ihtiyaçla yaşamak — harcamam azsa endişem de az"}]'::jsonb,
    4, 3, 12, true,
    'Finansal olarak en rahat hissettiğiniz dönem hangisiydi? Neden?',
    null,
    '{}'::jsonb
  ),
  (
    'hediye-dili', 'para', 'hediye alışkanlığı', 'paylasim-istahi', 3, 1, 'choice',
    'Birine hediye alırken sen hangisisin?',
    '[{"id":"ararken","label":"Haftalarca araştırır, mükemmeli bulana kadar almam"},{"id":"spontan","label":"Gördüm, hatırladım, aldım — plansız hediye en iyisi"},{"id":"pratik","label":"İşe yarar bir şey alırım; sembolik hediye bana anlamsız gelir"},{"id":"deneyim","label":"Eşya almam; birlikte bir şey yapmaya davet ederim"}]'::jsonb,
    4, 5, 12, true,
    'Aldığınız veya aldığınız en unutulmaz hediye ne? Birbirinize anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'uzun-yol-testi', 'kesif', 'seyahat uyumu', 'sabah-gece-ritmi', 3, 1, 'either_or',
    'Uzun bir yolculukta araç kullanan sensin. Yanındaki uyuya kaldı. Tepkin?',
    '[{"id":"normal","label":"Uyusun, müziğim var — yalnız sürmek de keyifli"},{"id":"durt","label":"Hafifçe dürtürüm — yolculuğun güzelliği sohbetteydi"}]'::jsonb,
    4, 5, 8, true,
    'Uzun yolculuklarda en iyi anınız ne oldu? Yol hikâyesi turu.',
    null,
    '{}'::jsonb
  ),
  (
    'farkli-tatil-beklentisi', 'kesif', 'beklenti yönetimi', 'tartisma-tarzi', 3, 2, 'choice',
    'Birlikte tatile çıktınız ama beklentileriniz çok farklı çıktı. Sen ne yaparsın?',
    '[{"id":"uyum","label":"Uyum sağlarım — tatil kavga edilecek yer değil"},{"id":"ortayol","label":"Orta yol ararım — bir gün senin planın, bir gün benim"},{"id":"konusma","label":"Açıkça konuşurum — beklentileri paylaşmadan çözüm olmaz"},{"id":"ayril","label":"Birkaç saat ayrı takılırız — herkes kendi keyfine baksın, akşam buluşuruz"}]'::jsonb,
    5, 4, 12, true,
    'Tatilde beklenti çatışması yaşadınız mı? Nasıl çözdünüz?',
    null,
    '{}'::jsonb
  ),
  (
    'yemek-tartismasi', 'lezzet', 'yemek kararı', 'tempo', 3, 1, 'either_or',
    '"Bu akşam ne yiyelim?" sorusunda sen hangisisin?',
    '[{"id":"onerici","label":"Hemen üç seçenek sunarım — birisi seçsin, konu kapansın"},{"id":"fark-etmez","label":"\"Fark etmez, sen seç\" derim — sonra önerilenlerin yarısını reddederim"}]'::jsonb,
    4, 5, 8, true,
    '"Ne yiyelim" tartışmasının en uzun sürdüğü anınız? Sonunda ne yediniz?',
    null,
    '{}'::jsonb
  ),
  (
    'mutfak-paylasimi', 'lezzet', 'birlikte pişirme', 'grup-rolu', 3, 2, 'choice',
    'Biriyle birlikte yemek yapıyorsunuz. Mutfaktaki doğal rolün hangisi?',
    '[{"id":"sef","label":"Şef — tarifi ben yönetirim, sen doğra"},{"id":"yardimci","label":"Mutlu yardımcı — söyle ne yapayım, orada olayım yeter"},{"id":"kendi","label":"Herkes kendi alanında — sen salatanı yap, ben sosumu yapayım"},{"id":"sohbet","label":"Ben tezgâhta oturup sohbet ederim; moral desteği de destektir"}]'::jsonb,
    4, 4, 12, true,
    'Birlikte bir yemek yapın! Ne pişireceksiniz, rolleri şimdiden bölün.',
    null,
    '{}'::jsonb
  ),
  (
    'spoiler-politikasi', 'kultur', 'paylaşım alışkanlığı', 'paylasim-istahi', 3, 1, 'either_or',
    'Harika bir dizi/film izledin. Karşındaki henüz izlememiş. Ne yaparsın?',
    '[{"id":"dikkatli","label":"Ağzımı sıkı tutarım — spoiler vermek suçtur"},{"id":"heyecan","label":"Dayanamam; \"bir şey söylemeyeceğim ama...\" diye başlarım"}]'::jsonb,
    3, 5, 8, true,
    'En büyük spoiler facianızı anlatın: kim verdi, ne oldu?',
    null,
    '{}'::jsonb
  ),
  (
    'birlikte-izleme-kurali', 'kultur', 'birlikte deneyim', 'grup-rolu', 3, 2, 'choice',
    'Birlikte bir dizi izliyorsunuz. Karşındaki bir bölüm öne geçti. Tepkin?',
    '[{"id":"ihanet","label":"İhanet! Birlikte başladık, birlikte biter"},{"id":"anlayis","label":"Anlayışla karşılarım, ama spoiler verirse... o ayrı"},{"id":"katilir","label":"Ben de öne geçerim; artık herkes kendi hızında"}]'::jsonb,
    4, 4, 12, true,
    'Birlikte izleme kuralınız ne olurdu? Bir "dizi anayasası" yazın.',
    null,
    '{}'::jsonb
  ),
  (
    'ileri-geri', 'hayal', 'zaman tercihi', 'nostalji-bagi', 3, 2, 'either_or',
    'Geçmişte bir anı yeniden yaşamak mı, gelecekte bir günü şimdiden görmek mi?',
    '[{"id":"gecmis","label":"Geçmişe — o anı bir kere daha hissetmek isterim"},{"id":"gelecek","label":"Geleceğe — merak öldürür; bir bakış yeter"}]'::jsonb,
    5, 4, 10, true,
    'Hangi anı tekrar yaşardınız veya hangi günü görmek isterdiniz? Detaylarıyla anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'zihin-okuma', 'hayal', 'empati derinliği', 'risk-istahi', 3, 2, 'slider',
    'Bir günlüğüne zihin okuyabilsen — ama karşındaki de seninkini okuyabilse — ister misin?',
    '[]'::jsonb,
    5, 4, 6, false,
    'Birbirinizin hangi düşüncesini merak ediyorsunuz? Şimdi sorun!',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Hayır — bazı düşünceler kişiye özel kalmalı","highLabel":"Evet — tam şeffaflık özgürleştirici olurdu"}}'::jsonb
  ),
  (
    'eski-arkadas', 'nostalji', 'arkadaşlık geçmişi', 'nostalji-bagi', 3, 2, 'choice',
    'Yıllar önce çok yakın olduğun ama artık görüşmediğin biri var. Bu durum seni nasıl etkiler?',
    '[{"id":"huzun","label":"Hafif bir hüzün — keşke devam etseydi ama hayat öyle"},{"id":"kabul","label":"İnsanlar gelir gider; her dönemin insanları farklı, bu doğal"},{"id":"arama","label":"Arada aklıma gelir, bir gün aramayı düşünürüm — ama hiç aramam"},{"id":"kapali","label":"O sayfa kapandı; geriye bakmam, ileri yürürüm"}]'::jsonb,
    4, 3, 15, true,
    'Özlediğiniz ama aramadığınız biri var mı? Neden aramadınız?',
    'Dört tepki de insani ve meşru; "kapali" seçeneğini soğukluk olarak çerçeveleme.',
    '{}'::jsonb
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

-- ============ LEVEL 4 ============

insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
values
  (
    'bes-yil-sonra', 'gelecek', 'hayat vizyonu', 'oncelik-pusulasi', 4, 1, 'either_or',
    'Beş yıl sonra kendini hayal ettiğinde, hangisi daha net beliriyor?',
    '[{"id":"yer","label":"Nerede yaşadığım — şehir, ev, çevre"},{"id":"ne","label":"Ne yaptığım — iş, proje, uğraş"}]'::jsonb,
    5, 4, 10, true,
    'Beş yıl sonrasını birbirinize anlat. Resimde neler var?',
    null,
    '{}'::jsonb
  ),
  (
    'birlikte-buyume', 'gelecek', 'ilişkide gelişim', 'temas-ritmi', 4, 2, 'choice',
    'Uzun süreli bir ilişkide "birlikte büyümek" senin için ne anlama gelir?',
    '[{"id":"hedef","label":"Ortak hedeflere doğru birlikte ilerlemek"},{"id":"alan","label":"Birbirimize alan verip kendi yolumuzu bulmak, ama yan yana"},{"id":"donusum","label":"Birbirimizi dönüştürmek — ben sensiz başka biri olurdum"},{"id":"destek","label":"Birbirimizin en zor zamanlarında yanında durmak"}]'::jsonb,
    5, 3, 12, true,
    'Sizi en çok büyüten ilişki deneyiminiz ne oldu?',
    null,
    '{}'::jsonb
  ),
  (
    'uzun-vade-temposu', 'gelecek', 'tempo tercihi', 'koklenme-gocebelik', 4, 2, 'slider',
    'Uzun vadede hayatının temposunu nereye ayarlamak istersin?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Hayat temposunu birbirinize anlatın: ideal bir haftanız nasıl görünür?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Sakin ve öngörülebilir — rutin beni rahatlatır","highLabel":"Hareketli ve değişken — monotonluk beni boğar"}}'::jsonb
  ),
  (
    'tartisma-sonrasi', 'iletisim', 'çatışma sonrası', 'tartisma-tarzi', 4, 2, 'choice',
    'Yakın biriyle ciddi bir tartışma yaşadıktan sonra ilk ne yaparsın?',
    '[{"id":"mesafe","label":"Mesafe koyarım — soğuyunca daha sağlıklı konuşurum"},{"id":"cozum","label":"Hemen çözmeye çalışırım — yarına taşımak istemem"},{"id":"yaz","label":"Yazarım — ne hissettiğimi kelimelerle ifade etmek bana iyi gelir"},{"id":"hareket","label":"Yürüyüşe çıkarım veya bir şey yaparım — fiziksel olarak boşalmam lazım"}]'::jsonb,
    5, 3, 12, true,
    'Tartışma sonrası birbirinize nasıl yaklaşılmasını istersiniz? Şimdi konuşun.',
    'Dört yol da olgun başa çıkma mekanizması; mesafe koymayı kaçış olarak çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'affetme-esigi', 'iletisim', 'affetme', 'ifade-tarzi', 4, 3, 'slider',
    'Affetme eşiğin nerede? Güvendiğin biri seni kırdığında...',
    '[]'::jsonb,
    5, 2, 6, false,
    'Affetmekte zorlandığınız bir anınız var mı? Nasıl başa çıktınız?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Kolay affederim; herkes hata yapar, taşımam","highLabel":"Zor affederim; güven bir kere kırılınca tamiri uzun sürer"}}'::jsonb
  ),
  (
    'duygu-paylasimi', 'iletisim', 'duygusal açıklık', 'ifade-tarzi', 4, 2, 'either_or',
    'Zor bir döneminden geçerken, çevrendekilere ne kadar açılırsın?',
    '[{"id":"acik","label":"Paylaşırım — yükü bölmek hafifletir, yalnız taşımak yorar"},{"id":"kapali","label":"Kendi içimde çözerim — başkalarını yormak istemem"}]'::jsonb,
    5, 3, 8, true,
    'Zor zamanınızda yanınızda kim olmasını istersiniz? Neden?',
    null,
    '{}'::jsonb
  ),
  (
    'sosyal-cember-gelecek', 'sosyal', 'sosyal vizyon', 'grup-rolu', 4, 2, 'either_or',
    'On yıl sonra sosyal çevren nasıl görünsün istersin?',
    '[{"id":"dar","label":"Az ama derin — birkaç kişiyle güçlü bağlar"},{"id":"genis","label":"Geniş ve çeşitli — farklı dünyalardan insanlar"}]'::jsonb,
    4, 3, 8, true,
    'İdeal sosyal çevrenizde kimler var? Birbirinize hayalinizi çizin.',
    null,
    '{}'::jsonb
  ),
  (
    'yakinlarla-sinir', 'sosyal', 'sınır koyma', 'alan-ihtiyaci', 4, 3, 'choice',
    'Aile veya çok yakın bir arkadaş sınırlarını aştığında ne yaparsın?',
    '[{"id":"acik","label":"Açıkça söylerim — yakınlık sınırsızlık demek değil"},{"id":"yumusak","label":"Yumuşak ama kararlı bir şekilde mesafe koyarım"},{"id":"katlan","label":"Bir süre katlanırım; ama birikince patlarım"},{"id":"uzak","label":"Sessizce uzaklaşırım — çatışma istemem"}]'::jsonb,
    5, 3, 12, true,
    'Sınır koyma konusunda zorlandığınız bir durum yaşadınız mı? Nasıl çözdünüz?',
    'Dört tepki de gerçekçi; sessiz uzaklaşmayı pasiflik olarak etiketleme.',
    '{}'::jsonb
  ),
  (
    'komsu-etkisi', 'sosyal', 'çevre etkisi', 'alan-ihtiyaci', 4, 1, 'slider',
    'Yaşadığın yerdeki komşularını / mahalleliyi ne kadar önemsersin?',
    '[]'::jsonb,
    3, 4, 6, false,
    'Komşularınızla en güzel anınız ne oldu?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Pek etkilemez; evimin içi yeter","highLabel":"Çok önemli; mahalle benim uzantım"}}'::jsonb
  ),
  (
    'ev-hayali', 'ev', 'ev vizyonu', 'koklenme-gocebelik', 4, 1, 'either_or',
    'İdeal evin nasıl bir yer?',
    '[{"id":"sabit","label":"Bir yere kök salmış; bahçesi, raflarında yılların birikimleri olan bir ev"},{"id":"hafif","label":"Taşınmaya hazır; esnek, hafif, dünyanın her yerinde olabilecek bir yer"}]'::jsonb,
    4, 4, 8, true,
    'İdeal evinizi birbirinize çizin: nerede, nasıl, neye bakıyor?',
    null,
    '{}'::jsonb
  ),
  (
    'ev-sorumluluk', 'ev', 'sorumluluk paylaşımı', 'tartisma-tarzi', 4, 2, 'choice',
    'Birlikte yaşandığında ev içi sorumluluklar nasıl bölünmeli?',
    '[{"id":"esit","label":"Eşit ve net — kim ne yapıyor, belli olsun"},{"id":"guclu","label":"Herkes güçlü olduğu işi üstlensin — adalet eşitlik değil"},{"id":"donusum","label":"Dönüşümlü — alışkanlık olmasın, herkes her işi bilsin"},{"id":"dogal","label":"Doğal akışına bıraksın — liste tutmak ilişkiye zarar verir"}]'::jsonb,
    4, 3, 12, true,
    'Ev işi paylaşımında en çok neye önem verirsiniz? Birbirinize söyleyin.',
    null,
    '{}'::jsonb
  ),
  (
    'cocuk-bakisi', 'ev', 'aile vizyonu', 'konfor-alani', 4, 3, 'choice',
    'Çocuk konusu senin için şu an nerede duruyor?',
    '[{"id":"evet","label":"İstiyorum — hayatımda çocuk olsun istiyorum"},{"id":"belki","label":"Belki — şartlara ve zamana bağlı, şu an net değilim"},{"id":"hayir","label":"İstemiyorum — çocuksuz bir hayat benim için tam"},{"id":"dusunmedim","label":"Henüz ciddi düşünmedim — çok erken"}]'::jsonb,
    5, 2, 15, true,
    'Bu konuyu açıkça konuşmak size nasıl hissettirdi? Devam edin.',
    'Dört cevap da meşru ve saygıyla karşılanmalı; hiçbir tercihi üstün gösterme.',
    '{}'::jsonb
  ),
  (
    'para-ve-ozgurluk', 'para', 'para-özgürlük ilişkisi', 'para-keyif-dengesi', 4, 2, 'either_or',
    'Para sana ne veriyor aslında?',
    '[{"id":"guvenlik","label":"Güvenlik — rahat bir gelecek, beklenmedik durumlar için hazırlık"},{"id":"ozgurluk","label":"Özgürlük — istediğimi yapabilmek, \"hayır\" diyebilmek"}]'::jsonb,
    5, 3, 8, true,
    'Paradan bağımsız olsanız, ilk ne yapardınız?',
    null,
    '{}'::jsonb
  ),
  (
    'finansal-ortaklik', 'para', 'finansal paylaşım', 'para-keyif-dengesi', 4, 3, 'choice',
    'Uzun süreli bir ilişkide parasal konular nasıl yönetilmeli?',
    '[{"id":"ortak","label":"Ortak hesap — her şey şeffaf, birlikte yönetelim"},{"id":"ayri","label":"Ayrı hesaplar — herkesin kendi parası, ortak giderler bölünür"},{"id":"karma","label":"Karma — ortak giderler için bir havuz, geri kalanı kişisel"},{"id":"onemli-degil","label":"Çok erken konuşmak için — önce güven inşa edilmeli"}]'::jsonb,
    5, 2, 12, true,
    'Finansal şeffaflık sizin için ne anlama geliyor? Birbirinize anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'kariyer-iliski-dengesi', 'ritim', 'kariyer-ilişki', 'tempo', 4, 2, 'slider',
    'Kariyer ve ilişki arasındaki dengeyi nereye koyarsın?',
    '[]'::jsonb,
    5, 3, 6, false,
    'Kariyeriniz için bir ilişkiden vazgeçer misiniz? Ya da tam tersi?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"İlişki öncelik — kariyer hayatın bir parçası ama merkezi değil","highLabel":"Kariyer öncelik — kendimi gerçekleştirmem ilişkiden önce gelir"}}'::jsonb
  ),
  (
    'emeklilik-hayali', 'ritim', 'uzun vade ritim', 'risk-istahi', 4, 1, 'either_or',
    'Emeklilik hayalin hangisine daha yakın?',
    '[{"id":"huzur","label":"Sakin bir köşede, bahçeyle, kitaplarla, huzurlu bir yaşam"},{"id":"macera","label":"Dünyayı gezmek, yeni işler denemek — emeklilik durma değil, yön değiştirme"}]'::jsonb,
    4, 4, 8, true,
    'Emeklilik yaşınızda yanınızda ne olsun istersiniz? Birbirinize anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'yasanacak-sehir', 'kesif', 'yaşam yeri', 'enerji-kaynagi', 4, 2, 'choice',
    'Yaşanacak şehri seçerken senin için en belirleyici ne?',
    '[{"id":"aile","label":"Aileme ve sevdiklerime yakınlık"},{"id":"kariyer","label":"Kariyer fırsatları ve profesyonel gelişim"},{"id":"yasam","label":"Yaşam kalitesi — doğa, iklim, sakinlik"},{"id":"kultur","label":"Kültürel zenginlik — etkinlikler, çeşitlilik, enerji"}]'::jsonb,
    5, 4, 12, true,
    'Hayalinizdeki şehri birbirinize tarif edin. Aynı yer mi çıkıyor?',
    null,
    '{}'::jsonb
  ),
  (
    'yurt-disi-yasam', 'kesif', 'göç düşüncesi', 'risk-istahi', 4, 2, 'slider',
    'Yurt dışında yaşamak senin için ne kadar cazip?',
    '[]'::jsonb,
    5, 3, 6, false,
    'Yurt dışında yaşasanız nereyi seçerdiniz? Neden?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Tatil için güzel ama yaşamak istediğim yer burası","highLabel":"Çok cazip — doğru fırsat olsa hemen giderim"}}'::jsonb
  ),
  (
    'ozel-gun-sofrasi', 'lezzet', 'kutlama tercihi', 'paylasim-istahi', 4, 1, 'either_or',
    'Özel bir günü kutlarken sofra nasıl olsun?',
    '[{"id":"ozel","label":"İki kişilik, özenli, sessiz bir akşam yemeği"},{"id":"kalabalik","label":"Sevdiklerimiz de olsun; kutlama paylaşınca güzel"}]'::jsonb,
    4, 5, 8, true,
    'En güzel kutlamanız nasıl oldu? Birbirinize en iyi sofra anınızı anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'yemek-mirasi', 'lezzet', 'aile mirası', 'nostalji-bagi', 4, 2, 'choice',
    'Aileden gelen bir yemek geleneğin var mı? Bu gelenek senin için ne ifade ediyor?',
    '[{"id":"devam","label":"Var ve devam ettiriyorum — beni aileme bağlayan bir köprü"},{"id":"ozlem","label":"Var ama artık yapmıyorum — özlemle hatırlarım"},{"id":"yok","label":"Pek yok — ama kendi geleneklerimi kurmak istiyorum"},{"id":"onemli-degil","label":"Yemek benim için gelenek aracı değil; yakınlığı başka yerde bulurum"}]'::jsonb,
    4, 4, 12, true,
    'Birbirinize bir aile yemeği tarif edin. Tadını ve hikâyesini anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'sanat-etkisi', 'kultur', 'kültürel etki', 'paylasim-istahi', 4, 2, 'choice',
    'Bir film, kitap veya şarkı seni derinden etkilediğinde ne olur?',
    '[{"id":"paylas","label":"Herkese anlatırım — \"bunu mutlaka izle/oku/dinle\""},{"id":"icsel","label":"Kendi içimde yaşarım — o etki benimle kalır, paylaşmam azaltır"},{"id":"tekrar","label":"Tekrar tekrar dönerim — o eser benim bir parçam olur"},{"id":"ilham","label":"Bir şey yaratmak isterim — yazmak, çizmek, bir şekilde karşılık vermek"}]'::jsonb,
    4, 3, 12, true,
    'Sizi derinden etkileyen bir eser birbirinize anlatın. Neden bu kadar dokundu?',
    null,
    '{}'::jsonb
  ),
  (
    'estetik-hassasiyet', 'kultur', 'estetik deneyim', 'sabah-gece-ritmi', 4, 2, 'slider',
    'Güzellik — müzik, doğa, tasarım, sanat — seni ne kadar etkiler?',
    '[]'::jsonb,
    4, 3, 6, false,
    'Son zamanlarda sizi "vay" dedirten bir güzellik anı var mı? Birbirinize anlatın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Fark ederim ama günümü değiştirmez","highLabel":"Derinden etkiler; güzel bir şey ruh halimi tamamen değiştirir"}}'::jsonb
  ),
  (
    'hayat-dersi', 'hayal', 'bilgelik', 'nostalji-bagi', 4, 3, 'either_or',
    'Şimdiye kadar hayatın sana öğrettiği en değerli şey ne?',
    '[{"id":"sabir","label":"Sabır — her şeyin bir zamanı var, acele etmemek"},{"id":"cesaret","label":"Cesaret — korksam da adım atmak, pişmanlığı beklentiye tercih etmek"}]'::jsonb,
    5, 3, 10, true,
    'Bu dersi hangi deneyim öğretti? Hikâyenizi birbirinize anlatın.',
    null,
    '{}'::jsonb
  ),
  (
    'birlikte-miras', 'hayal', 'miras bırakmak', 'oncelik-pusulasi', 4, 3, 'choice',
    'Geride bırakmak istediğin "iz" ne olurdu?',
    '[{"id":"insan","label":"İnsanlar — yetiştirdiğim, dokunduğum hayatlar"},{"id":"eser","label":"Bir eser — yazdığım, kurduğum, inşa ettiğim bir şey"},{"id":"deger","label":"Bir değer — ilham verdiğim bir düşünce veya yaşam biçimi"},{"id":"an","label":"An — güzel anılar bırakmak; iz bırakmak zorunda değilim"}]'::jsonb,
    5, 2, 15, true,
    'Birbirinize "beni hatırlasınlar" fikri ne kadar önemli? Açıkça konuşun.',
    'Dört seçenek de meşru hayat felsefesi; iz bırakmak istememeyi eksiklik olarak gösterme.',
    '{}'::jsonb
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
