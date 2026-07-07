import type { AnswerMap, AnswerValue, ConversationInsight, Question } from '../types/domain'

type AnswerPair = {
  question: Question
  currentValue: AnswerValue
  counterpartValue: AnswerValue
}

export function getAnswerLabel(question: Question, value: AnswerValue | undefined) {
  if (value === undefined) {
    return 'Henüz seçilmedi'
  }

  if (question.type === 'slider') {
    return `${value} / 5`
  }

  return question.options.find((option) => option.id === value)?.label ?? String(value)
}

function getAnsweredQuestions(questions: Question[], answers: AnswerMap) {
  return questions.filter((question) => answers[question.id] !== undefined)
}

function getAnswerPairs(questions: Question[], currentAnswers: AnswerMap, counterpartAnswers: AnswerMap) {
  return questions.reduce<AnswerPair[]>((pairs, question) => {
    const currentValue = currentAnswers[question.id]
    const counterpartValue = counterpartAnswers[question.id]

    if (currentValue !== undefined && counterpartValue !== undefined) {
      pairs.push({ question, currentValue, counterpartValue })
    }

    return pairs
  }, [])
}

function buildSoloInsights(questions: Question[], currentAnswers: AnswerMap): ConversationInsight[] {
  const answeredQuestions = getAnsweredQuestions(questions, currentAnswers)
  const focusQuestion = answeredQuestions.find((question) => question.level >= 2) ?? answeredQuestions[0]

  if (!focusQuestion) {
    return [
      {
        tone: 'prompt',
        title: 'İlk kıvılcım',
        body: 'Birkaç hızlı cevap verdikten sonra burası sohbeti açacak başlıklarla dolacak.',
      },
    ]
  }

  return [
    {
      tone: 'common',
      title: 'Ritmini yakaladık',
      body: `${focusQuestion.category} tarafında "${getAnswerLabel(
        focusQuestion,
        currentAnswers[focusQuestion.id],
      )}" cevabın öne çıkıyor. Bunu kısa bir anıyla açmak iyi olabilir.`,
    },
    {
      tone: 'different',
      title: 'Karşı taraf gelince',
      body: 'Aynı sorular tamamlandığında benzer cevaplar, tatlı farklar ve konuşmaya değer başlıklar burada yan yana görünecek.',
    },
    {
      tone: 'prompt',
      title: 'Konuşmaya değer konu',
      body: `"${focusQuestion.prompt}" sorusunu birbirinize gerçek hayattan küçük bir örnekle anlatmayı deneyebilirsiniz.`,
    },
  ]
}

export function buildConversationInsights(
  questions: Question[],
  currentAnswers: AnswerMap,
  counterpartAnswers?: AnswerMap,
): ConversationInsight[] {
  if (!counterpartAnswers) {
    return buildSoloInsights(questions, currentAnswers)
  }

  const answerPairs = getAnswerPairs(questions, currentAnswers, counterpartAnswers)

  if (answerPairs.length === 0) {
    return buildSoloInsights(questions, currentAnswers)
  }

  const matchingPair = answerPairs.find((pair) => pair.currentValue === pair.counterpartValue)
  const differentPair = answerPairs.find((pair) => pair.currentValue !== pair.counterpartValue)
  const topicPair = differentPair ?? matchingPair ?? answerPairs[0]
  const insights: ConversationInsight[] = []

  if (matchingPair) {
    insights.push({
      tone: 'common',
      title: 'Ortak bir yer',
      body: `${matchingPair.question.category} sorusunda ikiniz de "${getAnswerLabel(
        matchingPair.question,
        matchingPair.currentValue,
      )}" dediniz. Bu noktayı küçük bir hikayeyle açabilirsiniz.`,
    })
  }

  if (differentPair) {
    insights.push({
      tone: 'different',
      title: 'Güzel bir fark',
      body: `${differentPair.question.category} tarafında cevaplar ayrışıyor: biri "${getAnswerLabel(
        differentPair.question,
        differentPair.currentValue,
      )}", diğeri "${getAnswerLabel(
        differentPair.question,
        differentPair.counterpartValue,
      )}" dedi. Burada yargıdan çok merak iyi çalışır.`,
    })
  }

  insights.push({
    tone: 'prompt',
    title: 'Konuşmaya değer konu',
    body: `"${topicPair.question.prompt}" sorusunu biraz açın; cevapların arkasındaki alışkanlıklar muhabbeti güzel derinleştirebilir.`,
  })

  return insights
}
