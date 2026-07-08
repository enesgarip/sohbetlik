import {
  ArrowRight,
  CheckCircle2,
  Copy,
  HeartHandshake,
  Link as LinkIcon,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'
import {
  getFirstUnansweredQuestionIndex,
  getParticipant,
  getParticipantProgress,
  getViewerParticipant,
  saveParticipantAnswer,
  type ConversationRoom,
  type ParticipantProgress,
} from './domain/rooms'
import { getDisplayOptions } from './domain/optionOrder'
import { buildConversationInsights, getAnswerLabel } from './domain/results'
import { useRoom } from './hooks/useRoom'
import {
  applyPendingAnswers,
  resolvePendingAnswer,
  trackPendingAnswer,
} from './lib/pendingAnswers'
import { getSeenQuestionSlugs, recordSeenQuestions } from './lib/seenQuestions'
import { maybeCleanupStaleRooms } from './lib/roomCleanup'
import { roomRepository } from './repositories/activeRoomRepository'
import { questionRepository, SESSION_QUESTION_COUNT } from './repositories/questionRepository'
import type { AnswerValue } from './types/domain'

function getInviteLink(roomCode: string) {
  return `${window.location.origin}/join/${roomCode.toLowerCase()}`
}

function getRoomQuestions(room: ConversationRoom) {
  return questionRepository.getQuestionsByIds(room.questionIds)
}

function getProgressRows(room: ConversationRoom, totalCount: number): ParticipantProgress[] {
  const rows = getParticipantProgress(room, totalCount)
  const hasGuest = room.participants.some((participant) => participant.role === 'guest')

  if (hasGuest) {
    return rows
  }

  return [
    ...rows,
    {
      participantId: 'pending-guest',
      label: 'Davetli',
      answeredCount: 0,
      totalCount,
      isComplete: false,
    },
  ]
}

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard?.writeText(value)
  } catch {
    // Clipboard permissions can fail on some browsers; the QR remains available.
  }
}

function App() {
  return (
    <BrowserRouter>
      <main className="app-shell">
        <section className="experience">
          <header className="topbar">
            <RouterLink className="brand" to="/" aria-label="Sohbetlik ana sayfa">
              <span className="brand-mark">
                <HeartHandshake size={22} aria-hidden="true" />
              </span>
              <span>Sohbetlik</span>
            </RouterLink>
            <div className="room-status">
              <Users size={17} aria-hidden="true" />
              <span>2 kişilik oda</span>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/join/:roomCode" element={<JoinPage />} />
            <Route path="/answer/:roomId/:participantId" element={<AnswerPage />} />
            <Route path="/waiting/:roomId/:participantId" element={<WaitingPage />} />
            <Route path="/results/:roomId/:participantId" element={<ResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    maybeCleanupStaleRooms()
  }, [])

  async function createRoom(target: 'invite' | 'answer') {
    if (isCreating) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const questionIds = questionRepository.getSessionQuestionIds(getSeenQuestionSlugs())
      const session = await roomRepository.createRoom(questionIds)
      recordSeenQuestions(session.room.questionIds)
      const destination =
        target === 'answer'
          ? `/answer/${session.room.id}/${session.participantId}`
          : `/room/${session.room.id}`

      navigate(destination)
    } catch {
      setError('Oda oluşturulamadı. Bağlantını kontrol edip tekrar dener misin?')
      setIsCreating(false)
    }
  }

  return (
    <section className="intro-layout" aria-labelledby="intro-title">
      <div className="intro-copy">
        <h1 id="intro-title">Doğru cevaplar değil, güzel sohbetler.</h1>
        <p>
          Date sırasında aynı soru setini ayrı ayrı cevaplayın; sonra ortak yönleri
          ve konuşmaya değer başlıkları birlikte görün.
        </p>
        <div className="action-row">
          <button
            className="primary-action"
            type="button"
            disabled={isCreating}
            onClick={() => void createRoom('invite')}
          >
            <span>Oda oluştur</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={isCreating}
            onClick={() => void createRoom('answer')}
          >
            Örnek akışı dene
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="phone-preview" aria-label="Uygulama önizlemesi">
        <div className="phone-speaker" />
        <div className="preview-card">
          <span className="soft-label">Soru 4/{SESSION_QUESTION_COUNT}</span>
          <h2>Herkes uyurken sana bir saat hediye edildi. Günün hangi ucuna eklersin?</h2>
          <div className="choice-stack">
            <span>Sabaha — gün doğarken</span>
            <span className="selected-choice">Geceye — herkes susunca</span>
          </div>
        </div>
        <div className="mini-result">
          <Sparkles size={18} aria-hidden="true" />
          <span>Konuşmaya değer konular hazır</span>
        </div>
      </div>
    </section>
  )
}

function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { room, isLoading } = useRoom(roomId)
  const [copied, setCopied] = useState(false)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const inviteLink = useMemo(() => (room ? getInviteLink(room.code) : ''), [room])
  const viewerParticipant = room ? getViewerParticipant(room) : null
  const progressRows = room ? getProgressRows(room, questions.length) : []

  async function copyInvite() {
    await writeClipboard(inviteLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!room) {
    return (
      <EmptyState
        title="Oda bulunamadı."
        body="Yeni bir oda oluşturup davet linkini tekrar paylaşabilirsin."
        actionLabel="Yeni oda"
        onAction={() => navigate('/')}
      />
    )
  }

  if (!viewerParticipant) {
    return <Navigate to={`/join/${room.code}`} replace />
  }

  return (
    <section className="room-layout" aria-labelledby="room-title">
      <div className="room-copy">
        <h1 id="room-title">Odan hazır.</h1>
        <p>Davet linkini gönder veya QR ekranını göster. İkiniz de girince aynı soru seti açılacak.</p>
      </div>

      <div className="invite-panel">
        <div className="qr-block" aria-label="Davet QR kodu">
          <QRCodeSVG
            value={inviteLink}
            size={148}
            bgColor="transparent"
            fgColor="#22201c"
            level="M"
            includeMargin={false}
          />
        </div>
        <div className="invite-details">
          <span className="soft-label">Oda kodu</span>
          <strong>{room.code}</strong>
          <button className="copy-button" type="button" onClick={copyInvite}>
            {copied ? <CheckCircle2 size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            <span>{copied ? 'Kopyalandı' : 'Davet linki'}</span>
          </button>
        </div>
      </div>

      <ProgressList rows={progressRows} />

      <button
        className="primary-action wide"
        type="button"
        onClick={() => navigate(`/answer/${room.id}/${viewerParticipant.id}`)}
      >
        <span>Soru setine başla</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  )
}

function JoinPage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState<ConversationRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomCode) {
      setRoom(null)
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)

    roomRepository
      .getRoomByCode(roomCode)
      .then((found) => {
        if (active) {
          setRoom(found)
        }
      })
      .catch(() => {
        if (active) {
          setRoom(null)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [roomCode])

  async function joinRoom() {
    if (!roomCode || isJoining) {
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      const session = await roomRepository.joinRoomByCode(roomCode)

      if (session) {
        navigate(`/answer/${session.room.id}/${session.participantId}`)
        return
      }

      setError('Odaya şu anda katılamıyorsun. Oda dolmuş olabilir.')
    } catch {
      setError('Katılırken bir sorun oldu. Tekrar dener misin?')
    }

    setIsJoining(false)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!room) {
    return (
      <EmptyState
        title="Bu davet aktif değil."
        body="Link süresi dolmuş olabilir. Yeni bir oda açıp daveti tekrar paylaşabilirsin."
        actionLabel="Ana sayfa"
        onAction={() => navigate('/')}
      />
    )
  }

  return (
    <section className="join-layout" aria-labelledby="join-title">
      <div className="pulse-orbit">
        <HeartHandshake size={34} aria-hidden="true" />
      </div>
      <span className="soft-label">Oda {room.code}</span>
      <h1 id="join-title">Davete katıl.</h1>
      <p>Aynı soru setini kendi sıranla cevaplayacaksın; sonuçta konuşmayı açacak başlıklar birlikte görünecek.</p>
      <button className="primary-action" type="button" disabled={isJoining} onClick={() => void joinRoom()}>
        <span>Sorulara geç</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

function AnswerPage() {
  const { roomId, participantId } = useParams()
  const navigate = useNavigate()
  const { room, setRoom, isLoading } = useRoom(roomId)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const participant = room && participantId ? getParticipant(room, participantId) : null
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const sliderTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (activeIndex === null && room && participant) {
      setActiveIndex(getFirstUnansweredQuestionIndex(participant, getRoomQuestions(room)))
    }
  }, [activeIndex, room, participant])

  useEffect(() => {
    return () => {
      if (sliderTimerRef.current !== null) {
        window.clearTimeout(sliderTimerRef.current)
      }
    }
  }, [])

  const safeActiveIndex = Math.min(activeIndex ?? 0, Math.max(questions.length - 1, 0))
  const activeQuestion = questions[safeActiveIndex]
  const answerCount = participant ? Object.keys(participant.answers).length : 0
  const progress = questions.length > 0 ? Math.round((answerCount / questions.length) * 100) : 0
  const selectedAnswer = activeQuestion && participant ? participant.answers[activeQuestion.id] : undefined
  const canContinue = selectedAnswer !== undefined
  const progressRows = room ? getProgressRows(room, questions.length) : []
  const displayOptions = useMemo(
    () => (room && activeQuestion ? getDisplayOptions(room.id, activeQuestion) : []),
    [room, activeQuestion],
  )

  function persistAnswer(targetRoom: ConversationRoom, targetParticipantId: string, questionId: string, value: AnswerValue) {
    void roomRepository
      .saveAnswer({
        roomId: targetRoom.id,
        participantId: targetParticipantId,
        questionId,
        value,
      })
      .then((nextRoom) => {
        if (nextRoom) {
          resolvePendingAnswer(targetParticipantId, questionId, value)
          setRoom(applyPendingAnswers(nextRoom))
        }
      })
  }

  function selectAnswer(value: AnswerValue) {
    if (!room || !participantId || !activeQuestion) {
      return
    }

    const questionId = activeQuestion.id

    trackPendingAnswer(participantId, questionId, value)
    setRoom(saveParticipantAnswer(room, participantId, questionId, value))
    persistAnswer(room, participantId, questionId, value)
  }

  function selectSliderAnswer(value: AnswerValue) {
    if (!room || !participantId || !activeQuestion) {
      return
    }

    const questionId = activeQuestion.id

    trackPendingAnswer(participantId, questionId, value)
    setRoom(saveParticipantAnswer(room, participantId, questionId, value))

    if (sliderTimerRef.current !== null) {
      window.clearTimeout(sliderTimerRef.current)
    }

    const capturedRoom = room
    const capturedParticipantId = participantId
    sliderTimerRef.current = window.setTimeout(() => {
      sliderTimerRef.current = null
      persistAnswer(capturedRoom, capturedParticipantId, questionId, value)
    }, 300)
  }

  function flushSliderDebounce() {
    if (sliderTimerRef.current !== null) {
      window.clearTimeout(sliderTimerRef.current)
      sliderTimerRef.current = null

      if (room && participantId && activeQuestion && selectedAnswer !== undefined) {
        persistAnswer(room, participantId, activeQuestion.id, selectedAnswer)
      }
    }
  }

  function nextQuestion() {
    if (!room || !participantId || !canContinue) {
      return
    }

    flushSliderDebounce()

    if (safeActiveIndex === questions.length - 1) {
      navigate(`/waiting/${room.id}/${participantId}`)
      return
    }

    setActiveIndex(safeActiveIndex + 1)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!room || !participant || !activeQuestion) {
    return (
      <EmptyState
        title="Sorular açılamadı."
        body="Oda veya katılımcı bilgisi eksik görünüyor."
        actionLabel="Ana sayfa"
        onAction={() => navigate('/')}
      />
    )
  }

  return (
    <section className="question-layout" aria-labelledby="question-title">
      <div className="question-head">
        <span className="soft-label">Soru {safeActiveIndex + 1}/{questions.length}</span>
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
              onChange={(event) => selectSliderAnswer(Number(event.target.value))}
            />
            <output>{getAnswerLabel(activeQuestion, selectedAnswer ?? 3)}</output>
          </div>
        ) : (
          <div className="answer-grid">
            {displayOptions.map((option) => (
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
          <span>{safeActiveIndex === questions.length - 1 ? 'Cevapları tamamla' : 'Sonraki soru'}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </article>

      <ProgressList rows={progressRows} />
    </section>
  )
}

function WaitingPage() {
  const { roomId, participantId } = useParams()
  const navigate = useNavigate()
  const { room, isLoading } = useRoom(roomId)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const progressRows = room ? getProgressRows(room, questions.length) : []

  if (isLoading) {
    return <LoadingState />
  }

  if (!room || !participantId) {
    return (
      <EmptyState
        title="Oda bulunamadı."
        body="Yeni bir oda açıp akışı tekrar başlatabilirsin."
        actionLabel="Ana sayfa"
        onAction={() => navigate('/')}
      />
    )
  }

  return (
    <section className="waiting-layout" aria-labelledby="waiting-title">
      <div className="pulse-orbit">
        <Sparkles size={34} aria-hidden="true" />
      </div>
      <h1 id="waiting-title">Cevaplar tamamlandı.</h1>
      <p>Ortak noktalar, tatlı farklar ve konuşmayı açabilecek başlıklar hazır.</p>
      <ProgressList rows={progressRows} />
      <div className="action-row center">
        <button className="primary-action" type="button" onClick={() => navigate(`/results/${room.id}/${participantId}`)}>
          <span>Sonuçları aç</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button className="secondary-action" type="button" onClick={() => navigate(`/room/${room.id}`)}>
          <LinkIcon size={17} aria-hidden="true" />
          Davet linki
        </button>
      </div>
    </section>
  )
}

function ResultsPage() {
  const { roomId, participantId } = useParams()
  const navigate = useNavigate()
  const { room, isLoading } = useRoom(roomId)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const participant = room && participantId ? getParticipant(room, participantId) : null
  const counterpart = room?.participants.find((candidate) => candidate.id !== participantId) ?? null
  const insights = useMemo(
    () => buildConversationInsights(questions, participant?.answers ?? {}, counterpart?.answers),
    [counterpart?.answers, participant?.answers, questions],
  )
  const lastAnsweredQuestion =
    participant && [...questions].reverse().find((question) => participant.answers[question.id] !== undefined)

  function resetRoom() {
    if (room) {
      void roomRepository.deleteRoom(room.id)
    }

    navigate('/')
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!room || !participant) {
    return (
      <EmptyState
        title="Sonuçlar açılamadı."
        body="Oda veya katılımcı bilgisi eksik görünüyor."
        actionLabel="Ana sayfa"
        onAction={() => navigate('/')}
      />
    )
  }

  return (
    <section className="results-layout" aria-labelledby="results-title">
      <div className="results-head">
        <span className="soft-label">Ortak özet</span>
        <h1 id="results-title">Konuşmanın güzel yerleri burada.</h1>
        <p>Bu ekran bir karar vermek için değil, sohbeti daha rahat devam ettirmek için.</p>
      </div>

      <div className="insight-list">
        {insights.map((insight) => (
          <article className={`insight-item ${insight.tone}`} key={`${insight.tone}-${insight.title}`}>
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <h2>{insight.title}</h2>
              <p>{insight.body}</p>
            </div>
          </article>
        ))}
      </div>

      {lastAnsweredQuestion && (
        <div className="answer-recap">
          <span className="soft-label">Senin son cevabın</span>
          <strong>{getAnswerLabel(lastAnsweredQuestion, participant.answers[lastAnsweredQuestion.id])}</strong>
        </div>
      )}

      <div className="action-row center">
        <button className="secondary-action" type="button" onClick={resetRoom}>
          <RotateCcw size={17} aria-hidden="true" />
          Yeni oda
        </button>
        <button className="primary-action" type="button" onClick={() => navigate(`/room/${room.id}`)}>
          <LinkIcon size={17} aria-hidden="true" />
          Davet linki
        </button>
      </div>
    </section>
  )
}

function ProgressList({ rows }: { rows: ParticipantProgress[] }) {
  return (
    <div className="participants">
      {rows.map((row) => (
        <div className="participant-row" key={row.participantId}>
          <span>{row.label}</span>
          <strong>{row.answeredCount}/{row.totalCount}</strong>
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <section className="empty-layout" aria-busy="true">
      <div className="pulse-orbit">
        <Sparkles size={34} aria-hidden="true" />
      </div>
      <h1>Oda yükleniyor…</h1>
      <p>Bir saniye, bilgiler geliyor.</p>
    </section>
  )
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <section className="empty-layout" aria-labelledby="empty-title">
      <div className="pulse-orbit">
        <Sparkles size={34} aria-hidden="true" />
      </div>
      <h1 id="empty-title">{title}</h1>
      <p>{body}</p>
      <button className="primary-action" type="button" onClick={onAction}>
        <span>{actionLabel}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  )
}

export default App
