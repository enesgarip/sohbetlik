-- Expanded active Level 2-4 question pools.
-- Source of truth: src/content/questions/level2.ts, level3.ts, level4.ts.
-- This migration backfills active questions that were added after the original 24-question seed migrations.

with seed_questions as (
  select *
  from jsonb_to_recordset($questions$
[
  {
    "slug": "tatil-donusu",
    "category": "kesif",
    "subcategory": "seyahat dönüşü",
    "trait": "nostalji-bagi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "Tatilden döndüğünde ilk ne yaparsın?",
    "options": [
      {
        "id": "yerlestir",
        "label": "Hemen bavulu açar, her şeyi yerine koyarım"
      },
      {
        "id": "koltuk",
        "label": "Bavul günlerce öyle kalır, ben koltuğa gömülürüm"
      },
      {
        "id": "fotograf",
        "label": "Fotoğraflara bakarım, hemen paylaşırım"
      },
      {
        "id": "plan",
        "label": "Sonraki tatili düşünmeye başlarım"
      }
    ],
    "spark_score": 4,
    "fun_score": 4,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Tatil sonrası ritüelleriniz nasıl farklı?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "arkadas-sikayeti",
    "category": "iletisim",
    "subcategory": "destek tarzı",
    "trait": "ifade-tarzi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "Yakın arkadaşın biriyle ilgili şikâyet ediyor. Sen ne yaparsın?",
    "options": [
      {
        "id": "dinle",
        "label": "Sadece dinlerim, onu anlamaya çalışırım"
      },
      {
        "id": "cozum",
        "label": "Hemen çözüm önermeye başlarım"
      },
      {
        "id": "soru",
        "label": "Sorular sorarım — belki farklı açıdan bakması gerekir"
      },
      {
        "id": "destek",
        "label": "Onun tarafını tutarım, haklısın derim"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Birisi dert anlatırken ikiniz de aynı tepkiyi mi veriyorsunuz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "ev-dekor",
    "category": "ev",
    "subcategory": "estetik",
    "trait": "duzen-kaos",
    "level": 2,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Evin dekoru konusunda hangisi sana daha yakın?",
    "options": [
      {
        "id": "minimal",
        "label": "Az eşya, çok boşluk — minimalizm"
      },
      {
        "id": "dolu",
        "label": "Her köşede bir anı, raflar dolu — sıcak kaos"
      }
    ],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "İdeal yaşam alanınız nasıl görünür?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "muzik-kesfetme",
    "category": "kultur",
    "subcategory": "müzik",
    "trait": "merak-tarzi",
    "level": 2,
    "intensity": 1,
    "type": "choice",
    "prompt": "Yeni müzik nasıl keşfedersin?",
    "options": [
      {
        "id": "algoritma",
        "label": "Algoritma önerir, güvenirim"
      },
      {
        "id": "arkadas",
        "label": "Arkadaş tavsiyesi — biri gönderirse dinlerim"
      },
      {
        "id": "kazirim",
        "label": "Saatlerce kazarım — Spotify'ın diplerine inerim"
      },
      {
        "id": "kesfetmem",
        "label": "Pek keşfetmem, bildiklerimi dinlerim"
      }
    ],
    "spark_score": 4,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Son keşfettiğiniz bir şarkıyı birbirinize gönderin.",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "hediye-almak",
    "category": "sosyal",
    "subcategory": "hediye",
    "trait": "paylasim-istahi",
    "level": 2,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Hediye alırken daha çok hangisi?",
    "options": [
      {
        "id": "arar",
        "label": "Haftalarca düşünürüm — mükemmel hediyeyi bulurum"
      },
      {
        "id": "anlik",
        "label": "Bir şey görürüm, \"buna bayılır\" derim, alırım"
      }
    ],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Size gelen en güzel hediye neydi?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "sessiz-ortam",
    "category": "ritim",
    "subcategory": "enerji",
    "trait": "enerji-kaynagi",
    "level": 2,
    "intensity": 2,
    "type": "slider",
    "prompt": "Kalabalık bir yerde uzun süre kaldıktan sonra kendine gelme süren?",
    "options": [],
    "spark_score": 3,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": false,
    "followup_prompt": "Sosyal etkinlik sonrası şarj olma süreniz uyuşuyor mu?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Hemen toplarım, sorun değil",
        "highLabel": "Yarın gün bana lazım, kimseyle konuşmam",
        "midLabel": "Birkaç saat yeter"
      }
    }
  },
  {
    "slug": "para-konusu",
    "category": "para",
    "subcategory": "paylaşım",
    "trait": "para-keyif-dengesi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "Arkadaş grubunda biri her zaman hesabı bölmek istemezse ne düşünürsün?",
    "options": [
      {
        "id": "sorun",
        "label": "Rahatsız olurum ama söylemem"
      },
      {
        "id": "soyle",
        "label": "Kibarca belirtirim"
      },
      {
        "id": "farketmez",
        "label": "Umursamam, keyif bozmasın"
      },
      {
        "id": "ogle",
        "label": "Duruma göre değişir, bağlama bakarım"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Para konuşmak sizin için ne kadar rahat?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "uzun-mesaj",
    "category": "iletisim",
    "subcategory": "mesajlaşma",
    "trait": "temas-ritmi",
    "level": 2,
    "intensity": 2,
    "type": "either_or",
    "prompt": "Mesajlaşma tarzın?",
    "options": [
      {
        "id": "uzun",
        "label": "Uzun paragraflar — her şeyi bir mesajda anlatırım"
      },
      {
        "id": "kisa",
        "label": "Kısa kısa — her cümle ayrı mesaj"
      }
    ],
    "spark_score": 4,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Mesajlaşma tarzlarınız uyuşuyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "yemek-deneme",
    "category": "lezzet",
    "subcategory": "deneme",
    "trait": "risk-istahi",
    "level": 2,
    "intensity": 1,
    "type": "choice",
    "prompt": "Menüde hiç bilmediğin bir yemek var. Ne yaparsın?",
    "options": [
      {
        "id": "dene",
        "label": "Kesinlikle denerim — bilmediğim şeyleri severim"
      },
      {
        "id": "sor",
        "label": "Garsona sorarım, detay alırım, sonra karar veririm"
      },
      {
        "id": "bilinen",
        "label": "Güvenli olanı seçerim, macera istemem"
      },
      {
        "id": "paylas",
        "label": "Biri denemeli ki tadına bakayım"
      }
    ],
    "spark_score": 3,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Yemek konusunda ne kadar maceraperestsiniz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "nostalji-esya",
    "category": "nostalji",
    "subcategory": "anı",
    "trait": "nostalji-bagi",
    "level": 2,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Eski eşyalarını atabilir misin?",
    "options": [
      {
        "id": "atamam",
        "label": "Atamam — her birinin bir hikâyesi var"
      },
      {
        "id": "rahat",
        "label": "Rahat atarım — yer açılsın"
      }
    ],
    "spark_score": 4,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "En uzun süredir sakladığınız eşya ne?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "grup-karar",
    "category": "sosyal",
    "subcategory": "grup dinamiği",
    "trait": "grup-rolu",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "Arkadaş grubunda plan yapılırken sen genelde ne roldesin?",
    "options": [
      {
        "id": "kurucu",
        "label": "Planı kuran benim — tarih, yer, saat"
      },
      {
        "id": "fikir",
        "label": "Fikir atarım ama organizasyon başkasında"
      },
      {
        "id": "katilimci",
        "label": "\"Nereye gidersek gideriz\" tayfasıyım"
      },
      {
        "id": "motive",
        "label": "Herkesi motive eden benim — \"hadi yapılsın artık\""
      }
    ],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Sosyal planlamada rolleriniz tamamlayıcı mı?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "hayal-mekan",
    "category": "hayal",
    "subcategory": "yaşam hayali",
    "trait": "koklenme-gocebelik",
    "level": 2,
    "intensity": 1,
    "type": "choice",
    "prompt": "Sınırsız imkânın olsa nerede yaşamak isterdin?",
    "options": [
      {
        "id": "deniz",
        "label": "Deniz kenarı küçük bir kasaba"
      },
      {
        "id": "sehir",
        "label": "Büyük bir şehrin kalbinde"
      },
      {
        "id": "dag",
        "label": "Dağ başında sessiz bir ev"
      },
      {
        "id": "gezgin",
        "label": "Sabit bir yer değil — sürekli farklı şehirler"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "İdeal yaşam hayaliniz örtüşüyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "iltifat-dili",
    "category": "iletisim",
    "subcategory": "easter-egg",
    "trait": "ifade-tarzi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "🥚 Karşındaki kişiye bir iltifat edeceksin. Nasıl yaparsın?",
    "options": [
      {
        "id": "dolaysiz",
        "label": "Gözlerinin içine bakıp doğrudan söylerim"
      },
      {
        "id": "espri",
        "label": "Espri arasına sıkıştırırım — fark etsin ama çok belli olmasın"
      },
      {
        "id": "yaz",
        "label": "Yüz yüze değil, mesajla yazarım — daha rahat"
      },
      {
        "id": "goster",
        "label": "Söylemem, davranışlarımla gösteririm"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Hadi şimdi birbirinize bir iltifat edin — hangi tarzda olacak? 😊",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "flort-supergucu",
    "category": "hayal",
    "subcategory": "easter-egg",
    "trait": "mizah-tarzi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "🥚 Karşındaki kişiyi etkilemek için bir süper gücün olsa?",
    "options": [
      {
        "id": "espri",
        "label": "Her seferinde kahkaha attıran espriler bulmak"
      },
      {
        "id": "oku",
        "label": "Tam olarak ne duymak istediğini bilmek"
      },
      {
        "id": "yemek",
        "label": "Dünyanın en iyi yemeğini yapabilmek"
      },
      {
        "id": "zaman",
        "label": "Zamanı durdurup o anı uzatmak"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Aslında süper güce gerek yok — şu ana kadar hangisini zaten yapıyorsunuz? 😏",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "sarki-gondermek",
    "category": "kultur",
    "subcategory": "easter-egg",
    "trait": "paylasim-istahi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "🥚 Karşındaki kişiye bir şarkı göndereceksin. Hangi tarzda olur?",
    "options": [
      {
        "id": "romantik",
        "label": "Yavaş ve duygusal — mesaj net olsun"
      },
      {
        "id": "enerjik",
        "label": "Enerjik ve eğlenceli — dans ettirecek"
      },
      {
        "id": "siir",
        "label": "Sözleri çok anlamlı olan — \"dinle, anlarsın\""
      },
      {
        "id": "ironik",
        "label": "İronik bir seçim — güldürmeye çalışırım"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Bu oturumdan sonra birbirinize gerçekten bir şarkı gönderin 🎵",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "ortak-yolculuk",
    "category": "hayal",
    "subcategory": "easter-egg",
    "trait": "macera-istahi",
    "level": 2,
    "intensity": 2,
    "type": "choice",
    "prompt": "🥚 Karşındaki kişiyle 24 saat boyunca istediğin yere ışınlanabilirsin. Nereye?",
    "options": [
      {
        "id": "paris",
        "label": "Paris — Seine kenarında yürüyüş"
      },
      {
        "id": "tokyo",
        "label": "Tokyo — kaybolmak eğlenceli olur"
      },
      {
        "id": "sahil",
        "label": "Issız bir sahil — sadece ikiniz"
      },
      {
        "id": "ev",
        "label": "Hiçbir yere — evde film gecesi yeter"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Aynı yeri mi seçtiniz? Belki bir gün gerçekten gidersiniz ✈️",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "sinir-koymak",
    "category": "iletisim",
    "subcategory": "sınır",
    "trait": "alan-ihtiyaci",
    "level": 3,
    "intensity": 2,
    "type": "choice",
    "prompt": "Yakın birinin davranışı seni rahatsız etti ama farkında değil. Ne yaparsın?",
    "options": [
      {
        "id": "soyle",
        "label": "Doğrudan söylerim — bilmesini isterim"
      },
      {
        "id": "bekle",
        "label": "Bir süre beklerim, tekrarlarsa söylerim"
      },
      {
        "id": "ipucu",
        "label": "Dolaylı ipuçları veririm"
      },
      {
        "id": "katlan",
        "label": "Kendi kendime hallederim, söylemem"
      }
    ],
    "spark_score": 5,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Sınır koyma konusunda birbirinize benziyor musunuz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "partner-stres",
    "category": "iletisim",
    "subcategory": "destek",
    "trait": "paylasim-istahi",
    "level": 3,
    "intensity": 3,
    "type": "choice",
    "prompt": "Yanındaki kişi çok stresli ama konuşmak istemiyor. Ne yaparsın?",
    "options": [
      {
        "id": "alan",
        "label": "Alanını veririm — hazır olunca gelir"
      },
      {
        "id": "yaninda",
        "label": "Sessizce yanında olurum, sormam"
      },
      {
        "id": "sor",
        "label": "Nazikçe sorarım — belki konuşmak ister"
      },
      {
        "id": "dikkat",
        "label": "Dikkatini dağıtmaya çalışırım"
      }
    ],
    "spark_score": 5,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Stresli anlarda nasıl destek istersiniz birbirinizden?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "gelecek-plani",
    "category": "hayal",
    "subcategory": "gelecek",
    "trait": "oncelik-pusulasi",
    "level": 3,
    "intensity": 2,
    "type": "slider",
    "prompt": "Hayatında öncelik sıralaması nereye yakın?",
    "options": [],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": false,
    "followup_prompt": "Öncelikleriniz birbirini tamamlıyor mu?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Kariyer ve kişisel gelişim",
        "highLabel": "İlişkiler ve deneyimler",
        "midLabel": "Dengede tutmaya çalışırım"
      }
    }
  },
  {
    "slug": "eski-aliski",
    "category": "nostalji",
    "subcategory": "ritüel",
    "trait": "ritual-bagliligi",
    "level": 3,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Çocukluğundan kalan ve hala devam eden bir alışkanlığın var mı?",
    "options": [
      {
        "id": "var",
        "label": "Evet — ve bırakmayı düşünmüyorum"
      },
      {
        "id": "yok",
        "label": "Hayır — çoktan geride kaldı"
      }
    ],
    "spark_score": 3,
    "fun_score": 5,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Çocukluktan kalan alışkanlıklarınızı paylaşın.",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "risk-karari",
    "category": "para",
    "subcategory": "risk",
    "trait": "risk-istahi",
    "level": 3,
    "intensity": 2,
    "type": "choice",
    "prompt": "Karşına iyi bir iş fırsatı çıktı ama risk yüksek. Ne yaparsın?",
    "options": [
      {
        "id": "atla",
        "label": "Atlarım — en kötü ne olabilir?"
      },
      {
        "id": "hesapla",
        "label": "Hesabını yaparım, sayılar uyarsa girerim"
      },
      {
        "id": "danis",
        "label": "Güvendiğim insanlara danışırım"
      },
      {
        "id": "pas",
        "label": "Pas geçerim — güvenliği tercih ederim"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Risk alma konusunda birbirinizden ne öğrenebilirsiniz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "ev-sessizlik",
    "category": "ev",
    "subcategory": "birlikte yaşam",
    "trait": "alan-ihtiyaci",
    "level": 3,
    "intensity": 2,
    "type": "slider",
    "prompt": "Aynı evde yaşarken sessizlik anları sence ne ifade eder?",
    "options": [],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": false,
    "followup_prompt": "Sessizlik sizin için ne anlama geliyor?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Huzurun ta kendisi — en güzel anlar",
        "highLabel": "Tedirgin eder — bir şeyler mi var acaba?",
        "midLabel": "Duruma bağlı"
      }
    }
  },
  {
    "slug": "lezzet-sadakati",
    "category": "lezzet",
    "subcategory": "tercih",
    "trait": "konfor-alani",
    "level": 3,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Favori restoranına gittiğinde hep aynı şeyi mi söylersin?",
    "options": [
      {
        "id": "ayni",
        "label": "Evet — neden risk alayım, bu mükemmel"
      },
      {
        "id": "farkli",
        "label": "Hayır — menüde denemediğim kalmayana kadar"
      }
    ],
    "spark_score": 3,
    "fun_score": 5,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Yemek alışkanlıklarınız benziyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "eglence-tercihi",
    "category": "kultur",
    "subcategory": "eğlence",
    "trait": "enerji-kaynagi",
    "level": 3,
    "intensity": 1,
    "type": "choice",
    "prompt": "İdeal bir cuma gecesi?",
    "options": [
      {
        "id": "disari",
        "label": "Dışarı — bar, konser, etkinlik"
      },
      {
        "id": "ev",
        "label": "Evde film gecesi — battaniye zorunlu"
      },
      {
        "id": "az",
        "label": "Küçük grup yemeği — 3-4 kişi"
      },
      {
        "id": "tek",
        "label": "Solo gece — kitap, müzik, huzur"
      }
    ],
    "spark_score": 3,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "İdeal cuma geceniz örtüşüyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "tatil-suresi",
    "category": "kesif",
    "subcategory": "tatil",
    "trait": "tempo",
    "level": 3,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Tatilde hangisi sana daha yakın?",
    "options": [
      {
        "id": "yogun",
        "label": "Her günü dolu — gezdim, gördüm, yaptım"
      },
      {
        "id": "yavas",
        "label": "Hiçbir şey yapmamak da tatildir"
      }
    ],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Tatil temponuz uyuşuyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "kriz-tepki",
    "category": "ritim",
    "subcategory": "kriz yönetimi",
    "trait": "tartisma-tarzi",
    "level": 3,
    "intensity": 3,
    "type": "choice",
    "prompt": "Beklenmedik bir kriz anında (uçak kaçtı, araba bozuldu) ilk tepkin?",
    "options": [
      {
        "id": "soguk",
        "label": "Soğukkanlı kalırım — plan B yaparım"
      },
      {
        "id": "panik",
        "label": "Önce panik, sonra toparlarım"
      },
      {
        "id": "birine",
        "label": "Hemen birini ararım — birlikte çözelim"
      },
      {
        "id": "sinir",
        "label": "Sinirlenirm — sonra geçer"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Kriz anlarında birbirinizi nasıl desteklersiniz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "sosyal-medya",
    "category": "kultur",
    "subcategory": "dijital",
    "trait": "paylasim-istahi",
    "level": 3,
    "intensity": 1,
    "type": "slider",
    "prompt": "Sosyal medyada ne kadar paylaşırsın?",
    "options": [],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 10,
    "shuffle_options": false,
    "followup_prompt": "Dijital dünyada ne kadar görünür olmayı tercih ediyorsunuz?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Her şeyi paylaşırım — hayatım açık kitap",
        "highLabel": "Neredeyse hiç paylaşmam — hayalet hesap",
        "midLabel": "Ara sıra, seçerek"
      }
    }
  },
  {
    "slug": "hafta-sonu-macera",
    "category": "kesif",
    "subcategory": "macera",
    "trait": "macera-istahi",
    "level": 3,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Hafta sonu planlanmamış bir gün. Ne yaparsın?",
    "options": [
      {
        "id": "kesfet",
        "label": "Hiç gitmediğim bir yere giderim"
      },
      {
        "id": "sevilen",
        "label": "Sevdiğim mekâna gider, bildik rutini yaparım"
      }
    ],
    "spark_score": 4,
    "fun_score": 5,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Plansız günlerde enerjinizi nasıl harcarsınız?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "gizli-dusunce",
    "category": "itiraf",
    "subcategory": "easter-egg",
    "trait": "ifade-tarzi",
    "level": 3,
    "intensity": 2,
    "type": "choice",
    "prompt": "🥚 Bu soruları cevaplarken karşındaki kişi hakkında en çok ne düşündün?",
    "options": [
      {
        "id": "merak",
        "label": "\"Acaba o da benim gibi mi düşünüyor?\""
      },
      {
        "id": "sasirma",
        "label": "\"Bazı cevapları beni şaşırtacak kesin\""
      },
      {
        "id": "ilgi",
        "label": "\"Cevaplarını görmek için sabırsızlanıyorum\""
      },
      {
        "id": "rahat",
        "label": "\"Beni tanısa bile rahat cevaplardım\""
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Birbiriniz hakkında ne düşündüğünüzü açıkça paylaşın — korkmayın 😊",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "romantik-jest",
    "category": "itiraf",
    "subcategory": "easter-egg",
    "trait": "paylasim-istahi",
    "level": 3,
    "intensity": 3,
    "type": "choice",
    "prompt": "🥚 Karşındaki kişiyi gülümsetmek istesen — soru sormadan — ne yapardın?",
    "options": [
      {
        "id": "kahve",
        "label": "Habersiz kahvesini ısmarlarım"
      },
      {
        "id": "not",
        "label": "Küçük bir not yazarım — beklemediği yerde bulsun"
      },
      {
        "id": "playlist",
        "label": "Ona özel bir playlist yaparım"
      },
      {
        "id": "saril",
        "label": "Hiç bir şey söylemeden sarılırım"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Hangisi sizi daha çok gülümsetirdi? Birbirinize söyleyin 🥰",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "bagislanma",
    "category": "iletisim",
    "subcategory": "affetme",
    "trait": "guven-inshasi",
    "level": 4,
    "intensity": 3,
    "type": "slider",
    "prompt": "Güveni kırılan birini affetmek senin için ne kadar kolay?",
    "options": [],
    "spark_score": 5,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": false,
    "followup_prompt": "Güven konusunda birbirinizden ne bekliyorsunuz?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Affederim ama unutmam — güven yeniden inşa edilir",
        "highLabel": "Çok zor — güven bir kere kırılırsa tamir olmaz",
        "midLabel": "Duruma göre değişir"
      }
    }
  },
  {
    "slug": "yaslanma-hayali",
    "category": "gelecek",
    "subcategory": "gelecek",
    "trait": "koklenme-gocebelik",
    "level": 4,
    "intensity": 2,
    "type": "choice",
    "prompt": "Yaşlandığında kendini nasıl bir hayatta görüyorsun?",
    "options": [
      {
        "id": "bahce",
        "label": "Bahçeli bir evde, sakin, aile yakında"
      },
      {
        "id": "sehir",
        "label": "Şehir merkezinde, aktif, sosyal"
      },
      {
        "id": "gezgin",
        "label": "Hala yeni yerler keşfediyor"
      },
      {
        "id": "bilmem",
        "label": "O kadar ilerisi için plan yapmam"
      }
    ],
    "spark_score": 5,
    "fun_score": 4,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Gelecek hayaliniz nasıl bir yaşam hayali çiziyor?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "deger-catismasi",
    "category": "iletisim",
    "subcategory": "değer farkı",
    "trait": "tartisma-tarzi",
    "level": 4,
    "intensity": 3,
    "type": "choice",
    "prompt": "Çok önemsediğin bir konuda yanındaki kişi tam tersini düşünüyor. Ne yaparsın?",
    "options": [
      {
        "id": "konusma",
        "label": "Derinlemesine konuşuruz — ikna değil, anlama"
      },
      {
        "id": "kabul",
        "label": "Farklı düşünebiliriz — saygı duyarım"
      },
      {
        "id": "zor",
        "label": "Zorlanırım ama ifade ederim"
      },
      {
        "id": "mesafe",
        "label": "O konuyu açmam — mesafe koyarım"
      }
    ],
    "spark_score": 5,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Değer farklarıyla nasıl başa çıkıyorsunuz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "aile-gelecek",
    "category": "gelecek",
    "subcategory": "aile",
    "trait": "oncelik-pusulasi",
    "level": 4,
    "intensity": 3,
    "type": "slider",
    "prompt": "Ailenle ilişkinde gelecekte nasıl bir denge istiyorsun?",
    "options": [],
    "spark_score": 5,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": false,
    "followup_prompt": "Aile yakınlığı beklentiniz birbirine uyuyor mu?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Çok yakın — sık görüşme, iç içe",
        "highLabel": "Mesafeli ama sevgi dolu — kendi hayatım önce",
        "midLabel": "Dengede tutmaya çalışırım"
      }
    }
  },
  {
    "slug": "hayat-hizi",
    "category": "ritim",
    "subcategory": "tempo",
    "trait": "tempo",
    "level": 4,
    "intensity": 2,
    "type": "either_or",
    "prompt": "10 yıl sonra hayatının temposu nasıl olsun istersin?",
    "options": [
      {
        "id": "yavasla",
        "label": "Şimdikinden yavaş — daha az iş, daha çok an"
      },
      {
        "id": "hizlan",
        "label": "Şimdikinden hızlı — daha çok proje, daha çok heyecan"
      }
    ],
    "spark_score": 4,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Uzun vadede hayat temponuz aynı yöne mi gidiyor?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "ortak-hesap",
    "category": "para",
    "subcategory": "ortaklık",
    "trait": "para-keyif-dengesi",
    "level": 4,
    "intensity": 3,
    "type": "choice",
    "prompt": "Birlikte yaşanacaksa para yönetimi nasıl olmalı?",
    "options": [
      {
        "id": "ortak",
        "label": "Tek ortak hesap — her şey şeffaf"
      },
      {
        "id": "karma",
        "label": "Ortak hesap + kişisel hesaplar"
      },
      {
        "id": "ayri",
        "label": "Tamamen ayrı — herkes kendi yönetir"
      },
      {
        "id": "farketmez",
        "label": "Önemli değil, güvene dayalı olsun"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Para yönetimi konusunda ne düşünüyorsunuz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "ev-kokusu",
    "category": "ev",
    "subcategory": "yaşam",
    "trait": "ritual-bagliligi",
    "level": 4,
    "intensity": 1,
    "type": "choice",
    "prompt": "İdeal evin kokusu nasıl olurdu?",
    "options": [
      {
        "id": "kahve",
        "label": "Taze kahve — her sabah ritüel"
      },
      {
        "id": "temizlik",
        "label": "Temizlik kokusu — ferah ve düzenli"
      },
      {
        "id": "yemek",
        "label": "Ev yemeği — ocakta bir şeyler kaynıyor"
      },
      {
        "id": "mum",
        "label": "Mum veya tütsü — huzurlu atmosfer"
      }
    ],
    "spark_score": 3,
    "fun_score": 5,
    "est_seconds": 10,
    "shuffle_options": true,
    "followup_prompt": "Ev atmosferi konusunda ortak noktanız var mı?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "bos-ev",
    "category": "ev",
    "subcategory": "yalnızlık",
    "trait": "alan-ihtiyaci",
    "level": 4,
    "intensity": 2,
    "type": "slider",
    "prompt": "Ev tamamen boş — sadece sen varsın. Nasıl hissedersin?",
    "options": [],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 10,
    "shuffle_options": false,
    "followup_prompt": "Yalnız kalma ihtiyacınız ne kadar uyuşuyor?",
    "ai_hint": null,
    "meta": {
      "slider": {
        "min": 1,
        "max": 5,
        "lowLabel": "Harika! En verimli anlarım bunlar",
        "highLabel": "Huzursuz olurum — biri olsa daha iyi",
        "midLabel": "Keyifli ama uzun süre istemem"
      }
    }
  },
  {
    "slug": "miras-yemek",
    "category": "lezzet",
    "subcategory": "kültürel",
    "trait": "nostalji-bagi",
    "level": 4,
    "intensity": 2,
    "type": "either_or",
    "prompt": "Annenin/babanın yaptığı bir yemeği öğrenmeye çalışır mısın?",
    "options": [
      {
        "id": "evet",
        "label": "Mutlaka — o lezzet kaybolmamalı"
      },
      {
        "id": "hayir",
        "label": "Pek değil — kendi yemeklerimi yaparım"
      }
    ],
    "spark_score": 4,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Aile yemek gelenekleriniz nasıl?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "hayat-mottosu",
    "category": "hayal",
    "subcategory": "felsefe",
    "trait": "risk-istahi",
    "level": 4,
    "intensity": 2,
    "type": "choice",
    "prompt": "Hangi cümle sana daha yakın?",
    "options": [
      {
        "id": "dene",
        "label": "\"Denemeden bilemezsin\""
      },
      {
        "id": "sabir",
        "label": "\"Sabreden derviş muradına ermiş\""
      },
      {
        "id": "simdi",
        "label": "\"Şimdi yaşa, yarın belirsiz\""
      },
      {
        "id": "hazirol",
        "label": "\"Hazırlıklı olan şanslıdır\""
      }
    ],
    "spark_score": 5,
    "fun_score": 4,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Hayat felsefeniz birbirini tamamlıyor mu?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "dijital-detoks",
    "category": "ritim",
    "subcategory": "dijital",
    "trait": "alan-ihtiyaci",
    "level": 4,
    "intensity": 1,
    "type": "either_or",
    "prompt": "Bir hafta telefonsuz yaşayabilir misin?",
    "options": [
      {
        "id": "evet",
        "label": "Evet — hatta isterdim"
      },
      {
        "id": "hayir",
        "label": "Zor — çok şey kaçırırım"
      }
    ],
    "spark_score": 3,
    "fun_score": 4,
    "est_seconds": 8,
    "shuffle_options": true,
    "followup_prompt": "Dijital dünyayla ilişkiniz nasıl farklı?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "son-karar",
    "category": "sosyal",
    "subcategory": "karar",
    "trait": "grup-rolu",
    "level": 4,
    "intensity": 2,
    "type": "choice",
    "prompt": "Önemli bir karar verirken son sözü kim söyler?",
    "options": [
      {
        "id": "ben",
        "label": "Ben — sonuçta benim hayatım"
      },
      {
        "id": "birlikte",
        "label": "Birlikte karar veririz"
      },
      {
        "id": "danisma",
        "label": "Güvendiğim insanlara danışırım"
      },
      {
        "id": "ic",
        "label": "İç sesimi dinlerim — sezgilerime güvenirim"
      }
    ],
    "spark_score": 4,
    "fun_score": 3,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Büyük kararlarda birbirinizden ne bekliyorsunuz?",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "yillar-sonra",
    "category": "gelecek",
    "subcategory": "easter-egg",
    "trait": "koklenme-gocebelik",
    "level": 4,
    "intensity": 3,
    "type": "choice",
    "prompt": "🥚 5 yıl sonra karşındaki kişiyle bir yerde karşılaşsan, ne olmasını isterdin?",
    "options": [
      {
        "id": "hala",
        "label": "\"Hala tanışıyoruz\" — devam ediyor"
      },
      {
        "id": "gul",
        "label": "\"Bu uygulamayı hatırlıyor musun?\" diye güleriz"
      },
      {
        "id": "derin",
        "label": "\"Sen benim hayatımı değiştirdin\" derim"
      },
      {
        "id": "kahve",
        "label": "\"Bir kahve içelim mi?\" — yeniden başlarız"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 12,
    "shuffle_options": true,
    "followup_prompt": "Bu cevabı yüksek sesle birbirinize okuyun — ne hissediyorsunuz? 💫",
    "ai_hint": null,
    "meta": {}
  },
  {
    "slug": "itiraf-ani",
    "category": "itiraf",
    "subcategory": "easter-egg",
    "trait": "ifade-tarzi",
    "level": 4,
    "intensity": 3,
    "type": "choice",
    "prompt": "🥚 Bu oturum boyunca karşındaki kişiye söylemek isteyip de söylemediğin bir şey var mı?",
    "options": [
      {
        "id": "var",
        "label": "Var ama söylemem — sır kalsın"
      },
      {
        "id": "soyle",
        "label": "Var ve sonuçlar açılınca söyleyeceğim"
      },
      {
        "id": "yok",
        "label": "Yok — zaten her şeyi söylüyorum"
      },
      {
        "id": "belki",
        "label": "Belki... bu soru cesaretimi artırdı"
      }
    ],
    "spark_score": 5,
    "fun_score": 5,
    "est_seconds": 12,
    "shuffle_options": false,
    "followup_prompt": "Hadi, cesaret zamanı. Birbirinize bir şey itiraf edin — küçük de olabilir 🤫",
    "ai_hint": null,
    "meta": {}
  }
]
$questions$::jsonb) as question(
    slug text,
    category text,
    subcategory text,
    trait text,
    level smallint,
    intensity smallint,
    type text,
    prompt text,
    options jsonb,
    spark_score smallint,
    fun_score smallint,
    est_seconds smallint,
    shuffle_options boolean,
    followup_prompt text,
    ai_hint text,
    meta jsonb
  )
)
insert into public.questions
  (slug, category, subcategory, trait, level, intensity, type, prompt, options, spark_score, fun_score, est_seconds, shuffle_options, followup_prompt, ai_hint, meta)
select
  slug,
  category,
  subcategory,
  trait,
  level,
  intensity,
  type,
  prompt,
  options,
  spark_score,
  fun_score,
  est_seconds,
  shuffle_options,
  followup_prompt,
  ai_hint,
  meta
from seed_questions
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
