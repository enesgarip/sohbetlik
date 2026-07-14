import type { VercelRequest, VercelResponse } from '@vercel/node'

type AnswerPair = {
  prompt: string
  category: string
  person1: string
  person2: string
  followup: string
  aiHint?: string
}

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

type Insight = {
  tone: 'common' | 'different' | 'prompt'
  title: string
  body: string
}

type RequestBody = {
  pairs: AnswerPair[]
  personTendencies?: TendencySummary[]
  counterpartTendencies?: TendencySummary[]
}

function formatTendency(t: TendencySummary): string {
  const position =
    t.score <= -1 ? `"${t.spectrum[0]}" ucuna yakın`
    : t.score >= 1 ? `"${t.spectrum[1]}" ucuna yakın`
    : 'ortada'
  const varianceNote = t.variance > 1 ? ' (bağlama göre değişkenlik gösteriyor)' : ''
  return `${t.areaEmoji} ${t.areaLabel} > ${t.trait}: ${position}${varianceNote}`
}

function buildPrompt(
  pairs: AnswerPair[],
  personTendencies?: TendencySummary[],
  counterpartTendencies?: TendencySummary[],
): string {
  const pairLines = pairs
    .map(
      (p, i) =>
        `${i + 1}. [${p.category}] "${p.prompt}"\n   Kişi A: ${p.person1}\n   Kişi B: ${p.person2}${p.aiHint ? `\n   İpucu: ${p.aiHint}` : ''}\n   Takip önerisi: ${p.followup}`,
    )
    .join('\n\n')

  let tendencySection = ''
  if (personTendencies?.length || counterpartTendencies?.length) {
    tendencySection = '\n\nDAVRANIŞ EĞİLİMLERİ (cevaplardan hesaplanmış):'
    if (personTendencies?.length) {
      tendencySection += '\n\nKişi A eğilimleri:\n' + personTendencies.map(formatTendency).join('\n')
    }
    if (counterpartTendencies?.length) {
      tendencySection += '\n\nKişi B eğilimleri:\n' + counterpartTendencies.map(formatTendency).join('\n')
    }
  }

  return `Sen iki kişilik bir sohbet uygulamasının asistanısın. İki kişinin aynı sorulara verdiği cevapları ve bu cevaplardan çıkan davranış eğilimlerini analiz edip sohbet başlatıcı özetler üreteceksin.

KESİN KURALLAR:
- Uyumluluk skoru, yüzde veya puan VERME.
- Yargılayıcı, değerlendirici veya karşılaştırmalı dil KULLANMA ("daha iyi", "yanlış", "uyumsuz" gibi).
- "Sen şöylesin" veya "Karakterin budur" gibi kesin ifadeler KULLANMA.
- Onun yerine "Verdiğin cevaplara göre…", "Görünüşe göre…", "Bu oturumdaki cevaplarına dayanarak…" gibi yumuşak ifadeler kullan.
- Her insight sohbeti derinleştirmek içindir, karar vermek için değil.
- Farklılıkları yargılamadan, merak uyandıran bir tonla çerçevele.
- Çelişkili eğilimleri "esneklik" veya "bağlama duyarlılık" olarak yorumla, tutarsızlık olarak değil.
- Türkçe yaz, samimi ve sıcak bir tonla.
- Eğilim verilerini kullanarak daha zengin yorumlar üret ama asla ham skor veya sayı gösterme.

ÇIKTI FORMATI (sadece JSON, başka metin yok):
[
  { "tone": "common", "title": "kısa başlık", "body": "1-2 cümle" },
  { "tone": "different", "title": "kısa başlık", "body": "1-2 cümle" },
  { "tone": "prompt", "title": "kısa başlık", "body": "1-2 cümle sohbet önerisi" }
]

tone değerleri:
- "common": Ortak nokta veya benzer yaklaşım
- "different": İlginç fark (yargısız, merak uyandıran tonda)
- "prompt": Sohbeti açacak somut bir öneri

4 ile 6 arası insight üret. En az 1 common, 1 different, 1 prompt olsun.

İşte cevap çiftleri:

${pairLines}${tendencySection}`
}

const PRIMARY_MODEL = 'qwen/qwen3.6-27b'
const FALLBACK_MODEL = 'openai/gpt-oss-120b'

function asRecord(item: unknown): Record<string, unknown> {
  return item && typeof item === 'object' ? item as Record<string, unknown> : {}
}

async function callLlm(prompt: string, apiKey: string): Promise<Insight[]> {
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
          tone: (['common', 'different', 'prompt'].includes(item.tone as string)
            ? item.tone
            : 'prompt') as Insight['tone'],
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
    console.error('[summary] GROQ_API_KEY is not configured')
    return res.status(200).json({ insights: [], fallback: true })
  }

  const body = req.body as RequestBody | undefined

  if (!body?.pairs || !Array.isArray(body.pairs) || body.pairs.length === 0) {
    return res.status(400).json({ error: 'Missing or empty pairs array' })
  }

  try {
    const prompt = buildPrompt(body.pairs, body.personTendencies, body.counterpartTendencies)
    const insights = await callLlm(prompt, apiKey)
    return res.status(200).json({ insights })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[summary] AI summary unavailable', message)
    return res.status(200).json({ insights: [], fallback: true })
  }
}
