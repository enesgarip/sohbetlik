import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import type { BehaviorSnapshot, TendencyScore } from '../domain/tendencyScoring'

type ShareCardProps = {
  snapshot: BehaviorSnapshot
  roomCode: string
  level?: number
}

function getTopTendencies(snapshot: BehaviorSnapshot): TendencyScore[] {
  return snapshot.tendencies
    .filter((t) => t.confidence !== 'low')
    .sort((a, b) => Math.abs(b.rawScore) - Math.abs(a.rawScore))
    .slice(0, 5)
}

function getPositionLabel(score: number, spectrum: [string, string]): string {
  if (score <= -1.2) return spectrum[0]
  if (score >= 1.2) return spectrum[1]
  if (score <= -0.4) return `${spectrum[0]} tarafına yakın`
  if (score >= 0.4) return `${spectrum[1]} tarafına yakın`
  return 'Dengede'
}

export function ShareCard({ snapshot, roomCode, level }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCard, setShowCard] = useState(false)

  const topTendencies = getTopTendencies(snapshot)

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current || isGenerating) return
    setIsGenerating(true)

    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        backgroundColor: '#F7F4EF',
      })

      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `sohbetlik-${roomCode}.png`, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] })
          setIsGenerating(false)
          return
        }
      }

      const link = document.createElement('a')
      link.download = `sohbetlik-${roomCode}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Share failed:', err)
    }

    setIsGenerating(false)
  }, [isGenerating, roomCode])

  if (topTendencies.length === 0) return null

  return (
    <>
      <button
        className="r-btn ghost share-btn"
        type="button"
        onClick={() => {
          setShowCard(true)
          requestAnimationFrame(() => void handleGenerate())
        }}
        disabled={isGenerating}
      >
        {isGenerating ? 'Hazırlanıyor…' : 'Sonuç kartını paylaş'}
      </button>

      {showCard && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div
            ref={cardRef}
            style={{
              width: 1080,
              height: 1920,
              background: 'linear-gradient(165deg, #F7F4EF 0%, #EDE8DF 40%, #E8E0D5 100%)',
              display: 'flex',
              flexDirection: 'column',
              padding: '100px 80px 80px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: -120,
              right: -80,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,149,108,0.12) 0%, transparent 70%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 200,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,166,120,0.1) 0%, transparent 70%)',
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 88,
                height: 88,
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(200,149,108,0.2), rgba(139,166,120,0.15))',
                marginBottom: 28,
              }}>
                <span style={{ fontSize: 40 }}>💬</span>
              </div>
              <h2 style={{
                fontSize: 52,
                fontWeight: 780,
                color: '#22201C',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: 0,
              }}>
                Senin Tarzın
              </h2>
              {level && (
                <p style={{
                  fontSize: 24,
                  color: '#b8885e',
                  fontWeight: 650,
                  marginTop: 12,
                  margin: '12px 0 0',
                }}>
                  Seviye {level}
                </p>
              )}
            </div>

            {/* Tendency items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36, flex: 1 }}>
              {topTendencies.map((t) => {
                const percent = Math.max(8, Math.min(92, Math.round(((t.rawScore + 2) / 4) * 100)))
                const posLabel = getPositionLabel(t.rawScore, t.spectrum)
                return (
                  <div key={t.trait} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>{t.areaEmoji}</span>
                      <span style={{
                        fontSize: 21,
                        fontWeight: 700,
                        color: '#8C8680',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.06em',
                      }}>
                        {t.areaLabel}
                      </span>
                    </div>
                    {/* Position label */}
                    <p style={{
                      fontSize: 28,
                      fontWeight: 650,
                      color: '#22201C',
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      {posLabel}
                    </p>
                    {/* Track */}
                    <div style={{
                      position: 'relative' as const,
                      height: 8,
                      background: 'rgba(34,32,28,0.06)',
                      borderRadius: 4,
                    }}>
                      <div style={{
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #c8956c, #ddb892)',
                        opacity: 0.4,
                      }} />
                      <div style={{
                        position: 'absolute' as const,
                        top: '50%',
                        left: `${percent}%`,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#c8956c',
                        border: '3px solid #F7F4EF',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                      <span style={{ fontSize: 18, color: '#8C8680', maxWidth: '44%', lineHeight: 1.3 }}>
                        {t.spectrum[0]}
                      </span>
                      <span style={{ fontSize: 18, color: '#8C8680', maxWidth: '44%', textAlign: 'right' as const, lineHeight: 1.3 }}>
                        {t.spectrum[1]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Footer */}
            <div style={{
              textAlign: 'center',
              paddingTop: 48,
              borderTop: '1px solid rgba(34,32,28,0.08)',
              marginTop: 32,
            }}>
              <p style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#22201C',
                margin: '0 0 8px',
                letterSpacing: '-0.01em',
              }}>
                Sen de dene!
              </p>
              <p style={{
                fontSize: 24,
                color: '#8C8680',
                margin: '0 0 16px',
              }}>
                Oda: {roomCode}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 32px',
                borderRadius: 14,
                background: '#22201C',
              }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  sohbetlik.vercel.app
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
