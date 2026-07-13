import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  HeartHandshake,
  Link as LinkIcon,
  MessageCircle,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Users,
  X,
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
  useSearchParams,
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
import { calculateTendencies, compareTendencies } from './domain/tendencyScoring'
import type { AreaSummary } from './domain/tendencyScoring'
import { ShareCard } from './components/ShareCard'
import { AdminDashboard } from './components/AdminDashboard'
import { useCommunityNorms, getNormLabel } from './lib/communityNorms'
import { REACTION_OPTIONS, getReactions, toggleReaction, type ReactionType } from './lib/reactions'
import { cycleBookmark, getBookmark, type BookmarkStatus } from './lib/questionBookmarks'
import { calculateTimeStats, formatDuration } from './lib/answerStats'
import { generateReport } from './lib/pdfReport'
import { useRoom } from './hooks/useRoom'
import {
  applyPendingAnswers,
  resolvePendingAnswer,
  trackPendingAnswer,
} from './lib/pendingAnswers'
import { getSeenQuestionSlugs, recordSeenQuestions } from './lib/seenQuestions'
import { saveSession, updateSessionNextRoom } from './lib/sessionHistory'
import { maybeCleanupStaleRooms } from './lib/roomCleanup'
import { fetchAiSummary, fetchCrossLevelSummary, buildLevelTendencyData } from './lib/summaryApi'
import type { CrossLevelInsight, LevelTendencyData } from './lib/summaryApi'
import { canAskNotificationPermission, requestNotificationPermission, sendLocalNotification } from './lib/notifications'
import { getVariant, trackEvent } from './lib/abTest'
import { roomRepository } from './repositories/activeRoomRepository'
import { questionRepository } from './repositories/questionRepository'
import type { AnswerValue, ConversationInsight, QuestionLevel } from './types/domain'

function getInviteLink(roomCode: string) {
  return `${window.location.origin}/join/${roomCode.toLowerCase()}`
}

function getRoomQuestions(room: ConversationRoom) {
  return questionRepository.getQuestionsByIds(room.questionIds)
}

function getRoomLevel(questions: { level: QuestionLevel }[]) {
  return questions.reduce<QuestionLevel>((highest, question) => {
    return question.level > highest ? question.level : highest
  }, 1)
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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  )
}

const AB_COPY = {
  A: {
    subtitle: 'Aynı soruları ayrı ayrı cevaplayın, sonra ortak noktalarınızı ve ilginç farklarınızı birlikte keşfedin.',
    cta: 'Oda oluştur',
    bottomCta: 'Hemen başla',
  },
  B: {
    subtitle: 'Birbirinizi ne kadar iyi tanıyorsunuz? 24 soru, 7 dakika — sürprizlere hazır olun.',
    cta: 'Sohbete başla',
    bottomCta: 'Ücretsiz dene',
  },
} as const

function HomePage() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const variant = useMemo(() => getVariant(), [])
  const copy = AB_COPY[variant]

  useEffect(() => {
    maybeCleanupStaleRooms()
  }, [])

  async function lookupRoom() {
    const trimmed = roomCode.trim().toUpperCase()
    if (!trimmed || isLookingUp) return

    setIsLookingUp(true)
    setCodeError(null)

    try {
      const found = await roomRepository.getRoomByCode(trimmed)
      if (found) {
        navigate(`/room/${found.id}`)
      } else {
        setCodeError('Bu kodla oda bulunamadı.')
      }
    } catch {
      setCodeError('Oda aranırken bir sorun oldu.')
    }

    setIsLookingUp(false)
  }

  async function createRoom() {
    if (isCreating) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const questionIds = questionRepository.getSessionQuestionIds({
        excludeSlugs: getSeenQuestionSlugs(),
      })
      const session = await roomRepository.createRoom(questionIds)
      recordSeenQuestions(session.room.questionIds)
      saveSession({
        roomId: session.room.id,
        participantId: session.participantId,
        roomCode: session.room.code,
        level: 1,
        questionCount: questionIds.length,
        answeredCount: 0,
        isComplete: false,
        previousRoomId: null,
        nextRoomId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      trackEvent('room_created', variant)
      navigate(`/room/${session.room.id}`)
    } catch {
      setError('Oda oluşturulamadı. Bağlantını kontrol edip tekrar dener misin?')
      setIsCreating(false)
    }
  }

  return (
    <section className="landing" aria-labelledby="intro-title">
      {/* Hero */}
      <div className="l-hero">
        <div className="l-badge">✨ İki kişilik sohbet deneyimi</div>
        <h1 id="intro-title">Doğru cevaplar değil,<br />güzel sohbetler.</h1>
        <p className="l-subtitle">{copy.subtitle}</p>
        <div className="l-cta-row">
          <button
            className="l-btn primary"
            type="button"
            disabled={isCreating}
            onClick={() => void createRoom()}
          >
            <span>{copy.cta}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="l-code-entry">
          <input
            className="l-code-input"
            type="text"
            placeholder="Oda kodu gir"
            maxLength={8}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') void lookupRoom() }}
          />
          <button
            className="l-btn ghost small"
            type="button"
            disabled={!roomCode.trim() || isLookingUp}
            onClick={() => void lookupRoom()}
          >
            Katıl
          </button>
        </div>
        {codeError && <p className="form-error" role="alert">{codeError}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>

      {/* How it works */}
      <div className="l-steps">
        <div className="l-step">
          <span className="l-step-num">1</span>
          <div>
            <strong>Oda oluştur</strong>
            <p>Linki veya kodu karşı tarafa gönder</p>
          </div>
        </div>
        <div className="l-step">
          <span className="l-step-num">2</span>
          <div>
            <strong>Ayrı ayrı cevaplayın</strong>
            <p>16 soru, 7-8 dakika — kişilik testi değil</p>
          </div>
        </div>
        <div className="l-step">
          <span className="l-step-num">3</span>
          <div>
            <strong>Birlikte keşfedin</strong>
            <p>Ortak noktalar, güzel farklar ve sohbet önerileri</p>
          </div>
        </div>
      </div>

      {/* Value props */}
      <div className="l-features">
        <div className="l-feature">
          <span className="l-feature-icon">🎯</span>
          <strong>Eğilimlerini gör</strong>
          <p>30 farklı eğilim, 6 alanda — plan sevgisinden macera iştahına</p>
        </div>
        <div className="l-feature">
          <span className="l-feature-icon">🤝</span>
          <strong>Farkları kutla</strong>
          <p>Farklılıklar sorun değil, sohbet konusu. Yargısız, merak dolu.</p>
        </div>
        <div className="l-feature">
          <span className="l-feature-icon">🔄</span>
          <strong>Her seferinde farklı</strong>
          <p>144 soruluk havuz — tekrar oynayın, yeni sorular gelsin</p>
        </div>
        <div className="l-feature">
          <span className="l-feature-icon">🔒</span>
          <strong>Gizlilik</strong>
          <p>Hesap yok, kayıt yok. Sadece oda kodu ve sohbet.</p>
        </div>
      </div>

      {/* Social proof / teaser */}
      <div className="l-teaser">
        <div className="l-teaser-card">
          <span className="l-teaser-emoji">💬</span>
          <p>"Verdiğin cevaplara göre plan yapmayı seviyorsun ama beklenmedik değişikliklere de rahat uyum sağlıyorsun."</p>
          <span className="l-teaser-label">— Örnek AI yorumu</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="l-bottom-cta">
        <button
          className="l-btn primary"
          type="button"
          disabled={isCreating}
          onClick={() => void createRoom()}
        >
          <span>{copy.bottomCta}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
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

  const [liveMode, setLiveMode] = useState(false)

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
        className={`live-mode-toggle ${liveMode ? 'active' : ''}`}
        type="button"
        onClick={() => setLiveMode(!liveMode)}
      >
        <Users size={16} aria-hidden="true" />
        <span>Canlı mod</span>
        <span className="live-mode-hint">{liveMode ? 'Açık — birlikte cevaplayın' : 'Kapalı — ayrı ayrı cevaplayın'}</span>
      </button>

      <button
        className="primary-action wide"
        type="button"
        onClick={() => navigate(`/answer/${room.id}/${viewerParticipant.id}${liveMode ? '?live=1' : ''}`)}
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

  const hostParticipant = room.participants.find((p) => p.role === 'host')
  const questionCount = room.questionIds.length

  return (
    <section className="join-layout" aria-labelledby="join-title">
      <div className="pulse-orbit">
        <HeartHandshake size={34} aria-hidden="true" />
      </div>
      <span className="soft-label">Oda {room.code}</span>
      <h1 id="join-title">Seni bekliyorlar!</h1>
      <p className="join-desc">
        {hostParticipant && Object.keys(hostParticipant.answers).length > 0
          ? `Karşı taraf çoktan başladı! ${questionCount} soruyu kendi sıranla cevapla, sonra birlikte keşfedin.`
          : `${questionCount} soruyu ayrı ayrı cevaplayacaksınız, sonra ortak noktalarınızı birlikte keşfedeceksiniz.`
        }
      </p>
      <div className="join-info-row">
        <div className="join-info-card">
          <Users size={16} aria-hidden="true" />
          <span>{room.participants.length} kişi odada</span>
        </div>
        <div className="join-info-card">
          <Clock size={16} aria-hidden="true" />
          <span>~{Math.round(questionCount * 0.35)} dk</span>
        </div>
      </div>
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
  const [searchParams] = useSearchParams()
  const isLiveMode = searchParams.get('live') === '1'
  const { room, setRoom, isLoading } = useRoom(roomId)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const participant = room && participantId ? getParticipant(room, participantId) : null
  const counterpart = room?.participants.find((p) => p.id !== participantId) ?? null
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const sliderTimerRef = useRef<number | null>(null)
  const revealTimerRef = useRef<number | null>(null)

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
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current)
      }
    }
  }, [])

  const safeActiveIndex = Math.min(activeIndex ?? 0, Math.max(questions.length - 1, 0))
  const activeQuestion = questions[safeActiveIndex]
  const answerCount = participant ? Object.keys(participant.answers).length : 0
  const progress = questions.length > 0 ? Math.round((answerCount / questions.length) * 100) : 0
  const selectedAnswer = activeQuestion && participant ? participant.answers[activeQuestion.id] : undefined
  const counterpartAnswer = activeQuestion && counterpart ? counterpart.answers[activeQuestion.id] : undefined
  const bothAnswered = selectedAnswer !== undefined && counterpartAnswer !== undefined
  // Slider always has a visual value (defaults to 3), so allow continuing even without explicit interaction
  const canContinue = selectedAnswer !== undefined || activeQuestion?.type === 'slider'
  const progressRows = room ? getProgressRows(room, questions.length) : []

  // Live mode: auto-show reveal when both have answered
  useEffect(() => {
    if (!isLiveMode || !bothAnswered || showReveal) return
    setShowReveal(true)
  }, [isLiveMode, bothAnswered, showReveal])
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
    if (!room || !participantId || !activeQuestion) {
      return
    }

    // For slider questions where the user didn't move the thumb, save the default middle value
    if (activeQuestion.type === 'slider' && selectedAnswer === undefined) {
      const defaultValue = 3
      trackPendingAnswer(participantId, activeQuestion.id, defaultValue)
      setRoom(saveParticipantAnswer(room, participantId, activeQuestion.id, defaultValue))
      persistAnswer(room, participantId, activeQuestion.id, defaultValue)
    }

    flushSliderDebounce()
    setShowReveal(false)

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

        {isLiveMode && canContinue && !bothAnswered && (
          <div className="live-waiting">
            <div className="live-waiting-pulse" />
            <span>Karşı tarafın cevabı bekleniyor…</span>
          </div>
        )}

        {isLiveMode && showReveal && activeQuestion && counterpartAnswer !== undefined && selectedAnswer !== undefined && (
          <div className="live-reveal">
            <div className="live-reveal-header">
              {String(selectedAnswer) === String(counterpartAnswer) ? '🎯' : '✨'}
              <span>{String(selectedAnswer) === String(counterpartAnswer) ? 'Aynı cevap!' : 'Farklı bakış açıları'}</span>
            </div>
            <div className="live-reveal-answers">
              <div className="live-reveal-answer you">
                <span className="live-reveal-who">Sen</span>
                <span className="live-reveal-val">{getAnswerLabel(activeQuestion, selectedAnswer)}</span>
              </div>
              <div className="live-reveal-answer them">
                <span className="live-reveal-who">O</span>
                <span className="live-reveal-val">{getAnswerLabel(activeQuestion, counterpartAnswer)}</span>
              </div>
            </div>
          </div>
        )}

        {isLiveMode ? (
          <button
            className="primary-action wide"
            type="button"
            disabled={!bothAnswered}
            onClick={nextQuestion}
          >
            <span>{safeActiveIndex === questions.length - 1 ? 'Sonuçlara git' : 'Sonraki soru'}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button className="primary-action wide" type="button" disabled={!canContinue} onClick={nextQuestion}>
            <span>{safeActiveIndex === questions.length - 1 ? 'Cevapları tamamla' : 'Sonraki soru'}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </article>

      {isLiveMode && (
        <div className="live-mode-badge">
          <Users size={14} aria-hidden="true" />
          Canlı mod
        </div>
      )}
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
  const allComplete = progressRows.length > 0 && progressRows.every((row) => row.isComplete)
  const notifiedRef = useRef(false)

  // Ask for notification permission once on this page
  useEffect(() => {
    if (canAskNotificationPermission()) {
      void requestNotificationPermission()
    }
  }, [])

  // Notify when partner completes
  useEffect(() => {
    if (allComplete && !notifiedRef.current) {
      notifiedRef.current = true
      sendLocalNotification('Sohbetlik', 'Karşı taraf da tamamladı! Sonuçlar hazır 🎉')
    }
  }, [allComplete])

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
      {allComplete ? (
        <>
          <h1 id="waiting-title">İkiniz de tamamladınız!</h1>
          <p>Ortak noktalar, tatlı farklar ve konuşmayı açabilecek başlıklar hazır.</p>
        </>
      ) : (
        <>
          <h1 id="waiting-title">Senin cevapların tamam.</h1>
          <p>Diğer kişi soruları bitirince sonuçlar birlikte açılacak.</p>
        </>
      )}
      <ProgressList rows={progressRows} />
      <div className="action-row center">
        <button
          className="primary-action"
          type="button"
          disabled={!allComplete}
          onClick={() => {
            saveSession({
              roomId: room.id,
              participantId: participantId!,
              roomCode: room.code,
              level: getRoomLevel(questions),
              questionCount: questions.length,
              answeredCount: questions.length,
              isComplete: true,
              previousRoomId: room.previousRoomId,
              nextRoomId: null,
              createdAt: room.createdAt,
              updatedAt: new Date().toISOString(),
            })
            navigate(`/results/${room.id}/${participantId}`)
          }}
        >
          <span>{allComplete ? 'Sonuçları aç' : 'Bekleniyor…'}</span>
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

function SpectrumBar({ score, spectrum, counterpartScore }: { score: number; spectrum: [string, string]; counterpartScore?: number }) {
  const percent = Math.max(6, Math.min(94, Math.round(((score + 2) / 4) * 100)))
  const cPercent = counterpartScore !== undefined
    ? Math.max(6, Math.min(94, Math.round(((counterpartScore + 2) / 4) * 100)))
    : null

  return (
    <div className="r-spectrum">
      <div className="r-spectrum-track">
        <div className="r-spectrum-fill" style={{ width: `${percent}%` }} />
        <div className="r-spectrum-thumb" style={{ left: `${percent}%` }} title="Sen" />
        {cPercent !== null && (
          <div className="r-spectrum-thumb counterpart" style={{ left: `${cPercent}%` }} title="Karşı taraf" />
        )}
      </div>
      <div className="r-spectrum-labels">
        <span>{spectrum[0]}</span>
        <span>{spectrum[1]}</span>
      </div>
    </div>
  )
}

function TendencyAreaCard({ area, counterpartArea }: { area: AreaSummary; counterpartArea?: AreaSummary }) {
  const visibleTendencies = area.tendencies.filter((t) => t.confidence !== 'low')
  if (visibleTendencies.length === 0) return null

  return (
    <article className="r-area-card">
      <div className="r-area-header">
        <span className="r-area-emoji">{area.emoji}</span>
        <span className="r-area-label">{area.label}</span>
      </div>
      {visibleTendencies.map((t) => {
        const ct = counterpartArea?.tendencies.find((x) => x.trait === t.trait)
        return (
          <SpectrumBar
            key={t.trait}
            score={t.rawScore}
            spectrum={t.spectrum}
            counterpartScore={ct && ct.confidence !== 'low' ? ct.rawScore : undefined}
          />
        )
      })}
    </article>
  )
}

function ResultsPage() {
  const { roomId, participantId } = useParams()
  const navigate = useNavigate()
  const { room, isLoading } = useRoom(roomId)
  const questions = useMemo(() => (room ? getRoomQuestions(room) : []), [room])
  const participant = room && participantId ? getParticipant(room, participantId) : null
  const counterpart = room?.participants.find((candidate) => candidate.id !== participantId) ?? null
  const localInsights = useMemo(
    () => buildConversationInsights(questions, participant?.answers ?? {}, counterpart?.answers),
    [counterpart?.answers, participant?.answers, questions],
  )
  const [aiInsights, setAiInsights] = useState<ConversationInsight[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [isCreatingNextLevel, setIsCreatingNextLevel] = useState(false)
  const [nextLevelError, setNextLevelError] = useState<string | null>(null)
  const aiAttemptedRef = useRef(false)
  const hasBothAnswers = Boolean(participant && counterpart && Object.keys(counterpart.answers).length > 0)
  const currentLevel = getRoomLevel(questions)
  const allParticipantsComplete = room
    ? getProgressRows(room, questions.length).every((row) => row.isComplete)
    : false
  const nextLevel = allParticipantsComplete && currentLevel < 4 ? ((currentLevel + 1) as QuestionLevel) : null

  // Tendency scores
  const personTendencies = useMemo(
    () => (questions.length > 0 && participant ? calculateTendencies(questions, participant.answers) : null),
    [questions, participant],
  )
  const counterpartTendencies = useMemo(
    () => (questions.length > 0 && counterpart && Object.keys(counterpart.answers).length > 0
      ? calculateTendencies(questions, counterpart.answers)
      : null),
    [questions, counterpart],
  )

  const pairInsights = useMemo(
    () => (personTendencies && counterpartTendencies
      ? compareTendencies(personTendencies, counterpartTendencies)
      : []),
    [personTendencies, counterpartTendencies],
  )

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions])
  const { norms } = useCommunityNorms(questionIds)

  const [crossLevelInsights, setCrossLevelInsights] = useState<CrossLevelInsight[] | null>(null)
  const [crossLevelLoading, setCrossLevelLoading] = useState(false)
  const crossLevelAttemptedRef = useRef(false)

  useEffect(() => {
    if (!hasBothAnswers || aiAttemptedRef.current || !participant || !counterpart || questions.length === 0) {
      return
    }

    aiAttemptedRef.current = true
    setAiLoading(true)
    fetchAiSummary(questions, participant.answers, counterpart.answers)
      .then((result) => {
        if (result && result.insights.length > 0) {
          setAiInsights(result.insights)
        }
      })
      .finally(() => setAiLoading(false))
  }, [hasBothAnswers, participant, counterpart, questions])

  useEffect(() => {
    if (!hasBothAnswers || crossLevelAttemptedRef.current || !room?.previousRoomId || !participant || !counterpart || currentLevel < 2) {
      return
    }

    crossLevelAttemptedRef.current = true
    setCrossLevelLoading(true)

    const currentLevelData = buildLevelTendencyData(currentLevel, questions, participant.answers, counterpart.answers)

    async function loadPreviousLevels() {
      const levels: LevelTendencyData[] = [currentLevelData]
      let prevId = room!.previousRoomId

      while (prevId) {
        const prevRoom = await roomRepository.getRoomById(prevId)
        if (!prevRoom) break

        const prevQuestions = getRoomQuestions(prevRoom)
        const prevLevel = getRoomLevel(prevQuestions)
        const prevParticipant = prevRoom.participants.find((p) => p.role === participant!.role)
        const prevCounterpart = prevRoom.participants.find((p) => p.role !== participant!.role)

        if (prevParticipant && prevCounterpart && Object.keys(prevCounterpart.answers).length > 0) {
          levels.push(buildLevelTendencyData(prevLevel, prevQuestions, prevParticipant.answers, prevCounterpart.answers))
        }

        prevId = prevRoom.previousRoomId
      }

      if (levels.length >= 2) {
        const result = await fetchCrossLevelSummary(levels)
        if (result && result.length > 0) {
          setCrossLevelInsights(result)
        }
      }

      setCrossLevelLoading(false)
    }

    void loadPreviousLevels()
  }, [hasBothAnswers, room, participant, counterpart, currentLevel, questions])

  const insights = aiInsights ?? localInsights

  const [showRevealMode, setShowRevealMode] = useState(false)

  const timeStats = useMemo(
    () => (participant ? calculateTimeStats(questions, participant.answerTimestamps) : null),
    [questions, participant],
  )

  function handleDownloadReport() {
    if (!room || !participant) return
    generateReport({
      roomCode: room.code,
      level: currentLevel,
      questions,
      personAnswers: participant.answers,
      counterpartAnswers: counterpart?.answers,
      insights,
      tendencies: personTendencies,
    })
  }

  function resetRoom() {
    if (room) {
      void roomRepository.deleteRoom(room.id)
    }

    navigate('/')
  }

  async function createNextLevelRoom() {
    if (!room || !nextLevel || isCreatingNextLevel) {
      return
    }

    setIsCreatingNextLevel(true)
    setNextLevelError(null)

    try {
      const questionIds = questionRepository.getSessionQuestionIds({
        level: nextLevel,
        excludeSlugs: getSeenQuestionSlugs(),
        hardExcludeSlugs: room.questionIds,
      })
      const session = await roomRepository.createRoom(questionIds, {
        previousRoomId: room.id,
      })
      recordSeenQuestions(session.room.questionIds)
      updateSessionNextRoom(room.id, session.room.id)
      saveSession({
        roomId: session.room.id,
        participantId: session.participantId,
        roomCode: session.room.code,
        level: nextLevel,
        questionCount: questionIds.length,
        answeredCount: 0,
        isComplete: false,
        previousRoomId: room.id,
        nextRoomId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      navigate(`/room/${session.room.id}`)
    } catch {
      setNextLevelError('Yeni seviye odası açılamadı. Birazdan tekrar dener misin?')
      setIsCreatingNextLevel(false)
    }
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
    <section className="r-layout" aria-labelledby="results-title">
      {/* Hero */}
      <div className="r-hero">
        <div className="r-hero-icon">
          <HeartHandshake size={28} aria-hidden="true" />
        </div>
        <h1 id="results-title" className="r-title">Bu oturumdaki<br />cevaplarınıza göre</h1>
        <p className="r-subtitle">Buradaki her şey sohbetinize ilham olması için. Bir karar aracı değil, bir keşif alanı.</p>
      </div>

      {/* AI Loading */}
      {aiLoading && (
        <div className="r-ai-loading">
          <div className="r-pulse" />
          <span>AI yorumları hazırlanıyor…</span>
        </div>
      )}

      {/* Senin Tarzın */}
      {personTendencies && personTendencies.areas.length > 0 && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">Senin Tarzın</span>
            {counterpartTendencies && (
              <div className="r-legend">
                <span className="r-legend-item"><span className="r-legend-dot you" /> Sen</span>
                <span className="r-legend-item"><span className="r-legend-dot them" /> Karşı taraf</span>
              </div>
            )}
          </div>
          <div className="r-area-grid">
            {personTendencies.areas.map((area) => (
              <TendencyAreaCard
                key={area.slug}
                area={area}
                counterpartArea={counterpartTendencies?.areas.find((a) => a.slug === area.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ortak Zemin + Güzel Farklar */}
      {pairInsights.length > 0 && (
        <div className="r-block">
          {pairInsights.filter((p) => p.kind === 'common').length > 0 && (
            <>
              <div className="r-block-header">
                <span className="r-block-label">Ortak Zemin</span>
              </div>
              <div className="r-pair-grid">
                {pairInsights.filter((p) => p.kind === 'common').map((p) => (
                  <article className="r-pair-card common" key={p.trait}>
                    <span className="r-pair-icon">{p.areaEmoji}</span>
                    <div>
                      <p className="r-pair-area">{p.areaLabel}</p>
                      <p className="r-pair-desc">{p.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {pairInsights.filter((p) => p.kind === 'different').length > 0 && (
            <>
              <div className="r-block-header" style={{ marginTop: 12 }}>
                <span className="r-block-label">Güzel Farklar</span>
              </div>
              <div className="r-pair-grid">
                {pairInsights.filter((p) => p.kind === 'different').map((p) => (
                  <article className="r-pair-card different" key={p.trait}>
                    <span className="r-pair-icon">{p.areaEmoji}</span>
                    <div>
                      <p className="r-pair-area">{p.areaLabel}</p>
                      <p className="r-pair-desc">{p.description}</p>
                      <p className="r-pair-talk">{p.talkStarter}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">
              {aiInsights ? 'AI Yorumları' : 'Sohbet Notları'}
            </span>
            {aiInsights && (
              <span className="r-ai-tag">
                <Sparkles size={12} aria-hidden="true" />
                AI
              </span>
            )}
          </div>
          <div className="r-insight-list">
            {insights.map((insight) => (
              <article className={`r-insight ${insight.tone}`} key={`${insight.tone}-${insight.title}`}>
                <div className="r-insight-tone">{insight.tone === 'common' ? '🟢' : insight.tone === 'different' ? '🟠' : '💬'}</div>
                <div>
                  <p className="r-insight-title">{insight.title}</p>
                  <p className="r-insight-body">{insight.body}</p>
                  <ReactionBar itemKey={`insight-${insight.tone}-${insight.title}`} />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Level Summary */}
      {crossLevelInsights && crossLevelInsights.length > 0 && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">Büyük Resim</span>
            <span className="r-ai-tag">
              <Sparkles size={12} aria-hidden="true" />
              AI
            </span>
          </div>
          <p className="r-cross-level-subtitle">Tüm seviyelerin birleşik analizi</p>
          <div className="r-insight-list">
            {crossLevelInsights.map((insight) => (
              <article className={`r-insight ${insight.tone}`} key={`cl-${insight.tone}-${insight.title}`}>
                <div className="r-insight-tone">{insight.tone === 'growth' ? '🌱' : insight.tone === 'pattern' ? '🔄' : '💬'}</div>
                <div>
                  <p className="r-insight-title">{insight.title}</p>
                  <p className="r-insight-body">{insight.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {crossLevelLoading && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">Büyük Resim</span>
          </div>
          <p className="r-loading-text">Seviyeler arası analiz hazırlanıyor…</p>
        </div>
      )}

      {/* Answer Comparison */}
      {hasBothAnswers && participant && counterpart && (
        <AnswerComparison roomId={room.id} questions={questions} personAnswers={participant.answers} counterpartAnswers={counterpart.answers} />
      )}

      {/* Community Norms */}
      {participant && Object.keys(norms).length > 0 && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">Topluluk</span>
          </div>
          <div className="r-norms-list">
            {questions.map((q) => {
              const answer = participant.answers[q.id]
              if (answer === undefined) return null
              const label = getNormLabel(answer, norms[q.id])
              if (!label) return null
              return (
                <div className="r-norm-item" key={q.id}>
                  <p className="r-norm-question">{q.prompt}</p>
                  <span className="r-norm-badge">{label}</span>
                </div>
              )
            }).filter(Boolean).slice(0, 6)}
          </div>
        </div>
      )}

      {/* Time Stats */}
      {timeStats && (
        <div className="r-block">
          <div className="r-block-header">
            <span className="r-block-label">Zamanlama</span>
            <Clock size={14} className="r-block-icon" aria-hidden="true" />
          </div>
          <div className="r-time-stats">
            <div className="r-time-card">
              <span className="r-time-value">{formatDuration(timeStats.totalSeconds)}</span>
              <span className="r-time-label">Toplam süre</span>
            </div>
            <div className="r-time-card">
              <span className="r-time-value">{formatDuration(timeStats.avgSeconds)}</span>
              <span className="r-time-label">Soru başına ort.</span>
            </div>
          </div>
          {timeStats.fastest && (
            <div className="r-time-highlight">
              <span>⚡</span>
              <div>
                <p className="r-time-hl-label">En hızlı cevap ({Math.round(timeStats.fastest.durationMs / 1000)} sn)</p>
                <p className="r-time-hl-prompt">{timeStats.fastest.prompt}</p>
              </div>
            </div>
          )}
          {timeStats.slowest && (
            <div className="r-time-highlight">
              <span>🤔</span>
              <div>
                <p className="r-time-hl-label">En çok düşündüğün ({Math.round(timeStats.slowest.durationMs / 1000)} sn)</p>
                <p className="r-time-hl-prompt">{timeStats.slowest.prompt}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reveal Mode Overlay */}
      {showRevealMode && hasBothAnswers && participant && counterpart && (
        <RevealMode
          questions={questions}
          personAnswers={participant.answers}
          counterpartAnswers={counterpart.answers}
          onClose={() => setShowRevealMode(false)}
        />
      )}

      {/* Actions */}
      <div className="r-actions">
        {hasBothAnswers && (
          <button
            className="r-btn primary reveal-btn"
            type="button"
            onClick={() => setShowRevealMode(true)}
          >
            <Play size={16} aria-hidden="true" />
            Birlikte keşfet
          </button>
        )}
        {nextLevel && (
          <button
            className="r-btn primary"
            type="button"
            disabled={isCreatingNextLevel}
            onClick={() => void createNextLevelRoom()}
          >
            Seviye {nextLevel}'ye geç
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        {personTendencies && (
          <ShareCard snapshot={personTendencies} roomCode={room.code} level={currentLevel} />
        )}
        <button className="r-btn ghost" type="button" onClick={handleDownloadReport}>
          <Download size={15} aria-hidden="true" />
          Rapor indir
        </button>
        <div className="r-btn-row">
          <button className="r-btn ghost" type="button" onClick={() => navigate(`/room/${room.id}`)}>
            <LinkIcon size={15} aria-hidden="true" />
            Davet linki
          </button>
          <button className="r-btn ghost" type="button" onClick={resetRoom}>
            <RotateCcw size={15} aria-hidden="true" />
            Yeni oda
          </button>
        </div>
      </div>
      {nextLevelError && (
        <p className="form-error" role="alert">
          {nextLevelError}
        </p>
      )}
    </section>
  )
}

function AnswerComparison({ roomId, questions, personAnswers, counterpartAnswers }: {
  roomId: string
  questions: import('./types/domain').Question[]
  personAnswers: import('./types/domain').AnswerMap
  counterpartAnswers: import('./types/domain').AnswerMap
}) {
  const [expanded, setExpanded] = useState(false)
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkStatus>>({})

  const comparisons = useMemo(() => {
    const items: Array<{
      question: import('./types/domain').Question
      personLabel: string
      counterpartLabel: string
      isSame: boolean
    }> = []
    for (const q of questions) {
      const pVal = personAnswers[q.id]
      const cVal = counterpartAnswers[q.id]
      if (pVal === undefined || cVal === undefined) continue
      const pLabel = getAnswerLabel(q, pVal)
      const cLabel = getAnswerLabel(q, cVal)
      items.push({ question: q, personLabel: pLabel, counterpartLabel: cLabel, isSame: String(pVal) === String(cVal) })
    }
    return items
  }, [questions, personAnswers, counterpartAnswers])

  const sameCount = comparisons.filter((c) => c.isSame).length
  const diffCount = comparisons.length - sameCount

  const highlights = useMemo(() => {
    const same = comparisons.filter((c) => c.isSame).slice(0, 2)
    const diff = comparisons.filter((c) => !c.isSame).slice(0, 2)
    return [...diff, ...same]
  }, [comparisons])

  if (comparisons.length === 0) return null

  const visibleItems = expanded ? comparisons : highlights

  return (
    <div className="r-block">
      <div className="r-block-header">
        <span className="r-block-label">Cevap Karşılaştırma</span>
        <span className="r-compare-summary">{sameCount} aynı · {diffCount} farklı</span>
      </div>
      <div className="r-compare-list">
        {visibleItems.map((c) => {
          const bm = bookmarks[c.question.id] ?? getBookmark(roomId, c.question.id)
          return (
            <div className={`r-compare-item ${c.isSame ? 'same' : 'diff'}`} key={c.question.id}>
              <div className="r-compare-top">
                <p className="r-compare-prompt">{c.question.prompt}</p>
                <button
                  className={`r-bookmark-btn ${bm ?? ''}`}
                  type="button"
                  title={bm === 'favorite' ? 'Konuşalım' : bm === 'discussed' ? 'Konuştuk' : 'İşaretle'}
                  onClick={() => {
                    const next = cycleBookmark(roomId, c.question.id)
                    setBookmarks((prev) => ({ ...prev, [c.question.id]: next }))
                  }}
                >
                  {bm === 'discussed' ? '✅' : <Star size={14} fill={bm === 'favorite' ? 'currentColor' : 'none'} />}
                </button>
              </div>
              <div className="r-compare-answers">
                <div className="r-compare-answer you">
                  <span className="r-compare-who">Sen</span>
                  <span className="r-compare-val">{c.personLabel}</span>
                </div>
                <div className="r-compare-answer them">
                  <span className="r-compare-who">O</span>
                  <span className="r-compare-val">{c.counterpartLabel}</span>
                </div>
              </div>
              {c.isSame && <span className="r-compare-match-badge">Aynı cevap</span>}
              <ReactionBar itemKey={`compare-${c.question.id}`} />
            </div>
          )
        })}
      </div>
      {comparisons.length > highlights.length && (
        <button className="r-btn ghost" type="button" onClick={() => setExpanded(!expanded)} style={{ fontSize: '0.8rem' }}>
          {expanded ? 'Daha az göster' : `Tümünü göster (${comparisons.length})`}
        </button>
      )}
    </div>
  )
}

function RevealMode({ questions, personAnswers, counterpartAnswers, onClose }: {
  questions: import('./types/domain').Question[]
  personAnswers: import('./types/domain').AnswerMap
  counterpartAnswers: import('./types/domain').AnswerMap
  onClose: () => void
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<'question' | 'reveal'>('question')
  const [animKey, setAnimKey] = useState(0)

  const pairs = useMemo(() => {
    return questions.filter((q) => personAnswers[q.id] !== undefined && counterpartAnswers[q.id] !== undefined)
  }, [questions, personAnswers, counterpartAnswers])

  const current = pairs[currentIdx]

  if (!current) {
    onClose()
    return null
  }

  const personLabel = getAnswerLabel(current, personAnswers[current.id])
  const counterpartLabel = getAnswerLabel(current, counterpartAnswers[current.id])
  const isSame = String(personAnswers[current.id]) === String(counterpartAnswers[current.id])

  function handleReveal() {
    setPhase('reveal')
  }

  function handleNext() {
    if (currentIdx >= pairs.length - 1) {
      onClose()
      return
    }
    setAnimKey((k) => k + 1)
    setCurrentIdx((i) => i + 1)
    setPhase('question')
  }

  function handlePrev() {
    if (currentIdx <= 0) return
    setAnimKey((k) => k + 1)
    setCurrentIdx((i) => i - 1)
    setPhase('question')
  }

  return (
    <div className="reveal-overlay">
      <div className="reveal-chrome">
        <button className="reveal-close" type="button" onClick={onClose} aria-label="Kapat">
          <X size={20} />
        </button>
        <span className="reveal-counter">{currentIdx + 1} / {pairs.length}</span>
        <div className="reveal-progress-track">
          <span style={{ width: `${((currentIdx + 1) / pairs.length) * 100}%` }} />
        </div>
      </div>

      <div className="reveal-content" key={animKey}>
        <div className="reveal-category">
          <MessageCircle size={16} aria-hidden="true" />
          <span>{current.category}</span>
        </div>
        <h2 className="reveal-question">{current.prompt}</h2>

        {phase === 'question' ? (
          <button className="reveal-tap-btn" type="button" onClick={handleReveal}>
            <span className="reveal-tap-icon">👆</span>
            <span>Cevapları göster</span>
          </button>
        ) : (
          <div className="reveal-answers-area">
            <div className={`reveal-match-badge ${isSame ? 'same' : 'diff'}`}>
              {isSame ? '🎯 Aynı cevap!' : '✨ Farklı bakış açıları'}
            </div>
            <div className="reveal-answer-cards">
              <div className="reveal-answer-card you">
                <span className="reveal-who">Sen</span>
                <span className="reveal-val">{personLabel}</span>
              </div>
              <div className="reveal-answer-card them">
                <span className="reveal-who">O</span>
                <span className="reveal-val">{counterpartLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="reveal-nav">
        <button
          className="reveal-nav-btn"
          type="button"
          onClick={handlePrev}
          disabled={currentIdx === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="reveal-nav-btn primary"
          type="button"
          onClick={phase === 'question' ? handleReveal : handleNext}
        >
          {phase === 'question' ? 'Göster' : currentIdx >= pairs.length - 1 ? 'Bitir' : 'Sonraki'}
          {phase === 'reveal' && currentIdx < pairs.length - 1 && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}

function ReactionBar({ itemKey }: { itemKey: string }) {
  const [reactions, setReactions] = useState<ReactionType[]>(() => getReactions(itemKey))

  function handleToggle(emoji: ReactionType) {
    setReactions(toggleReaction(itemKey, emoji))
  }

  return (
    <div className="r-reaction-bar">
      {REACTION_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={`r-reaction-btn ${reactions.includes(emoji) ? 'active' : ''}`}
          onClick={() => handleToggle(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
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
