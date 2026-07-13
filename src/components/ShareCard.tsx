import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import type { BehaviorSnapshot, TendencyScore, AreaSummary } from '../domain/tendencyScoring'

type ShareCardProps = {
  snapshot: BehaviorSnapshot
  roomCode: string
}

function getPositionLabel(score: number, spectrum: [string, string]): string {
  if (score <= -1) return spectrum[0]
  if (score >= 1) return spectrum[1]
  return 'Dengede'
}

function getTopTendencies(snapshot: BehaviorSnapshot): TendencyScore[] {
  return snapshot.tendencies
    .filter((t) => t.confidence !== 'low')
    .sort((a, b) => Math.abs(b.rawScore) - Math.abs(a.rawScore))
    .slice(0, 5)
}

export function ShareCard({ snapshot, roomCode }: ShareCardProps) {
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

      // Try native share first, fallback to download
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `sohbetlik-${roomCode}.png`, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] })
          setIsGenerating(false)
          return
        }
      }

      // Fallback: download
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

      {/* Off-screen render target */}
      {showCard && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div
            ref={cardRef}
            style={{
              width: 1080,
              height: 1920,
              background: 'linear-gradient(180deg, #F7F4EF 0%, #EDE8DF 100%)',
              display: 'flex',
              flexDirection: 'column',
              padding: '120px 80px 80px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(200,149,108,0.2), rgba(139,166,120,0.15))',
                marginBottom: 32,
              }}>
                <span style={{ fontSize: 36 }}>💬</span>
              </div>
              <h2 style={{
                fontSize: 56,
                fontWeight: 780,
                color: '#22201C',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: 0,
              }}>
                Senin Tarzın
              </h2>
              <p style={{
                fontSize: 28,
                color: '#8C8680',
                marginTop: 16,
                margin: '16px 0 0',
              }}>
                Bu oturumdaki cevaplarına göre
              </p>
            </div>

            {/* Tendency items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, flex: 1 }}>
              {topTendencies.map((t) => {
                const percent = Math.max(8, Math.min(92, Math.round(((t.rawScore + 2) / 4) * 100)))
                return (
                  <div key={t.trait} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <span style={{ fontSize: 28 }}>{t.areaEmoji}</span>
                      <span style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#8C8680',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.06em',
                      }}>
                        {t.areaLabel}
                      </span>
                    </div>
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
                    {/* Labels */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 24,
                    }}>
                      <span style={{ fontSize: 20, color: '#8C8680', maxWidth: '44%', lineHeight: 1.3 }}>
                        {t.spectrum[0]}
                      </span>
                      <span style={{ fontSize: 20, color: '#8C8680', maxWidth: '44%', textAlign: 'right' as const, lineHeight: 1.3 }}>
                        {t.spectrum[1]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              paddingTop: 60,
              borderTop: '1px solid rgba(34,32,28,0.08)',
              marginTop: 40,
            }}>
              <p style={{
                fontSize: 24,
                color: '#8C8680',
                margin: '0 0 8px',
              }}>
                Oda: {roomCode}
              </p>
              <p style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#22201C',
                letterSpacing: '-0.01em',
                margin: 0,
              }}>
                sohbetlik.vercel.app
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
