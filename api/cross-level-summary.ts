import type { VercelRequest, VercelResponse } from '@vercel/node'

type TendencySummary = {
  trait: string
  area: string
  areaLabel: string
  areaEmoji: string
  spectrum: [string, string]
  score: number
  confidence: string
  variance: number
}

type LevelData = {
  level: number
  personTendencies: TendencySummary[]
  counterpartTendencies: TendencySummary[]
}

type CrossLevelInsight = {
  tone: 'growth' | 'pattern' | 'prompt'
  title: string
  body: string
}

type RequestBody = {
  levels: LevelData[]
}

function formatTendency(t: TendencySummary): string {
  const position =
    t.score <= -1 ? `"${t.spectrum[0]}" ucuna yakın`
    : t.score >= 1 ? `"${t.spectrum[1]}" ucuna yakın`
    : 'ortada'
  return `${t.areaEmoji} ${t.areaLabel} > ${t.trait}: ${position}`
}

function buildPrompt(levels: LevelData[]): string {
  const levelSections = levels
    .sort((a, b) => a.level - b.level)
    .map((l) => {
      let section = `\n--- Seviye ${l.level} ---`
      if (l.personTendencies.length > 0) {
        section += '\nKişi A eğilimleri:\n' + l.personTendencies.map(formatTendency).join('\n')
      }
      if (l.counterpartTendencies.length > 0) {
        section += '\nKişi B eğilimleri:\n' + l.counterpartTendencies.map(formatTendency).join('\n')
      }
      return section
    })
    .join('\n')

  return `Sen iki kişilik bir sohbet uygulamasının asistanısın. Bu çift birden fazla seviye oynadı. Her seviyedeki davranış eğilimlerini karşılaştırarak büyük resmi çıkaracaksın.

KESİN KURALLAR:
- Uyumluluk skoru, yüzde veya puan VERME.
- Yargılayıcı, değerlendirici veya karşılaştırmalı dil KULLANMA ("daha iyi", "yanlış", "uyumsuz" gibi).
- "Sen şöylesin" veya "Karakterin budur" gibi kesin ifadeler KULLANMA.
- Onun yerine "Cevaplarınıza göre…", "Görünüşe göre…" gibi yumuşak ifadeler kullan.
- Farklılıkları yargılamadan, merak uyandıran bir tonla çerçevele.
- Seviyeler arası değişimi "büyüme" veya "derinleşme" olarak yorumla, tutarsızlık olarak değil.
- Türkçe yaz, samimi ve sıcak bir tonla.
- Asla ham skor veya sayı gösterme.

ÇIKTI FORMATI (sadece JSON, başka metin yok):
[
  { "tone": "growth", "title": "kısa başlık", "body": "1-2 cümle" },
  { "tone": "pattern", "title": "kısa başlık", "body": "1-2 cümle" },
  { "tone": "prompt", "title": "kısa başlık", "body": "1-2 cümle sohbet önerisi" }
]

tone değerleri:
- "growth": Seviyeler arası değişim veya derinleşme
- "pattern": Tüm seviyelerde tutarlı olan bir eğilim veya ortak nokta
- "prompt": Seviyelerin büyük resminden çıkan sohbet önerisi

3 ile 5 arası insight üret. En az 1 growth, 1 pattern, 1 prompt olsun.

İşte seviye bazında eğilimler:
${levelSections}`
}

const PRIMARY_MODEL = 'qwen/qwen3.6-27b'
const FALLBACK_MODEL = 'openai/gpt-oss-120b'

function asRecord(item: unknown): Record<string, unknown> {
  return item && typeof item === 'object' ? item as Record<string, unknown> : {}
}

async function callLlm(prompt: string, apiKey: string): Promise<CrossLevelInsight[]> {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL]
  let lastError = ''

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Sen Türkçe konuşan bir yapay zeka asistanısın. Tüm yanıtlarını doğal, akıcı ve hatasız Türkçe ile yazmalısın. Uydurma kelime üretme, her kelime gerçek Türkçe olmalı.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        lastError = `${model}: ${response.status} ${text}`
        continue
      }

      const data = await response.json()
      const text: string = data?.choices?.[0]?.message?.content ?? '[]'

      const parsed = JSON.parse(text)
      const items: unknown[] = Array.isArray(parsed) ? parsed : parsed?.insights ?? parsed?.data ?? []

      if (!Array.isArray(items) || items.length === 0) {
        lastError = `${model}: empty or non-array response`
        continue
      }

      return items.map((rawItem) => {
        const item = asRecord(rawItem)

        return {
          tone: (['growth', 'pattern', 'prompt'].includes(item.tone as string)
            ? item.tone
            : 'prompt') as CrossLevelInsight['tone'],
          title: String(item.title ?? ''),
          body: String(item.body ?? ''),
        }
      })
    } catch (err) {
      lastError = `${model}: ${err instanceof Error ? err.message : 'unknown error'}`
      continue
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.error('[cross-level-summary] GROQ_API_KEY is not configured')
    return res.status(200).json({ insights: [], fallback: true })
  }

  const body = req.body as RequestBody | undefined

  if (!body?.levels || !Array.isArray(body.levels) || body.levels.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 levels of data' })
  }

  try {
    const prompt = buildPrompt(body.levels)
    const insights = await callLlm(prompt, apiKey)
    return res.status(200).json({ insights })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[cross-level-summary] AI summary unavailable', message)
    return res.status(200).json({ insights: [], fallback: true })
  }
}
