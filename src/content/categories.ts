// Soru kategorileri — tek doğruluk kaynağı (bkz. docs/product/QUESTION_SYSTEM_DESIGN.md, Bölüm 2).
// Slug'lar kalıcıdır ve veritabanındaki questions.category alanında saklanır;
// isimler kullanıcıya görünür ve serbestçe değişebilir.

export const categories = {
  lezzet: {
    name: 'Tat & Mutfak',
    description: 'Yemek ritüelleri, tuhaf kombinler, sokak/ev dengesi.',
  },
  kesif: {
    name: 'Seyahat & Keşif',
    description: 'Plan vs akış, rota hayalleri, tatil ritmi.',
  },
  kultur: {
    name: 'Kültür & Eğlence',
    description: 'Film/dizi/müzik deneyimi — liste değil, davranış.',
  },
  nostalji: {
    name: 'Nostalji & Çocukluk',
    description: 'Yaz tatilleri, ilk’ler, çocukluk kahramanları.',
  },
  ritim: {
    name: 'Günlük Ritim',
    description: 'Sabah/gece, hafta sonu, küçük alışkanlıklar.',
  },
  hayal: {
    name: 'Hayaller & Olasılıklar',
    description: 'Hipotetikler, süper güçler, bir günlük hayatlar.',
  },
  itiraf: {
    name: 'Küçük İtiraflar',
    description: 'Suçlu zevkler ve zararsız tuhaflıklar.',
  },
  sosyal: {
    name: 'Sosyal Dünya',
    description: 'Arkadaş grubundaki rol, kalabalık vs baş başa.',
  },
  ev: {
    name: 'Ev Hâli',
    description: 'Düzen/kaos, ev günü, kişisel alan.',
  },
  para: {
    name: 'Para Alışkanlıkları',
    description: 'Harcama keyfi vs biriktirme keyfi — rakamsız.',
  },
  iletisim: {
    name: 'İletişim & Duygular',
    description: 'Tartışma tarzı, alan ihtiyacı, ifade biçimi.',
  },
  gelecek: {
    name: 'Gelecek & Ufuk',
    description: 'Yaşam hayali, şehir, uzun vade, öncelikler.',
  },
} as const

export type CategorySlug = keyof typeof categories

export function getCategoryName(slug: CategorySlug): string {
  return categories[slug].name
}
