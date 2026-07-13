import { useState, useEffect } from 'react'

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
}

type DailyRoom = { date: string; count: number }

type AnalyticsData = {
  overview: Overview
  levelDistribution: Record<string, number>
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

  // Auto-refresh every 60s
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

  const { overview: o } = data

  return (
    <section className="admin-layout">
      <h1>📊 Sohbetlik Analytics</h1>

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
