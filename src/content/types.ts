import type { QuestionLevel, QuestionType } from '../types/domain'
import type { CategorySlug } from './categories'
import type { TraitSlug } from './traits'

export type QuestionContentOption = {
  id: string
  label: string
  emoji?: string
}

export type SliderScale = {
  min: number
  max: number
  lowLabel: string
  highLabel: string
}

export type QuestionStatus = 'draft' | 'active' | 'retired'

export type Score = 1 | 2 | 3 | 4 | 5

// Havuzdaki her sorunun tam metadata'sı.
// Şema referansı: docs/product/QUESTION_SYSTEM_DESIGN.md, Bölüm 6.
// Kalite standardı: docs/product/QUESTION_WRITING_GUIDE.md.
export type QuestionContent = {
  slug: string
  category: CategorySlug
  subcategory?: string
  trait: TraitSlug
  level: QuestionLevel
  // Seviye İÇİ derinlik: 1 hafif, 3 o seviyenin en derini.
  intensity: 1 | 2 | 3
  type: QuestionType
  estSeconds: number
  // Sohbet başlatma gücü — yazar kalibrasyonu.
  sparkScore: Score
  // Cevaplama keyfi — yazar kalibrasyonu.
  funScore: Score
  prompt: string
  options?: QuestionContentOption[]
  slider?: SliderScale
  shuffleOptions: boolean
  // Sonuç ekranında gösterilecek sohbet önerisi.
  followupPrompt: string
  // Gelecekteki AI özet fonksiyonuna ton rehberi.
  aiHint?: string
  // "Bu soru neden kaliteli" — yalnızca repoda kalır, veritabanına gitmez.
  qualityNote: string
  status: QuestionStatus
}
