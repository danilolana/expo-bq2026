import { useCallback, useEffect, useRef, useState } from 'react'
import { questions as questionBank } from './data/questions'
import type { Screen } from './experience.types'
import { Intro } from './pages/Intro'
import { Preloader } from './pages/Preloader'
import { Quiz } from './pages/Quiz'
import { Result } from './pages/Result'
import type { Question } from './types'
import { createQuizRound, loadUsedQuestionIds, ROUND_SIZE, saveUsedQuestionIds } from './utils/quizEngine'

const POINTS_PER_CORRECT_ANSWER = 1000

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [availableHints, setAvailableHints] = useState(1)
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([])
  const [round, setRound] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [failedQuestionIndex, setFailedQuestionIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const transitionTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('intro'), 1050)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [screen])

  useEffect(() => () => window.clearTimeout(transitionTimer.current), [])

  const startQuiz = useCallback(() => {
    try {
      const nextRound = createQuizRound(questionBank, loadUsedQuestionIds())
      saveUsedQuestionIds(nextRound.usedIds)
      setRound(nextRound.questions)
      setQuestionIndex(0)
      setSelectedAnswer(null)
      setAvailableHints(1)
      setEliminatedOptions([])
      setScore(0)
      setFailedQuestionIndex(null)
      setError('')
      setScreen('quiz')
    } catch (caughtError) {
      console.error(caughtError)
      setError('Não foi possível preparar a rodada. Recarregue a página e tente novamente.')
      setScreen('intro')
    }
  }, [])

  const useHint = () => {
    const question = round[questionIndex]
    if (availableHints <= 0 || selectedAnswer !== null || !question) return

    const incorrectOptions = question.options
      .map((_, index) => index)
      .filter((index) => index !== question.correctAnswer)

    setAvailableHints(0)
    setEliminatedOptions(incorrectOptions.slice(0, 2))
  }

  const answerQuestion = (answerIndex: number) => {
    const question = round[questionIndex]
    if (selectedAnswer !== null || !question) return

    const isCorrect = answerIndex === question.correctAnswer
    setSelectedAnswer(answerIndex)
    if (isCorrect) setScore((currentScore) => currentScore + POINTS_PER_CORRECT_ANSWER)

    transitionTimer.current = window.setTimeout(() => {
      if (!isCorrect) {
        setFailedQuestionIndex(questionIndex)
        setScreen('result')
      } else if (questionIndex === ROUND_SIZE - 1) {
        setScreen('result')
      } else {
        setQuestionIndex((currentIndex) => currentIndex + 1)
        setSelectedAnswer(null)
        setEliminatedOptions([])
      }
    }, 650)
  }

  if (screen === 'loading') return <Preloader />
  if (screen === 'intro') return <Intro onStart={startQuiz} error={error} />
  if (screen === 'result') return <Result score={score} failedQuestionIndex={failedQuestionIndex} onRestart={startQuiz} />
  if (screen === 'quiz' && round.length === ROUND_SIZE) {
    return <Quiz round={round} questionIndex={questionIndex} selectedAnswer={selectedAnswer} score={score} availableHints={availableHints} eliminatedOptions={eliminatedOptions} onUseHint={useHint} onAnswer={answerQuestion} />
  }

  return <Intro onStart={startQuiz} error="A experiência precisa ser iniciada novamente." />
}
