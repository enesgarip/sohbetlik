import type { Question, ConversationInsight } from '../types/domain'
import type { AnswerMap } from '../types/domain'
import type { BehaviorSnapshot } from '../domain/tendencyScoring'
import { getAnswerLabel } from '../domain/results'

type ReportData = {
  roomCode: string
  level: number
  questions: Question[]
  personAnswers: AnswerMap
  counterpartAnswers?: AnswerMap
  insights: ConversationInsight[]
  tendencies: BehaviorSnapshot | null
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function generateReport(data: ReportData) {
  const { roomCode, level, questions, personAnswers, counterpartAnswers, insights, tendencies } = data

  const answerRows = questions
    .filter((q) => personAnswers[q.id] !== undefined)
    .map((q) => {
      const personLabel = getAnswerLabel(q, personAnswers[q.id])
      const counterpartLabel = counterpartAnswers?.[q.id] !== undefined
        ? getAnswerLabel(q, counterpartAnswers[q.id])
        : null
      const isSame = counterpartLabel !== null && personLabel === counterpartLabel
      return `
        <tr>
          <td>${escapeHtml(q.prompt)}</td>
          <td>${escapeHtml(personLabel)}</td>
          ${counterpartLabel !== null ? `<td class="${isSame ? 'same' : 'diff'}">${escapeHtml(counterpartLabel)}</td>` : ''}
        </tr>`
    })
    .join('')

  const insightItems = insights
    .map((i) => `
      <div class="insight ${i.tone}">
        <span class="tone">${i.tone === 'common' ? '🟢' : i.tone === 'different' ? '🟠' : '💬'}</span>
        <div>
          <strong>${escapeHtml(i.title)}</strong>
          <p>${escapeHtml(i.body)}</p>
        </div>
      </div>`)
    .join('')

  const tendencyItems = tendencies
    ? tendencies.tendencies
        .filter((t) => t.confidence !== 'low')
        .sort((a, b) => Math.abs(b.rawScore) - Math.abs(a.rawScore))
        .slice(0, 8)
        .map((t) => {
          const pct = Math.max(5, Math.min(95, Math.round(((t.rawScore + 2) / 4) * 100)))
          return `
          <div class="tendency">
            <span class="emoji">${t.areaEmoji}</span>
            <span class="label">${escapeHtml(t.areaLabel)}</span>
            <div class="track"><div class="dot" style="left:${pct}%"></div></div>
            <div class="spectrum">
              <span>${escapeHtml(t.spectrum[0])}</span>
              <span>${escapeHtml(t.spectrum[1])}</span>
            </div>
          </div>`
        })
        .join('')
    : ''

  const hasCounterpart = counterpartAnswers && Object.keys(counterpartAnswers).length > 0

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Sohbetlik Raporu — ${roomCode}</title>
<style>
  @media print { @page { margin: 1.5cm; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #22201C; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.5; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .meta { color: #8C8680; margin-bottom: 24px; }
  h2 { font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  th { background: #faf8f5; font-weight: 600; }
  td.same { color: #5a8a42; }
  td.diff { color: #c47832; }
  .insight { display: flex; gap: 10px; margin-bottom: 12px; padding: 10px; border-radius: 8px; background: #faf8f5; }
  .insight .tone { font-size: 18px; }
  .insight strong { display: block; margin-bottom: 2px; }
  .insight p { color: #555; font-size: 13px; }
  .tendency { margin-bottom: 14px; }
  .tendency .emoji { font-size: 16px; margin-right: 6px; }
  .tendency .label { font-weight: 600; font-size: 13px; text-transform: uppercase; color: #8C8680; }
  .tendency .track { position: relative; height: 6px; background: #eee; border-radius: 3px; margin: 6px 0 4px; }
  .tendency .dot { position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 50%; background: #c8956c; transform: translate(-50%, -50%); }
  .tendency .spectrum { display: flex; justify-content: space-between; font-size: 11px; color: #8C8680; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee; text-align: center; color: #8C8680; font-size: 12px; }
  .print-btn { display: block; margin: 0 auto 24px; padding: 10px 28px; background: #22201C; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">PDF olarak kaydet</button>
  <h1>💬 Sohbetlik Raporu</h1>
  <p class="meta">Oda: ${escapeHtml(roomCode)} · Seviye ${level} · ${new Date().toLocaleDateString('tr-TR')}</p>

  ${insightItems ? `<h2>Yorumlar</h2>${insightItems}` : ''}

  ${tendencyItems ? `<h2>Eğilimler</h2>${tendencyItems}` : ''}

  <h2>Cevaplar</h2>
  <table>
    <thead>
      <tr>
        <th>Soru</th>
        <th>Sen</th>
        ${hasCounterpart ? '<th>Partner</th>' : ''}
      </tr>
    </thead>
    <tbody>${answerRows}</tbody>
  </table>

  <div class="footer">sohbetlik.vercel.app</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const fileName = `sohbetlik-rapor-${roomCode}.html`
  const a = document.createElement('a')
  const supportsDownload = 'download' in a
  a.href = url
  a.download = fileName
  a.style.display = 'none'

  if (supportsDownload) {
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } else {
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      window.location.href = url
    }
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
