// Trait kaydı — sistemin iç sözlüğü (bkz. docs/product/QUESTION_SYSTEM_DESIGN.md, Bölüm 5).
// Trait'ler kullanıcıya asla gösterilmez, asla puanlanmaz, asla profile dönüştürülmez.
// İşlevleri: seçim algoritmasında çeşitlilik ve gelecekte AI'ya soru bağlamı vermek.

export const traits = {
  // Enerji & ritim
  'sabah-gece-ritmi': 'Enerjinin günün hangi ucunda açıldığı.',
  'enerji-kaynagi': 'Yalnızken mi kalabalıkta mı şarj olduğu.',
  tempo: 'Günlük hayatı hızlı mı sakin mi yaşadığı.',
  // Yenilik & plan
  spontanlik: 'Plansız değişime verdiği ilk tepki.',
  'plan-sevgisi': 'Önceden kurgulamaktan aldığı keyif.',
  'macera-istahi': 'Yeni ve bilinmeyene duyduğu iştah.',
  'konfor-alani': 'Bildiği ve sevdiği şeye dönme eğilimi.',
  'merak-tarzi': 'Yeniyi deneme biçimi ve dozu.',
  // Günlük hayat
  'duzen-kaos': 'Yaşam alanını organize etme biçimi.',
  'ritual-bagliligi': 'Küçük alışkanlıklara ve ritüellere bağlılık.',
  'ev-disari-dengesi': 'Boş zamanın ev/dışarı dengesi.',
  // Sosyal
  'grup-rolu': 'Arkadaş grubunda doğal olarak üstlendiği rol.',
  'sosyal-istah': 'Sosyal etkinliğe duyduğu genel iştah.',
  'mizah-tarzi': 'Neye ve nasıl güldüğü.',
  'paylasim-istahi': 'Deneyimi paylaşma vs içte yaşama eğilimi.',
  // Duygusal (ağırlıklı S3+)
  'alan-ihtiyaci': 'Kendine alan ihtiyacının dozu.',
  'ifade-tarzi': 'Duyguyu dile getirme biçimi.',
  'tartisma-tarzi': 'Anlaşmazlıkta ilk ihtiyacı.',
  'temas-ritmi': 'İletişim sıklığı alışkanlığı ve beklentisi.',
  // Değer & ufuk (ağırlıklı S2-4)
  'para-keyif-dengesi': 'Harcama keyfi ile biriktirme keyfi arasındaki eğilim.',
  'risk-istahi': 'Belirsizliğe ve riske toleransı.',
  'koklenme-gocebelik': 'Kök salma ile yer değiştirme arasındaki eğilim.',
  'oncelik-pusulasi': 'Zaman ve enerjiyi neye akıttığı.',
  'nostalji-bagi': 'Geçmişle kurduğu duygusal bağın dozu.',
  // Zararsız keyifler
  'kucuk-keyifler': 'Zararsız kişisel keyifler ve onları yaşama biçimi.',
} as const

export type TraitSlug = keyof typeof traits
