import {
  ArrowRight,
  CheckCircle2,
  Copy,
  HeartHandshake,
  Link,
  MessageCircle,
  QrCode,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'
import { mvpQuestions } from './data/questions'
import type {
  AnswerValue,
  ConversationInsight,
  Question,
  Stage,
} from './types/domain'

const participants = [
  { name: 'Sen', progressOffset: 0 },
  { name: 'Davetli', progressOffset: 2 },
]

const sharedInsights: ConversationInsight[] = [
  {
    title: 'Benzer ritimler',
    body: 'İkiniz de günün temposunu ilişki enerjisini etkileyen bir şey olarak görüyorsunuz.',
  },
  {
    title: 'Güzel bir fark',
    body: 'Biri daha planlı akışı severken diğeri keşfe açık duruyor. Bu, buluşma planlarında iyi bir denge yaratabilir.',
  },
  {
    title: 'Konuşmaya değer konu',
    body: 'Mesajlaşma sıklığı ve alan ihtiyacı üzerine kısa, sakin bir sohbet iyi gelebilir.',
  },
]

function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

function getAnswerLabel(question: Question, value: AnswerValue | undefined) {
  if (value === undefined) {
    return 'Henüz seçilmedi'
  }

  if (question.type === 'slider') {
    return `${value} / 5`
  }

  return question.options.find((option) => option.id === value)?.label ?? String(value)
}

function App() {
  const [stage, setStage] = useState<Stage>('intro')
  const [roomCode] = useState(makeRoomCode)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [copied, setCopied] = useState(false)

  const activeQuestion = mvpQuestions[activeIndex]
  const answerCount = Object.keys(answers).length
  const progress = Math.round((answerCount / mvpQuestions.length) * 100)
  const inviteLink = useMemo(
    () => `${window.location.origin}/join/${roomCode.toLowerCase()}`,
    [roomCode],
  )

  const selectedAnswer = answers[activeQuestion.id]
  const canContinue = selectedAnswer !== undefined

  function createRoom() {
    setStage('room')
  }

  function selectAnswer(value: AnswerValue) {
    setAnswers((current) => ({ ...current, [activeQuestion.id]: value }))
  }

  function nextQuestion() {
    if (!canContinue) {
      return
    }

    if (activeIndex === mvpQuestions.length - 1) {
      setStage('waiting')
      return
    }

    setActiveIndex((current) => current + 1)
  }

  async function copyInvite() {
    await navigator.clipboard?.writeText(inviteLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function resetDemo() {
    setStage('intro')
    setActiveIndex(0)
    setAnswers({})
    setCopied(false)
  }

  return (
    <main className="app-shell">
      <section className="experience">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Sohbetlik ana sayfa">
            <span className="brand-mark">
              <HeartHandshake size={22} aria-hidden="true" />
            </span>
            <span>Sohbetlik</span>
          </a>
          <div className="room-status">
            <Users size={17} aria-hidden="true" />
            <span>2 kişilik oda</span>
          </div>
        </header>

        {stage === 'intro' && (
          <section className="intro-layout" aria-labelledby="intro-title">
            <div className="intro-copy">
              <h1 id="intro-title">Doğru cevaplar değil, güzel sohbetler.</h1>
              <p>
                Date sırasında aynı soru setini ayrı ayrı cevaplayın; sonra
                ortak yönleri ve konuşmaya değer başlıkları birlikte görün.
              </p>
              <div className="action-row">
                <button className="primary-action" type="button" onClick={createRoom}>
                  <span>Oda oluştur</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button className="secondary-action" type="button" onClick={() => setStage('answering')}>
                  Örnek akışı dene
                </button>
              </div>
            </div>

            <div className="phone-preview" aria-label="Uygulama önizlemesi">
              <div className="phone-speaker" />
              <div className="preview-card">
                <span className="soft-label">Soru 4/{mvpQuestions.length}</span>
                <h2>Enerjin daha çok ne zaman açılır?</h2>
                <div className="choice-stack">
                  <span>Sabah</span>
                  <span className="selected-choice">Gece</span>
                </div>
              </div>
              <div className="mini-result">
                <Sparkles size={18} aria-hidden="true" />
                <span>Konuşmaya değer konular hazır</span>
              </div>
            </div>
          </section>
        )}

        {stage === 'room' && (
          <section className="room-layout" aria-labelledby="room-title">
            <div className="room-copy">
              <h1 id="room-title">Odan hazır.</h1>
              <p>Davet linkini gönder veya QR ekranını göster. İkiniz de girince aynı soru seti açılacak.</p>
            </div>

            <div className="invite-panel">
              <div className="qr-block" aria-label="QR kod alanı">
                <QrCode size={92} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <div className="invite-details">
                <span className="soft-label">Oda kodu</span>
                <strong>{roomCode}</strong>
                <button className="copy-button" type="button" onClick={copyInvite}>
                  {copied ? <CheckCircle2 size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                  <span>{copied ? 'Kopyalandı' : 'Davet linki'}</span>
                </button>
              </div>
            </div>

            <button className="primary-action wide" type="button" onClick={() => setStage('answering')}>
              <span>Soru setine başla</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>
        )}

        {stage === 'answering' && (
          <section className="question-layout" aria-labelledby="question-title">
            <div className="question-head">
              <span className="soft-label">Soru {activeIndex + 1}/{mvpQuestions.length}</span>
              <div className="progress-track" aria-label={`İlerleme yüzde ${progress}`}>
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <article className="question-panel">
              <div className="category-line">
                <MessageCircle size={18} aria-hidden="true" />
                <span>{activeQuestion.category} · Seviye {activeQuestion.level}</span>
              </div>
              <h1 id="question-title">{activeQuestion.prompt}</h1>

              {activeQuestion.type === 'slider' ? (
                <div className="slider-area">
                  <div className="slider-labels">
                    <span>{activeQuestion.lowLabel}</span>
                    <span>{activeQuestion.highLabel}</span>
                  </div>
                  <input
                    aria-label={activeQuestion.prompt}
                    type="range"
                    min="1"
                    max="5"
                    value={Number(selectedAnswer ?? 3)}
                    onChange={(event) => selectAnswer(Number(event.target.value))}
                  />
                  <output>{getAnswerLabel(activeQuestion, selectedAnswer ?? 3)}</output>
                </div>
              ) : (
                <div className="answer-grid">
                  {activeQuestion.options.map((option) => (
                    <button
                      className={selectedAnswer === option.id ? 'answer-option active' : 'answer-option'}
                      key={option.id}
                      type="button"
                      onClick={() => selectAnswer(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              <button className="primary-action wide" type="button" disabled={!canContinue} onClick={nextQuestion}>
                <span>{activeIndex === mvpQuestions.length - 1 ? 'Cevapları tamamla' : 'Sonraki soru'}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </article>

            <div className="participants">
              {participants.map((participant) => {
                const count = Math.min(answerCount + participant.progressOffset, mvpQuestions.length)

                return (
                  <div className="participant-row" key={participant.name}>
                    <span>{participant.name}</span>
                    <strong>{count}/{mvpQuestions.length}</strong>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {stage === 'waiting' && (
          <section className="waiting-layout" aria-labelledby="waiting-title">
            <div className="pulse-orbit">
              <Sparkles size={34} aria-hidden="true" />
            </div>
            <h1 id="waiting-title">Cevaplar tamamlandı.</h1>
            <p>Şimdi ortak noktaları ve konuşmayı açabilecek başlıkları birlikte görebilirsiniz.</p>
            <button className="primary-action" type="button" onClick={() => setStage('results')}>
              <span>Sonuçları aç</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>
        )}

        {stage === 'results' && (
          <section className="results-layout" aria-labelledby="results-title">
            <div className="results-head">
              <span className="soft-label">Ortak özet</span>
              <h1 id="results-title">Konuşmanın güzel yerleri burada.</h1>
              <p>Bu ekran bir karar vermek için değil, sohbeti daha rahat devam ettirmek için.</p>
            </div>

            <div className="insight-list">
              {sharedInsights.map((insight) => (
                <article className="insight-item" key={insight.title}>
                  <Sparkles size={18} aria-hidden="true" />
                  <div>
                    <h2>{insight.title}</h2>
                    <p>{insight.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="answer-recap">
              <span className="soft-label">Senin son cevabın</span>
              <strong>{getAnswerLabel(activeQuestion, answers[activeQuestion.id])}</strong>
            </div>

            <div className="action-row center">
              <button className="secondary-action" type="button" onClick={resetDemo}>
                <RotateCcw size={17} aria-hidden="true" />
                Yeni oda
              </button>
              <button className="primary-action" type="button" onClick={() => setStage('room')}>
                <Link size={17} aria-hidden="true" />
                Davet linki
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
