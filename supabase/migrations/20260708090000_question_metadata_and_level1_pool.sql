-- Soru sistemi metadata genişletmesi + Seviye 1 (İlk Tanışma) havuzunun ilk partisi.
-- Tasarım: docs/product/QUESTION_SYSTEM_DESIGN.md (Bölüm 6-7)
-- İçerik onayı: docs/product/QUESTIONS_LEVEL1.md
-- İçeriğin tek doğruluk kaynağı repodur (src/content/questions/level1.ts);
-- bu migration aynı içeriği slug üzerinden idempotent şekilde DB'ye taşır.

-- Algoritmanın filtrelediği alanlar gerçek kolon; sunum uzantıları
-- (slider ölçeği vb.) meta jsonb içinde. qualityNote bilinçli olarak DB'ye gitmez.
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
  add column meta jsonb not null default '{}'::jsonb;

create index questions_pool_idx on public.questions (is_active, level, trait);

-- Rövanş / "bir sonraki seviye" zinciri: aynı çiftin gördüğü sorular
-- zincir boyunca dışlanır (tekrarsızlık katmanı 1).
alter table public.rooms
  add column previous_room_id uuid references public.rooms(id) on delete set null;

-- Eski 8 demo sorusu rehber standardını karşılamıyor (ör. message-rhythm
-- slider'ı sayı gösteriyordu). Silinmez (answers FK'leri korunur), pasifleşir.
update public.questions
set is_active = false
where slug in (
  'daily-pace',
  'morning-night',
  'humor-style',
  'travel-mode',
  'message-rhythm',
  'money-style',
  'conflict-style',
  'future-year'
);

insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
values
  (
    'hep-aldigim-sey', 'lezzet', 'restoran ritüelleri', 'merak-tarzi', 1, 1, 'either_or',
    'Çok sevdiğin bir mekândasın. Menüde hiç denemediğin ama kulağa harika gelen bir şey var. Ne yaparsın?',
    '[{"id":"klasik","label":"Riske girmem — hep aldığımı alırım, zaten o yüzden seviyorum burayı"},{"id":"yeni","label":"Yeni olan neyse o — en kötü senin tabağından alırım"}]'::jsonb,
    4, 4, 8, true,
    'Birbirinize "değişmez siparişim" dediğiniz klasiği ve onu ilk keşfettiğiniz anı anlatın.',
    null, '{}'::jsonb
  ),
  (
    'gece-mutfagi', 'lezzet', 'gece atıştırması', 'ritual-bagliligi', 1, 1, 'choice',
    'Gece yarısı, herkes uyuyor, mutfağa süzüldün. Elinde büyük ihtimalle ne var?',
    '[{"id":"dolap","label":"Dolapta ne bulursam — soğuk soğuk, gerekirse tencereden"},{"id":"tatli","label":"Tatlı bir şeyler; çikolata radarım gece de kapanmaz"},{"id":"sandvic","label":"Ciddi iş: kendime düzgün bir sandviç kuruyorum"},{"id":"su","label":"Ben sadece su almaya inmiştim, yemin ederim"}]'::jsonb,
    3, 5, 10, false,
    'Gece mutfağının en garip eserini itiraf etme turu: en tuhaf gece atıştırması hanginizde?',
    null, '{}'::jsonb
  ),
  (
    'catal-diplomasisi', 'lezzet', 'masa kültürü', 'paylasim-istahi', 1, 1, 'slider',
    'Masada yemek paylaşımı konusunda neredesin?',
    '[]'::jsonb,
    4, 5, 6, false,
    'Masada tabak paylaşımının kuralları ne olmalı? İkiniz bir "çatal anayasası" yazın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Tabağım kalemdir, sınırdır","highLabel":"Masadaki her şey ortaktır, çatalım gezer"}}'::jsonb
  ),
  (
    'gece-yolculugu-teklifi', 'kesif', 'spontane plan', 'spontanlik', 1, 1, 'either_or',
    'Arkadaşın gece 22.00’de aradı: "Hadi şimdi yola çıkalım, sabah deniz kenarındayız." İlk tepkin?',
    '[{"id":"hemen","label":"Çantam beş dakikada hazır, yoldan mesaj atarım"},{"id":"planla","label":"Harika fikir — hafta sonu için planlayalım, düzgün yapalım"}]'::jsonb,
    5, 4, 8, true,
    'Hiç plansız çıkılmış bir yolculuğunuz oldu mu? En iyisini ya da en felaket olanını anlatın.',
    'İki cevap da maceraya açık; fark sadece zamanlamada. "Biri cesur, biri temkinli" çerçevesi kurma.',
    '{}'::jsonb
  ),
  (
    'tatil-aksami-testi', 'kesif', 'tatil ritmi', 'plan-sevgisi', 1, 1, 'choice',
    'Tatildesin ve bugün tamamen senin. Akşam olduğunda "harika bir gündü" dedirtecek olan hangisi?',
    '[{"id":"rota","label":"Haritada yıldızladığım yerlerin hepsini gezmiş olmak"},{"id":"kayip","label":"Plansız sokaklarda kaybolup beklenmedik bir şey keşfetmiş olmak"},{"id":"sifir-acele","label":"Manzara karşısında kitap, uyku ve sıfır acele"},{"id":"yerel","label":"Yerel pazardan garip şeyler alıp bir günlüğüne oralı gibi yaşamak"}]'::jsonb,
    4, 4, 12, true,
    'Bu dört akşamdan hangisi hayalinizdeki rotada olurdu? Bir sonraki tatil gününü birlikte kurgulayın.',
    null, '{}'::jsonb
  ),
  (
    'valiz-zamani', 'kesif', 'yolculuk hazırlığı', 'plan-sevgisi', 1, 1, 'slider',
    'Yolculuğa bir hafta var. Valiz cephesinde durum ne?',
    '[]'::jsonb,
    3, 4, 6, false,
    'Valizde asla eksik olmayan tuhaf eşyanız ne? İkiniz de birer tane söyleyin.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Valiz çoktan hazır, listem de var","highLabel":"Valiz mi? Çıkarken bir çanta doldururum"}}'::jsonb
  ),
  (
    'ezber-film', 'kultur', 'izleme alışkanlığı', 'konfor-alani', 1, 1, 'either_or',
    'Boş bir akşam, bir şey açacaksın. Hangisi daha çok çekiyor?',
    '[{"id":"ezber","label":"Yüz kere izlediğim, repliklerini ezbere bildiğim filmim — o bir sarılma gibi"},{"id":"yeni","label":"Hiç izlemediğim bir şey — aynı filmi ikinci kez izlemek bana israf gibi geliyor"}]'::jsonb,
    4, 4, 8, true,
    'Replikleri ezbere bildiğiniz o yapımı söyleyin — ve neden hiç eskimediğini savunun.',
    null, '{}'::jsonb
  ),
  (
    'yeni-sarki-refleksi', 'kultur', 'müzik davranışı', 'paylasim-istahi', 1, 1, 'choice',
    'Çok sevdiğin yeni bir şarkı keşfettin. Büyük ihtimalle sonra ne olur?',
    '[{"id":"tuket","label":"Tükenene kadar üst üste dinlerim, sonra bir süre küsüşürüz"},{"id":"gonder","label":"Anında birine gönderirim — güzel şey paylaşınca güzel"},{"id":"sakla","label":"Sessizce kendi listeme eklerim; o artık benim sırrım"},{"id":"arsiv","label":"Sanatçının bütün arşivine dalarım, gece orada biter"}]'::jsonb,
    4, 4, 12, true,
    'Birbirinize "bunu keşfettiğimde kimseye söylemedim" dediğiniz bir şarkı gönderin.',
    null, '{}'::jsonb
  ),
  (
    'yaz-tatili-karesi', 'nostalji', 'çocukluk yazları', 'nostalji-bagi', 1, 1, 'choice',
    'Çocukluğundaki yaz tatillerini düşün. Aklına ilk gelen kare hangisine daha yakın?',
    '[{"id":"memleket","label":"Memleket, akraba kalabalığı, kuzenler ordusu"},{"id":"mahalle","label":"Mahalle: akşam karanlığına kadar sokak, \"eve gel\" seslenişleri"},{"id":"deniz","label":"Deniz, güneş kremi kokusu, ıslak havlu"},{"id":"ev","label":"Serin ev hâli: çizgi filmler, kitaplar, uzun öğle uykuları"}]'::jsonb,
    4, 5, 12, true,
    'Gözünüzü kapatın: çocukluk yazlarından tek bir koku ya da ses seçin, birbirinize anlatın.',
    null, '{}'::jsonb
  ),
  (
    'ilk-harclik', 'nostalji', 'ilk’ler', 'para-keyif-dengesi', 1, 1, 'either_or',
    'Çocukluğuna dön: eline ilk kez gerçekten "senin" olan bir para geçti. Sen hangi çocuktun?',
    '[{"id":"harcadi","label":"O para akşama yoktu — neye gittiğini sorma, hatırlamıyorum"},{"id":"biriktirdi","label":"Kumbara müdürü — biriktirmenin kendisi ayrı bir oyundu"}]'::jsonb,
    3, 4, 8, true,
    'İlk "kendi paranızla" aldığınız şeyi hatırlıyor musunuz? İkiniz de anlatın.',
    'Bu çocukluk anısıdır, bugünün finansal profili değil; yetişkin para yorumu yapma.',
    '{}'::jsonb
  ),
  (
    'gecmisle-aran', 'nostalji', 'geçmişle ilişki', 'nostalji-bagi', 1, 2, 'slider',
    'Geçmişle aran nasıl?',
    '[]'::jsonb,
    3, 3, 8, false,
    'Dönüp dönüp baktığınız bir fotoğraf ya da şarkı var mı? Neden o?',
    'İki uç da romantize edilebilir: duygusal derinlik vs ileri bakış. Birini olgun gösterme.',
    '{"slider":{"min":1,"max":5,"lowLabel":"Eski fotoğraflar, eski şarkılar — arada oraya taşınırım","highLabel":"Güzeldi, bitti; ben hep sıradakine bakarım"}}'::jsonb
  ),
  (
    'hediye-saat', 'ritim', 'sabah/gece', 'sabah-gece-ritmi', 1, 1, 'either_or',
    'Dünya sana günde bir saat hediye etti: herkes uyurken sen uyanıksın. Bu saati günün hangi ucuna eklersin?',
    '[{"id":"sabah","label":"Sabaha — gün doğarken dünya sadece benimken"},{"id":"gece","label":"Geceye — herkes susunca asıl ben başlarım"}]'::jsonb,
    4, 4, 8, true,
    'O hediye saatte tam olarak ne yapardınız? Sabahçı ve gececi birbirine kendi saatini anlatsın.',
    null, '{}'::jsonb
  ),
  (
    'bos-pazar', 'ritim', 'hafta sonu', 'ev-disari-dengesi', 1, 1, 'choice',
    'Pazar sabahı uyandın, gün tamamen boş. İçinden ilk gelen ne?',
    '[{"id":"kahvalti","label":"Kahvaltıyı ciddiye alıp günü ağırdan açmak"},{"id":"disari","label":"Dışarı — boş gün, şehrin benim olduğu gün demek"},{"id":"topla","label":"Bir plan uydurup birilerini toplamak; boş gün ziyan edilmez"},{"id":"koltuk","label":"Boş gün kutsaldır: pijama, koltuk, \"bir bölüm daha\""}]'::jsonb,
    4, 4, 12, true,
    'En son "mükemmel geçti" dediğiniz boş gün nasıldı? Detaylarıyla anlatın.',
    null, '{}'::jsonb
  ),
  (
    'hayat-temposu', 'ritim', 'tempo', 'tempo', 1, 1, 'slider',
    'Genel yaşam tempon hangi uca yakın?',
    '[]'::jsonb,
    3, 4, 6, false,
    'Hanginiz kimi beklerken sabırsızlanırdı? Birlikte yavaşlamanız ya da hızlanmanız gereken bir an hayal edin.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Aceleye gelmem; dünya beklesin","highLabel":"Bekleyemem; yürüyen merdivende de yürürüm"}}'::jsonb
  ),
  (
    'bir-gunluk-hayat', 'hayal', 'hayat değişimi', 'macera-istahi', 1, 2, 'choice',
    'Bir günlüğüne bambaşka bir hayatı yaşayabilirsin; hafızan ve kimliğin sende kalıyor. Hangisini seçerdin?',
    '[{"id":"sahne","label":"Dünya turnesindeki bir grubun sahneye çıktığı gece"},{"id":"sahaf","label":"Kıyı kasabasında küçük bir sahaf-kafenin sıradan salı günü"},{"id":"uzay","label":"Uzay istasyonunda bir gün — evet, tuvaleti dahil"},{"id":"mutfak","label":"Büyük bir mutfakta akşam servisinin tam ortası"}]'::jsonb,
    4, 5, 15, true,
    'Seçtiğiniz hayatın o gününde ilk yapacağınız şey ne olurdu?',
    null, '{}'::jsonb
  ),
  (
    'mutevazi-super-guc', 'hayal', 'süper güç', 'macera-istahi', 1, 1, 'either_or',
    'İki kusurlu süper güçten birini seçmek zorundasın. Hangisi?',
    '[{"id":"ucus","label":"Uçabilirsin — ama yürüme hızında"},{"id":"isinlanma","label":"Işınlanabilirsin — ama sadece daha önce gittiğin bir yere"}]'::jsonb,
    5, 5, 10, true,
    'Savunma turu: kendi gücünüzün neden açıkça daha iyi olduğuna birbirinizi ikna etmeye çalışın.',
    null, '{}'::jsonb
  ),
  (
    'bir-yil-izin', 'hayal', 'zaman hediyesi', 'oncelik-pusulasi', 1, 2, 'choice',
    'Sana bir yıl izin verildi, geçim derdi yok. Ertesi sabah ilk hamlen ne olurdu?',
    '[{"id":"bilet","label":"Tek yön bilet; gerisini yolda çözerim"},{"id":"ogren","label":"Hep ertelediğim o şeyi öğrenmeye yazılırım"},{"id":"sevdikler","label":"Sevdiklerime uzun kahvaltılar borcum var; ödemeye başlarım"},{"id":"proje","label":"Bir hafta dinlenirim, sonra dayanamayıp kendime bir proje açarım"}]'::jsonb,
    4, 4, 15, true,
    'O "hep ertelediğim şey" ne? İkiniz de birer tane itiraf edin.',
    null, '{}'::jsonb
  ),
  (
    'gizli-keyif', 'itiraf', 'suçlu zevkler', 'kucuk-keyifler', 1, 1, 'choice',
    'Herkesin kimseye pek anlatmadığı küçük bir keyfi vardır. Seninki hangi bölgeden?',
    '[{"id":"dizi","label":"Yaşıma sorulmayacak diziler/filmler — ve hiç pişman değilim"},{"id":"sarki","label":"Utanç verici derecede yapışkan şarkılar; listede gizli klasördeler"},{"id":"internet","label":"İnternetin tuhaf köşeleri — buna araştırma diyelim"},{"id":"yemek","label":"Aşırı spesifik bir yeme-içme tuhaflığı; sormayın, yaşıyorum"}]'::jsonb,
    4, 5, 12, true,
    'Cesaret turu: gizli keyfinizden birer somut örnek verin. Gülmek serbest, yargı yasak.',
    null, '{}'::jsonb
  ),
  (
    'mesaj-itirafi', 'itiraf', 'dijital alışkanlık', 'temas-ritmi', 1, 1, 'either_or',
    'Dürüstlük anı: mesajlaşmada sen hangisisin?',
    '[{"id":"sonra","label":"\"Sonra cevaplarım\" deyip üç gün sonra utançla dönen benim"},{"id":"aninda","label":"Yazışma yarım kalamaz; okundu bilgim dürüsttür, cevabım anında"}]'::jsonb,
    4, 4, 8, true,
    'Telefonunuzdaki en eski "cevaplanacaklar" mesajı ne kadar eski? Dürüstlük turu.',
    'Bu bir arkadaşlık alışkanlığı itirafıdır; ilişki beklentisi yorumu yapma, geç cevabı kusur olarak çerçeveleme.',
    '{}'::jsonb
  ),
  (
    'ev-konseri', 'itiraf', 'yalnız hâller', 'kucuk-keyifler', 1, 1, 'slider',
    'Evde yalnızsın ve müzik açtın. Sahne ne durumda?',
    '[]'::jsonb,
    3, 5, 6, false,
    'Sizi en çok bu moda sokan şarkı hangisi? Birbirinize açın.',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Fonda çalar, ben işime bakarım","highLabel":"Ev sahneye döner; süpürge mikrofon olabilir"}}'::jsonb
  ),
  (
    'tatil-plancisi', 'sosyal', 'grup rolü', 'grup-rolu', 1, 1, 'choice',
    'Arkadaş grubun bir tatil planlıyor. Sen büyük ihtimalle hangisisin?',
    '[{"id":"organizator","label":"Tabloyu açan, uçuşları bulan, herkesi hizaya sokan organizatör"},{"id":"yolcu","label":"\"Ben her şeye varım\" diyen, planı taşımayan tatlı yolcu"},{"id":"revizyoncu","label":"Son dakika \"geliyorum ama şöyle olsa?\" diyen revizyoncu"},{"id":"moral","label":"Plana katkısı sıfır ama orada herkesi güldüren moral sorumlusu"}]'::jsonb,
    5, 4, 12, true,
    'Grup tatillerinden birer efsane anı: plan tutmadığında ne oldu?',
    null, '{}'::jsonb
  ),
  (
    'gece-sonrasi', 'sosyal', 'sosyal enerji', 'enerji-kaynagi', 1, 1, 'either_or',
    'Kalabalık, güzel bir geceden çıktın. Kapı kapandığı an içindeki his hangisi?',
    '[{"id":"sarj","label":"Şarj oldum — eve gelince de susamıyorum"},{"id":"pil-bitti","label":"Harikaydı ama pilim bitti; şimdi sessizlik, güzel sessizlik"}]'::jsonb,
    4, 3, 8, true,
    'İkiniz için de mükemmel bir gece nasıl biter? Saatiyle, sahnesiyle anlatın.',
    'İki seçenek de geceyi sevmiş durumda; içe dönüklüğü eksiklik gibi yorumlama.',
    '{}'::jsonb
  ),
  (
    'kaos-sistemi', 'ev', 'düzen', 'duzen-kaos', 1, 1, 'slider',
    'Yaşam alanın hangi uca yakın?',
    '[]'::jsonb,
    4, 4, 6, false,
    'Birbirinize "benim köşem" dediğiniz alanı tarif edin — kimsenin karışamayacağı bölge.',
    'Düzenli ucu daha olgun gösterme; iki uç da işleyen birer sistemdir.',
    '{"slider":{"min":1,"max":5,"lowLabel":"Her şeyin bir yeri var ve oradadır","highLabel":"Kaos gibi görünür ama içinde bir sistemim var"}}'::jsonb
  ),
  (
    'evden-cikmama-gunu', 'ev', 'ev günü', 'ev-disari-dengesi', 1, 1, 'choice',
    'Bugünü resmen "evden çıkmama günü" ilan ettin. Evin en canlı köşesinde ne oluyor?',
    '[{"id":"mutfak","label":"Mutfak mesaisi: bir şeyler pişiyor, ev güzel kokuyor"},{"id":"koltuk","label":"Koltuk + battaniye + \"son bir bölüm\" yalanı"},{"id":"hobi","label":"Masaya yayılmış yarım projeler ve hobiler — bugün onların günü"},{"id":"balkon","label":"Balkon/pencere kenarı: ben evdeyim ama gözüm dışarıda"}]'::jsonb,
    3, 4, 12, true,
    'Evden çıkmama günlerinizi birleştirseniz o evde neler olurdu? Menüsüyle kurgulayın.',
    null, '{}'::jsonb
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
