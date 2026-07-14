import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { questionRepository } from '../repositories/questionRepository'
import { roomRepository } from '../repositories/activeRoomRepository'
import type { AnswerValue } from '../types/domain'

type Overview = {
  totalRooms: number
  completedRooms: number
  activeRooms: number
  waitingRooms: number
  completionRate: number
  totalParticipants: number
  pairedRooms: number
  pairRate: number
  totalAnswers: number
  avgAnswersPerRoom: number
  avgCompletionMinutes: number | null
  medianCompletionMinutes: number | null
}

type Funnel = {
  created: number
  paired: number
  atLeastOneAnswer: number
  oneCompleted: number
  bothCompleted: number
}

type HourlyEntry = { hour: number; count: number }
type DailyRoom = { date: string; count: number }

type AnalyticsData = {
  overview: Overview
  funnel: Funnel
  dropoff: Record<string, number>
  levelDistribution: Record<string, number>
  hourlyPattern: HourlyEntry[]
  dailyRooms: DailyRoom[]
}

export function AdminDashboard() {
  const [key, setKey] = useState('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  async function fetchData() {
    if (!key.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/analytics?key=${encodeURIComponent(key)}`)
      if (res.status === 401) {
        setError('Yanlış anahtar')
        setLoading(false)
        return
      }
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        setData(json)
        setAuthenticated(true)
      }
    } catch {
      setError('Bağlantı hatası')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!authenticated || !key) return
    const interval = setInterval(() => void fetchData(), 60000)
    return () => clearInterval(interval)
  }, [authenticated, key])

  if (!authenticated) {
    return (
      <section className="admin-login">
        <h1>🔒 Admin</h1>
        <div className="admin-key-row">
          <input
            type="password"
            placeholder="Admin anahtarı"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void fetchData() }}
            className="l-code-input"
            style={{ width: '200px', textAlign: 'left', letterSpacing: 0 }}
          />
          <button
            className="l-btn ghost small"
            type="button"
            disabled={!key.trim() || loading}
            onClick={() => void fetchData()}
          >
            {loading ? '...' : 'Giriş'}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </section>
    )
  }

  if (!data) return null

  const { overview: o, funnel: f } = data

  return (
    <section className="admin-layout">
      <h1>📊 Sohbetlik Analytics</h1>

      {/* Overview */}
      <div className="admin-grid">
        <StatCard label="Toplam Oda" value={o.totalRooms} />
        <StatCard label="Tamamlanan" value={o.completedRooms} sub={`%${o.completionRate}`} />
        <StatCard label="Aktif" value={o.activeRooms} />
        <StatCard label="Bekliyor" value={o.waitingRooms} />
        <StatCard label="Katılımcı" value={o.totalParticipants} />
        <StatCard label="Eşleşen Oda" value={o.pairedRooms} sub={`%${o.pairRate}`} />
        <StatCard label="Toplam Cevap" value={o.totalAnswers} />
        <StatCard label="Ort. Cevap/Oda" value={o.avgAnswersPerRoom} />
      </div>

      {/* Completion time */}
      {(o.avgCompletionMinutes !== null || o.medianCompletionMinutes !== null) && (
        <div className="admin-grid">
          {o.avgCompletionMinutes !== null && (
            <StatCard label="Ort. Tamamlama" value={o.avgCompletionMinutes} sub="dakika" />
          )}
          {o.medianCompletionMinutes !== null && (
            <StatCard label="Medyan Tamamlama" value={o.medianCompletionMinutes} sub="dakika" />
          )}
        </div>
      )}

      {/* Funnel */}
      {f && (
        <div className="admin-section">
          <h2>Dönüşüm Hunisi</h2>
          <div className="admin-funnel">
            <FunnelStep label="Oda Oluşturuldu" value={f.created} max={f.created} />
            <FunnelStep label="Eşleşti (2 kişi)" value={f.paired} max={f.created} />
            <FunnelStep label="İlk Cevap Verildi" value={f.atLeastOneAnswer} max={f.created} />
            <FunnelStep label="1 Kişi Tamamladı" value={f.oneCompleted} max={f.created} />
            <FunnelStep label="İkisi de Tamamladı" value={f.bothCompleted} max={f.created} />
          </div>
        </div>
      )}

      {/* Drop-off */}
      {data.dropoff && (
        <div className="admin-section">
          <h2>Terk Noktaları (tamamlanmayan odalar)</h2>
          <div className="admin-level-bars">
            {Object.entries(data.dropoff).map(([bucket, count]) => (
              <div className="admin-level-row" key={bucket}>
                <span className="admin-level-label" style={{ width: 80 }}>
                  {bucket === '0' ? 'Hiç cevap yok' : bucket === '24' ? '24 (tam)' : `${bucket} cevap`}
                </span>
                <div className="admin-bar-track">
                  <div
                    className="admin-bar-fill dropoff"
                    style={{ width: `${Math.max(4, (count / Math.max(1, o.totalParticipants)) * 100)}%` }}
                  />
                </div>
                <span className="admin-level-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level distribution */}
      <div className="admin-section">
        <h2>Seviye Dağılımı</h2>
        <div className="admin-level-bars">
          {Object.entries(data.levelDistribution).sort().map(([level, count]) => (
            <div className="admin-level-row" key={level}>
              <span className="admin-level-label">Seviye {level}</span>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{ width: `${Math.max(4, (count / o.totalRooms) * 100)}%` }}
                />
              </div>
              <span className="admin-level-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly pattern */}
      {data.hourlyPattern && data.hourlyPattern.some((h) => h.count > 0) && (
        <div className="admin-section">
          <h2>Saatlik Dağılım (UTC)</h2>
          <div className="admin-hourly">
            {data.hourlyPattern.map((h) => {
              const maxCount = Math.max(...data.hourlyPattern.map((x) => x.count), 1)
              return (
                <div className="admin-hourly-bar" key={h.hour}>
                  <div
                    className="admin-hourly-fill"
                    style={{ height: `${Math.max(2, (h.count / maxCount) * 60)}px` }}
                  />
                  <span className="admin-hourly-label">{h.hour}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily rooms */}
      {data.dailyRooms.length > 0 && (
        <div className="admin-section">
          <h2>Son 30 Gün</h2>
          <div className="admin-daily">
            {data.dailyRooms.slice(-14).map((d) => (
              <div className="admin-daily-bar" key={d.date}>
                <div
                  className="admin-daily-fill"
                  style={{
                    height: `${Math.max(4, (d.count / Math.max(...data.dailyRooms.map((x) => x.count))) * 80)}px`,
                  }}
                />
                <span className="admin-daily-label">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DemoRoomButton />

      <p className="admin-footer">Her 60 saniyede otomatik güncellenir</p>
    </section>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-value">{value.toLocaleString('tr-TR')}</span>
      <span className="admin-stat-label">{label}</span>
      {sub && <span className="admin-stat-sub">{sub}</span>}
    </div>
  )
}

function DemoRoomButton() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function createDemo() {
    if (status === 'loading') return
    setStatus('loading')

    try {
      const questionIds = questionRepository.getSessionQuestionIds()
      const questions = questionRepository.getQuestionsByIds(questionIds)

      function randomAnswer(q: typeof questions[number]): AnswerValue {
        if (q.type === 'slider') return Math.floor(Math.random() * 5) + 1
        return q.options[Math.floor(Math.random() * q.options.length)].id
      }

      const hostSession = await roomRepository.createRoom(questionIds)
      const guestSession = await roomRepository.joinRoomByCode(hostSession.room.code)
      if (!guestSession) throw new Error('join failed')

      const answerPairs = questions.map((q) => {
        const hostVal = randomAnswer(q)
        const guestVal = Math.random() > 0.35 ? hostVal : randomAnswer(q)
        return { questionId: q.id, hostVal, guestVal }
      })

      await Promise.all(answerPairs.map(({ questionId, hostVal, guestVal }) =>
        Promise.all([
          roomRepository.saveAnswer({ roomId: hostSession.room.id, participantId: hostSession.participantId, questionId, value: hostVal }),
          roomRepository.saveAnswer({ roomId: guestSession.room.id, participantId: guestSession.participantId, questionId, value: guestVal }),
        ])
      ))

      setStatus('done')
      navigate(`/results/${hostSession.room.id}/${hostSession.participantId}`)
    } catch {
      setStatus('idle')
    }
  }

  return (
    <div style={{ marginTop: 24, textAlign: 'center' }}>
      <button
        className="l-btn primary"
        type="button"
        disabled={status === 'loading'}
        onClick={() => void createDemo()}
        style={{ width: 'auto', padding: '12px 24px' }}
      >
        {status === 'loading' ? 'Oluşturuluyor…' : '🧪 Demo oda oluştur'}
      </button>
    </div>
  )
}

function FunnelStep({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="admin-funnel-step">
      <div className="admin-funnel-bar-track">
        <div className="admin-funnel-bar-fill" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
      <div className="admin-funnel-info">
        <span className="admin-funnel-label">{label}</span>
        <span className="admin-funnel-value">{value} <span className="admin-funnel-pct">(%{pct})</span></span>
      </div>
    </div>
  )
}
