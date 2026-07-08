// Eğilim alanları — kullanıcıya gösterilen sıcak başlıklar.
// Teknik "trait" kelimesi kullanıcıya asla gösterilmez.

export type TendencyAreaSlug =
  | 'iletisim'
  | 'dusunme'
  | 'karar-verme'
  | 'iliski'
  | 'hayata-bakis'
  | 'sohbet'

export type TendencyArea = {
  label: string
  emoji: string
  description: string
}

export const tendencyAreas: Record<TendencyAreaSlug, TendencyArea> = {
  iletisim: {
    label: 'İletişim Tercihleri',
    emoji: '🌱',
    description: 'Dinleme, ifade, tartışma ve temas ritmi',
  },
  dusunme: {
    label: 'Düşünme Yaklaşımı',
    emoji: '💭',
    description: 'Merak, öğrenme ve bilgiyi işleme biçimi',
  },
  'karar-verme': {
    label: 'Karar Verme Stili',
    emoji: '🎯',
    description: 'Plan, spontanlık, risk ve öncelikler',
  },
  iliski: {
    label: 'İlişki Beklentileri',
    emoji: '🤝',
    description: 'Güven, alan, paylaşım ve bağlanma',
  },
  'hayata-bakis': {
    label: 'Hayata Bakış',
    emoji: '🌍',
    description: 'Macera, konfor, nostalji ve tempo',
  },
  sohbet: {
    label: 'Sohbet Dinamikleri',
    emoji: '💬',
    description: 'Mizah, enerji, sosyal rol ve derinlik tercihi',
  },
}

// Trait (eğilim) kaydı — sistemin iç sözlüğü.
// Her trait bir spektrum üzerinde tanımlanır (iki uç eşit derecede geçerli).
// Negatif skor sol ucu, pozitif skor sağ ucu temsil eder.

export type TraitDefinition = {
  description: string
  area: TendencyAreaSlug
  spectrum: [string, string] // [sol uç etiketi, sağ uç etiketi]
}

export const traits: Record<string, TraitDefinition> = {
  // ── 🌱 İletişim Tercihleri ──
  'ifade-tarzi': {
    description: 'Duyguyu dile getirme biçimi.',
    area: 'iletisim',
    spectrum: ['Doğrudan ve net', 'Dolaylı ve yumuşak'],
  },
  'tartisma-tarzi': {
    description: 'Anlaşmazlıkta ilk ihtiyacı.',
    area: 'iletisim',
    spectrum: ['Hemen konuşalım', 'Önce sakinleşeyim'],
  },
  'temas-ritmi': {
    description: 'İletişim sıklığı alışkanlığı ve beklentisi.',
    area: 'iletisim',
    spectrum: ['Sürekli bağlantı', 'Bağımsız ritim'],
  },
  'alan-ihtiyaci': {
    description: 'Kendine alan ihtiyacının dozu.',
    area: 'iletisim',
    spectrum: ['Birlikte şarj', 'Yalnız şarj'],
  },
  'paylasim-istahi': {
    description: 'Deneyimi paylaşma vs içte yaşama eğilimi.',
    area: 'iletisim',
    spectrum: ['Hemen paylaşmak ister', 'İçinde yaşamayı tercih eder'],
  },

  // ── 💭 Düşünme Yaklaşımı ──
  'merak-tarzi': {
    description: 'Yeniyi deneme biçimi ve dozu.',
    area: 'dusunme',
    spectrum: ['Derine inen merak', 'Geniş yüzeyli merak'],
  },
  'karar-hizi': {
    description: 'Karar verme temposu.',
    area: 'dusunme',
    spectrum: ['Hızlı ve sezgisel', 'Yavaş ve analitik'],
  },

  // ── 🎯 Karar Verme Stili ──
  'plan-sevgisi': {
    description: 'Önceden kurgulamaktan aldığı keyif.',
    area: 'karar-verme',
    spectrum: ['Her şey planlanmalı', 'Akışına bırak'],
  },
  spontanlik: {
    description: 'Plansız değişime verdiği ilk tepki.',
    area: 'karar-verme',
    spectrum: ['Değişime açık', 'Öngörülebilirlik tercih eder'],
  },
  'risk-istahi': {
    description: 'Belirsizliğe ve riske toleransı.',
    area: 'karar-verme',
    spectrum: ['Yeni ve belirsiz', 'Bilinen ve güvenli'],
  },
  'oncelik-pusulasi': {
    description: 'Zaman ve enerjiyi neye akıttığı.',
    area: 'karar-verme',
    spectrum: ['Kariyer ve başarı', 'İlişkiler ve deneyimler'],
  },
  'para-keyif-dengesi': {
    description: 'Harcama keyfi ile biriktirme keyfi arasındaki eğilim.',
    area: 'karar-verme',
    spectrum: ['Anı yaşa, harca', 'Biriktir, güvende ol'],
  },

  // ── 🤝 İlişki Beklentileri ──
  'guven-inshasi': {
    description: 'Yeni insanlara güven verme ve duyma hızı.',
    area: 'iliski',
    spectrum: ['Hızlı güvenen', 'Kademeli güvenen'],
  },
  'baglanma-ritmi': {
    description: 'Duygusal yakınlık kurma temposu.',
    area: 'iliski',
    spectrum: ['Hızlı ve yoğun', 'Yavaş ve kademeli'],
  },
  'bagimsizlik-dengesi': {
    description: 'Birliktelikte "biz" ve "ben" alanı dengesi.',
    area: 'iliski',
    spectrum: ['İç içe yaşam', 'Bağımsız yaşam'],
  },

  // ── 🌍 Hayata Bakış ──
  'macera-istahi': {
    description: 'Yeni ve bilinmeyene duyduğu iştah.',
    area: 'hayata-bakis',
    spectrum: ['Keşfetmek', 'Derinleşmek'],
  },
  'konfor-alani': {
    description: 'Bildiği ve sevdiği şeye dönme eğilimi.',
    area: 'hayata-bakis',
    spectrum: ['Sınırları zorlayan', 'Güvenli bölgede kalan'],
  },
  'koklenme-gocebelik': {
    description: 'Kök salma ile yer değiştirme arasındaki eğilim.',
    area: 'hayata-bakis',
    spectrum: ['Kök salmak', 'Yer değiştirmek'],
  },
  'nostalji-bagi': {
    description: 'Geçmişle kurduğu duygusal bağın dozu.',
    area: 'hayata-bakis',
    spectrum: ['Geçmişe bağlı', 'İleriye dönük'],
  },
  tempo: {
    description: 'Günlük hayatı hızlı mı sakin mi yaşadığı.',
    area: 'hayata-bakis',
    spectrum: ['Hızlı yaşayan', 'Sakin yaşayan'],
  },
  'duzen-kaos': {
    description: 'Yaşam alanını organize etme biçimi.',
    area: 'hayata-bakis',
    spectrum: ['Her şeyin bir yeri var', 'Kaos gibi ama sistemim var'],
  },
  'ev-disari-dengesi': {
    description: 'Boş zamanın ev/dışarı dengesi.',
    area: 'hayata-bakis',
    spectrum: ['Ev keyifçisi', 'Dışarı enerjisi'],
  },

  // ── 💬 Sohbet Dinamikleri ──
  'enerji-kaynagi': {
    description: 'Yalnızken mi kalabalıkta mı şarj olduğu.',
    area: 'sohbet',
    spectrum: ['Kalabalıkta şarj', 'Yalnızken şarj'],
  },
  'sosyal-istah': {
    description: 'Sosyal etkinliğe duyduğu genel iştah.',
    area: 'sohbet',
    spectrum: ['Ne kadar çok o kadar iyi', 'Az ama öz'],
  },
  'mizah-tarzi': {
    description: 'Neye ve nasıl güldüğü.',
    area: 'sohbet',
    spectrum: ['Kuru ve ince espri', 'Neşeli ve yüksek enerji'],
  },
  'grup-rolu': {
    description: 'Arkadaş grubunda doğal olarak üstlendiği rol.',
    area: 'sohbet',
    spectrum: ['Organize eden', 'Akışa katılan'],
  },
  'sabah-gece-ritmi': {
    description: 'Enerjinin günün hangi ucunda açıldığı.',
    area: 'sohbet',
    spectrum: ['Sabah enerjisi', 'Gece enerjisi'],
  },

  // ── Zararsız keyifler (alan dışı, sonuçlarda kullanılmaz) ──
  'kucuk-keyifler': {
    description: 'Zararsız kişisel keyifler ve onları yaşama biçimi.',
    area: 'hayata-bakis',
    spectrum: ['Paylaşarak keyif alan', 'Gizlice keyif alan'],
  },
  'ritual-bagliligi': {
    description: 'Küçük alışkanlıklara ve ritüellere bağlılık.',
    area: 'hayata-bakis',
    spectrum: ['Ritüellerine bağlı', 'Esnek ve değişken'],
  },
}

export type TraitSlug = keyof typeof traits
