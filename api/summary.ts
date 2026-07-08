import type { VercelRequest, VercelResponse } from '@vercel/node'

type AnswerPair = {
  prompt: string
  category: string
  person1: string
  person2: string
  followup: string
  aiHint?: string
}

type Insight = {
  tone: 'common' | 'different' | 'prompt'
  title: string
  body: string
}

type RequestBody = {
  pairs: AnswerPair[]
}

const GEMINI_MODEL = 'gemini-2.0-flash-lite'

function buildPrompt(pairs: AnswerPair[]): string {
  const pairLines = pairs
    .map(
      (p, i) =>
        `${i + 1}. [${p.category}] "${p.prompt}"\n   Kişi A: ${p.person1}\n   Kişi B: ${p.person2}${p.aiHint ? `\n   İpucu: ${p.aiHint}` : ''}\n   Takip önerisi: ${p.followup}`,
    )
    .join('\n\n')

  return `Sen iki kişilik bir date sohbet uygulamasının asistanısın. İki kişinin aynı sorulara verdiği cevapları analiz edip sohbet başlatıcı özetler üreteceksin.

KESİN KURALLAR:
- Uyumluluk skoru, yüzde veya puan VERME.
- Yargılayıcı, değerlendirici veya karşılaştırmalı dil KULLANMA ("daha iyi", "yanlış", "uyumsuz" gibi).
- Her insight sohbeti derinleştirmek içindir, karar vermek için değil.
- Türkçe yaz, samimi ve sıcak bir tonla.
- Cevapları "doğru" veya "yanlış" olarak sınıflandırma.

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

3 ile 5 arası insight üret. En az 1 common, 1 different, 1 prompt olsun.

İşte cevap çiftleri:

${pairLines}`
}

async function callGemini(prompt: string, apiKey: string): Promise<Insight[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'

  const parsed = JSON.parse(text)

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini returned non-array response')
  }

  return parsed.map((item: Record<string, unknown>) => ({
    tone: (['common', 'different', 'prompt'].includes(item.tone as string)
      ? item.tone
      : 'prompt') as Insight['tone'],
    title: String(item.title ?? ''),
    body: String(item.body ?? ''),
  }))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
  }

  const body = req.body as RequestBody | undefined

  if (!body?.pairs || !Array.isArray(body.pairs) || body.pairs.length === 0) {
    return res.status(400).json({ error: 'Missing or empty pairs array' })
  }

  try {
    const prompt = buildPrompt(body.pairs)
    const insights = await callGemini(prompt, apiKey)
    return res.status(200).json({ insights })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(502).json({ error: message })
  }
}
