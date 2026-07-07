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
import { useMemo, useState } from 'react'
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
  getHostParticipant,
  getParticipant,
  getParticipantProgress,
  type ConversationRoom,
  type ParticipantProgress,
} from './domain/rooms'
import { buildConversationInsights, getAnswerLabel } from './domain/results'
import { localRoomRepository } from './repositories/localRoomRepository'
import { questionRepository } from './repositories/questionRepository'
import type { AnswerValue } from './types/domain'

const sessionQuestionCount = questionRepository.getSessionQuestionIds().length

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

  function createRoom(target: 'invite' | 'answer') {
    const session = localRoomRepository.createRoom(questionRepository.getSessionQuestionIds())
    const destination =
      target === 'answer'
        ? `/answer/${session.room.id}/${session.participantId}`
        : `/room/${session.room.id}`

    navigate(destination)
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
          <button className="primary-action" type="button" onClick={() => createRoom('invite')}>
            <span>Oda oluştur</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button className="secondary-action" type="button" onClick={() => createRoom('answer')}>
            Örnek akışı dene
          </button>
        </div>
      </div>

      <div className="phone-preview" aria-label="Uygulama önizlemesi">
        <div className="phone-speaker" />
        <div className="preview-card">
          <span className="soft-label">Soru 4/{sessionQuestionCount}</span>
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
  )
}

function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room] = useState(() => (roomId ? localRoomRepository.getRoomById(roomId) : null))
  const [copied, setCopied] = useState(false)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const inviteLink = useMemo(() => (room ? getInviteLink(room.code) : ''), [room])
  const hostParticipant = room ? getHostParticipant(room) : null
  const progressRows = room ? getProgressRows(room, questions.length) : []

  async function copyInvite() {
    await writeClipboard(inviteLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!room || !hostParticipant) {
    return (
      <EmptyState
        title="Oda bulunamadı."
        body="Yeni bir oda oluşturup davet linkini tekrar paylaşabilirsin."
        actionLabel="Yeni oda"
        onAction={() => navigate('/')}
      />
    )
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
        onClick={() => navigate(`/answer/${room.id}/${hostParticipant.id}`)}
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
  const room = roomCode ? localRoomRepository.getRoomByCode(roomCode) : null

  function joinRoom() {
    if (!roomCode) {
      return
    }

    const session = localRoomRepository.joinRoomByCode(roomCode)

    if (session) {
      navigate(`/answer/${session.room.id}/${session.participantId}`)
    }
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
      <button className="primary-action" type="button" onClick={joinRoom}>
        <span>Sorulara geç</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  )
}

function AnswerPage() {
  const { roomId, participantId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(() => (roomId ? localRoomRepository.getRoomById(roomId) : null))
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const participant = room && participantId ? getParticipant(room, participantId) : null
  const initialQuestionIndex = participant ? getFirstUnansweredQuestionIndex(participant, questions) : 0
  const [activeIndex, setActiveIndex] = useState(initialQuestionIndex)
  const safeActiveIndex = Math.min(activeIndex, Math.max(questions.length - 1, 0))
  const activeQuestion = questions[safeActiveIndex]
  const answerCount = participant ? Object.keys(participant.answers).length : 0
  const progress = questions.length > 0 ? Math.round((answerCount / questions.length) * 100) : 0
  const selectedAnswer = activeQuestion && participant ? participant.answers[activeQuestion.id] : undefined
  const canContinue = selectedAnswer !== undefined
  const progressRows = room ? getProgressRows(room, questions.length) : []

  function selectAnswer(value: AnswerValue) {
    if (!room || !participantId || !activeQuestion) {
      return
    }

    const nextRoom = localRoomRepository.saveAnswer({
      roomId: room.id,
      participantId,
      questionId: activeQuestion.id,
      value,
    })

    if (nextRoom) {
      setRoom(nextRoom)
    }
  }

  function nextQuestion() {
    if (!room || !participantId || !canContinue) {
      return
    }

    if (safeActiveIndex === questions.length - 1) {
      navigate(`/waiting/${room.id}/${participantId}`)
      return
    }

    setActiveIndex((current) => current + 1)
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
  const [room] = useState(() => (roomId ? localRoomRepository.getRoomById(roomId) : null))
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const progressRows = room ? getProgressRows(room, questions.length) : []

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
  const [room] = useState(() => (roomId ? localRoomRepository.getRoomById(roomId) : null))
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
      localRoomRepository.deleteRoom(room.id)
    }

    navigate('/')
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
