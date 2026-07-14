-- Havuz genişletme: level1.ts'teki 19 soru DB'de eksikti, oda oluşturmayı kırıyordu.
-- slug ON CONFLICT ile idempotent.

insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
values
  (
    'buzdolabi-kapagi', 'ev', 'günlük alışkanlık', 'duzen-kaos', 1, 1, 'either_or',
    'Buzdolabının kapağını açtığında nasıl bir manzara karşılıyor seni?',
    '[{"id":"duzen","label":"Her şey kendi rafında, etiketli bile olabilir"},{"id":"kaos","label":"Tetris oynar gibi bir şeyler sığdırılmış"}]'::jsonb,
    3, 5, 8, true,
    'Buzdolabı düzeni konusunda biriniz titiz biriniz rahat mı?',
    null, '{}'::jsonb
  ),
  (
    'telefon-alarmi', 'ritim', 'sabah', 'sabah-gece-ritmi', 1, 1, 'choice',
    'Sabah alarmınla aranı en iyi hangisi anlatır?',
    '[{"id":"tek","label":"Tek alarm, ilk çalışta ayaktayım"},{"id":"bes","label":"5 alarm art arda — hepsiyle pazarlık yapıyorum"},{"id":"yok","label":"Alarm kurmam, vücut saatim var"},{"id":"erken","label":"Alarm çalmadan önce uyanırım zaten"}]'::jsonb,
    3, 5, 10, true,
    'Sabah rutininiz nasıl başlıyor, birbirinize anlatın.',
    null, '{}'::jsonb
  ),
  (
    'playlist-tercihi', 'kultur', 'müzik', 'merak-tarzi', 1, 1, 'either_or',
    'Müzik dinlerken daha çok hangisi?',
    '[{"id":"ayni","label":"Aynı şarkıları tekrar tekrar — hepsini ezbere biliyorum"},{"id":"yeni","label":"Hep yeni müzik arıyorum — keşfetmek heyecan veriyor"}]'::jsonb,
    4, 4, 8, true,
    'Son keşfettiğiniz veya tekrar tekrar dinlediğiniz bir şarkıyı paylaşın.',
    null, '{}'::jsonb
  ),
  (
    'yolda-kaybolmak', 'hayal', 'seyahat', 'macera-istahi', 1, 1, 'either_or',
    'Yeni bir şehirde navigasyon bozuldu. İlk tepkin?',
    '[{"id":"macera","label":"Harika, en güzel keşifler böyle olur"},{"id":"stres","label":"Hemen birine sorarım veya Wi-Fi ararım"}]'::jsonb,
    4, 4, 8, true,
    'Kaybolduğunuz ve güzel bir şey keşfettiğiniz bir anınız var mı?',
    null, '{}'::jsonb
  ),
  (
    'enerji-saati', 'ritim', 'enerji', 'enerji-kaynagi', 1, 1, 'choice',
    'Gün içinde enerjinin en tepede olduğu zaman dilimi?',
    '[{"id":"sabah","label":"Sabah ilk saatler — güneşle şarj oluyorum"},{"id":"oglen","label":"Öğleden sonra — motorum geç ısınır"},{"id":"aksam","label":"Akşam saatleri — herkes uyurken ben uyanıyorum"},{"id":"degisken","label":"Güne bağlı — tahmin bile edemem"}]'::jsonb,
    3, 4, 10, false,
    'Enerji ritminiz uyuyor mu, yoksa farklı saatlerde mi zirve yapıyorsunuz?',
    null, '{}'::jsonb
  ),
  (
    'arkadas-cagri', 'ritim', 'sosyal enerji', 'sosyal-istah', 1, 1, 'slider',
    'Hafta ortası "Bu akşam buluşalım mı?" mesajı geldi. İçinden ne geçer?',
    '[]'::jsonb,
    3, 4, 10, false,
    'Spontan buluşma tekliflerine nasıl tepki veriyorsunuz?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"\"Harika, hemen hazırlanayım!\"","highLabel":"\"Bu akşam mı? Ama benim dizim var...\"","midLabel":"Kime göre değişir"}}'::jsonb
  ),
  (
    'para-harcama', 'para', 'para', 'para-keyif-dengesi', 1, 1, 'choice',
    'Beklenmedik bir indirim sezonu! En çok hangisine koşarsın?',
    '[{"id":"deneyim","label":"Konser, etkinlik, seyahat bileti"},{"id":"esya","label":"Uzun süredir baktığım bir ürün"},{"id":"biriktir","label":"İndirim olsa da biriktirmeyi tercih ederim"},{"id":"ikram","label":"Sevdiklerime bir şey alırım"}]'::jsonb,
    4, 4, 10, true,
    'Para harcama alışkanlıklarınız benziyor mu?',
    null, '{}'::jsonb
  ),
  (
    'yeni-insanlar', 'sosyal', 'tanışma', 'guven-inshasi', 1, 1, 'slider',
    'Yeni tanıştığın biriyle ne kadar çabuk açılırsın?',
    '[]'::jsonb,
    4, 3, 10, false,
    'Güven inşa etme hızınız birbirinize uyuyor mu?',
    null,
    '{"slider":{"min":1,"max":5,"lowLabel":"Hemen samimi olurum, hayatımı anlatırım","highLabel":"Yavaş yavaş, güven zamanla olur","midLabel":"Konuya göre değişir"}}'::jsonb
  ),
  (
    'haber-tuketimi', 'ritim', 'bilgi', 'merak-tarzi', 1, 1, 'choice',
    'Haberleri nasıl takip edersin?',
    '[{"id":"aktif","label":"Her sabah gündem taraması yaparım"},{"id":"sosyal","label":"Sosyal medyada denk gelirse okurum"},{"id":"derinlik","label":"Az ama derinden — uzun analizler okurum"},{"id":"uzak","label":"Haberlerden uzak durmayı tercih ederim"}]'::jsonb,
    3, 3, 10, true,
    'Bilgi tüketim tarzınız nasıl farklılık gösteriyor?',
    null, '{}'::jsonb
  ),
  (
    'surpriz-tepki', 'hayal', 'tepki', 'spontanlik', 1, 1, 'either_or',
    'Doğum gününde sürpriz parti yapılsa?',
    '[{"id":"sever","label":"Bayılırım! Ne güzel bir sürpriz!"},{"id":"sevmez","label":"İçimden \"keşke söyleselerdi\" derim"}]'::jsonb,
    4, 5, 8, true,
    'Sürprizlerle aranız nasıl?',
    null, '{}'::jsonb
  ),
  (
    'yardim-isteme', 'iletisim', 'iletişim', 'ifade-tarzi', 1, 1, 'either_or',
    'Bir konuda yardıma ihtiyacın var. Ne yaparsın?',
    '[{"id":"sorar","label":"Hemen sorarım, tek başıma uğraşmam"},{"id":"dener","label":"Önce kendim çözmeye çalışırım, olmazsa sorarım"}]'::jsonb,
    4, 3, 8, true,
    'Yardım isteme konusunda birbirinize benziyor musunuz?',
    null, '{}'::jsonb
  ),
  (
    'film-secimi', 'sosyal', 'eğlence', 'grup-rolu', 1, 1, 'choice',
    'Akşam film izlenecek ama kimse karar veremiyor. Sen ne yaparsın?',
    '[{"id":"sec","label":"\"Tamam ben seçiyorum\" der, filmi belirlerim"},{"id":"oner","label":"3 seçenek sunarım, oylama yaparız"},{"id":"uyum","label":"\"Ne izlersek izleyelim, fark etmez\" derim"},{"id":"anket","label":"Gruba anket atarım — demokratik olsun"}]'::jsonb,
    3, 5, 10, true,
    'Karar alma süreçlerinde kim daha çok inisiyatif alıyor?',
    null, '{}'::jsonb
  ),
  (
    'ilk-mesaj', 'itiraf', 'easter-egg', 'ifade-tarzi', 1, 2, 'choice',
    E'🥚 Bu uygulamada değil de bir dating app\'te karşılaşsaydınız, ilk mesajın ne olurdu?',
    '[{"id":"emoji","label":"Sadece 🔥 atardım — gerisini merak etsin"},{"id":"espri","label":"Profilindeki bir detayla ilgili espri yapardım"},{"id":"soru","label":"\"Sence bu uygulama mı yoksa kader mi?\" yazardım"},{"id":"direkt","label":"\"Merhaba, tanışalım mı?\" — net ve direkt"}]'::jsonb,
    5, 5, 12, true,
    'Peki karşı taraf ne yazardı sana? Tahmin et 😏',
    null, '{}'::jsonb
  ),
  (
    'red-flag', 'itiraf', 'easter-egg', 'risk-istahi', 1, 2, 'choice',
    '🥚 Karşındaki kişi hakkında hangi cevabı görünce "vay be" derdin?',
    '[{"id":"macera","label":"\"Gece yarısı araba sürmek\" seçmesi — cesur biri"},{"id":"plan","label":"\"Gün gün plan yaparım\" seçmesi — düzenli biri"},{"id":"espri","label":"Bir soruya komik cevap vermesi — mizahı var"},{"id":"derin","label":"Derin ve düşündüren bir cevap vermesi"}]'::jsonb,
    5, 5, 10, true,
    'Karşı tarafın hangi cevabı seni şaşırttı? Söyle bakalım 👀',
    null, '{}'::jsonb
  ),
  (
    'ilgi-gostermek', 'itiraf', 'easter-egg', 'paylasim-istahi', 1, 2, 'choice',
    '🥚 Karşındaki kişiyle bir kafede oturuyorsun. Sohbet çok iyi gidiyor. Ne yaparsın?',
    '[{"id":"uzat","label":"\"Bir kahve daha alalım mı?\" — bitmesin isterim"},{"id":"numara","label":"Numarasını isterim — devamı olsun"},{"id":"bekle","label":"Bir şey söylemem, o adım atsın isterim"},{"id":"plan","label":"\"Bir dahaki sefere şuraya gidelim\" derim — plan yaparım"}]'::jsonb,
    5, 5, 10, true,
    'Peki bu kafede şu an oturuyor olsanız hangisini yapardınız? 😉',
    null, '{}'::jsonb
  ),
  (
    'ideal-date', 'hayal', 'easter-egg', 'macera-istahi', 1, 2, 'choice',
    '🥚 Karşındaki kişiyi bir yere götüreceksin — nereye?',
    '[{"id":"kahve","label":"Gizli bir kafe — \"bunu sadece ben bilirim\" havası"},{"id":"macera","label":"Gece şehir turu — nereye çıkarsa"},{"id":"yemek","label":"En sevdiğim restoran — yemek sırasında tanırsın beni"},{"id":"manzara","label":"Manzaralı bir yer — sessizce oturup konuşuruz"}]'::jsonb,
    5, 5, 10, true,
    'İkiniz de aynı yeri mi seçti? Belki gerçekten gitmelisiniz 👀',
    null, '{}'::jsonb
  ),
  (
    'aciklama-biyografi', 'sosyal', 'easter-egg', 'mizah-tarzi', 1, 2, 'choice',
    '🥚 Karşındaki kişiyi 3 kelimeyle anlatman gerekse — henüz bu kadar tanıdığına göre — ne derdin?',
    '[{"id":"merakli","label":"Meraklı, sıcak, sürpriz"},{"id":"sakin","label":"Sakin, derin, çekici"},{"id":"enerjik","label":"Enerjik, komik, cesur"},{"id":"gizemli","label":"Gizemli, düşünceli, ilginç"}]'::jsonb,
    5, 5, 10, true,
    'Birbirinizi nasıl tanımladığınızı karşılaştırın — sürpriz olabilir 😏',
    null, '{}'::jsonb
  ),
  (
    'yan-yana-sessizlik', 'itiraf', 'easter-egg', 'alan-ihtiyaci', 1, 2, 'either_or',
    '🥚 Karşındaki kişiyle yan yana oturup hiç konuşmadan vakit geçirebilir misin?',
    '[{"id":"evet","label":"Evet — sessizlik de güzel olabilir"},{"id":"hayir","label":"Zor — bir şeyler konuşmam lazım"}]'::jsonb,
    5, 5, 8, true,
    'Sessizlik testi: şimdi 10 saniye birbirinize bakın, konuşmadan 👀',
    null, '{}'::jsonb
  ),
  (
    'tahmin-oyunu', 'hayal', 'easter-egg', 'merak-tarzi', 1, 2, 'choice',
    '🥚 Karşındaki kişinin bu uygulamada en çok hangi soruyu beğendiğini tahmin et:',
    '[{"id":"komik","label":"Eğlenceli/komik olanları"},{"id":"derin","label":"Derin ve düşündürenleri"},{"id":"kisisel","label":"Kişisel olanları"},{"id":"bu","label":"Bu soruyu 😂"}]'::jsonb,
    5, 5, 10, false,
    'Tahmin tuttu mu? Birbirinize sorun — en sevdiğiniz soru hangisiydi?',
    null, '{}'::jsonb
  )
on conflict (slug) do nothing;
