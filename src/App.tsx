import { useCallback, useEffect, useRef, useState } from 'react'
import { questions as questionBank } from './data/questions'
import type { ControlMode, Screen } from './experience.types'
import type { FaceTracker } from './features/faceTracking/FaceTracker'
import { Calibration } from './pages/Calibration'
import { CameraSetup } from './pages/CameraSetup'
import { GameIntro } from './pages/GameIntro'
import { Intro } from './pages/Intro'
import { Minigame } from './pages/Minigame'
import { MinigameResult } from './pages/MinigameResult'
import { Preloader } from './pages/Preloader'
import { Quiz } from './pages/Quiz'
import { Result } from './pages/Result'
import type { Question } from './types'
import {
  createQuizRound,
  loadUsedQuestionIds,
  ROUND_SIZE,
  saveUsedQuestionIds,
} from './utils/quizEngine'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [controlMode, setControlMode] = useState<ControlMode>('classic')
  const [neutralNoseY, setNeutralNoseY] = useState<number | null>(null)
  const [hintsCollected, setHintsCollected] = useState(0)
  const [availableHints, setAvailableHints] = useState(0)
  const [hintRevealed, setHintRevealed] = useState(false)
  const [round, setRound] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const transitionTimer = useRef<number | undefined>(undefined)
  const trackerRef = useRef<FaceTracker | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('intro'), 1050)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Cada etapa funciona como uma nova tela; evita abrir a próxima no scroll anterior em celulares.
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [screen])

  useEffect(() => () => {
    window.clearTimeout(transitionTimer.current)
    trackerRef.current?.stop()
  }, [])

  const openGameIntro = useCallback(() => {
    setError('')
    setHintsCollected(0)
    setAvailableHints(0)
    setHintRevealed(false)
    setScreen('game-intro')
  }, [])

  const startClassic = useCallback(() => {
    trackerRef.current?.stop()
    trackerRef.current = null
    setControlMode('classic')
    setNeutralNoseY(null)
    setScreen('minigame')
  }, [])

  const openCameraSetup = useCallback(() => {
    setControlMode('camera')
    setScreen('camera-setup')
  }, [])

  const cameraReady = useCallback((tracker: FaceTracker) => {
    trackerRef.current = tracker
    setScreen('calibration')
  }, [])

  const calibrationFinished = useCallback((neutral: number) => {
    setNeutralNoseY(neutral)
    setScreen('minigame')
  }, [])

  const finishMinigame = useCallback((hints: number) => {
    trackerRef.current?.stop()
    trackerRef.current = null
    setHintsCollected(hints)
    setAvailableHints(hints)
    setScreen('minigame-result')
  }, [])

  const startQuiz = useCallback(() => {
    try {
      const nextRound = createQuizRound(questionBank, loadUsedQuestionIds())
      saveUsedQuestionIds(nextRound.usedIds)
      setRound(nextRound.questions)
      setQuestionIndex(0)
      setSelectedAnswer(null)
      setHintRevealed(false)
      setScore(0)
      setError('')
      setScreen('quiz')
    } catch (caughtError) {
      console.error(caughtError)
      setError('Não foi possível preparar a rodada. Recarregue a página e tente novamente.')
      setScreen('intro')
    }
  }, [])

  const useHint = () => {
    if (hintRevealed || availableHints <= 0 || selectedAnswer !== null) return
    setAvailableHints((current) => current - 1)
    setHintRevealed(true)
  }

  const answerQuestion = (answerIndex: number) => {
    if (selectedAnswer !== null || !round[questionIndex]) return
    const isCorrect = answerIndex === round[questionIndex].correctAnswer
    setSelectedAnswer(answerIndex)
    if (isCorrect) setScore((currentScore) => currentScore + 1)

    transitionTimer.current = window.setTimeout(() => {
      if (questionIndex === ROUND_SIZE - 1) {
        setScreen('result')
      } else {
        setQuestionIndex((currentIndex) => currentIndex + 1)
        setSelectedAnswer(null)
        setHintRevealed(false)
      }
    }, 650)
  }

  if (screen === 'loading') return <Preloader />
  if (screen === 'intro') return <Intro onStart={openGameIntro} error={error} />
  if (screen === 'game-intro') return <GameIntro onCamera={openCameraSetup} onClassic={startClassic} />
  if (screen === 'camera-setup') return <CameraSetup onReady={cameraReady} onClassic={startClassic} />
  if (screen === 'calibration' && trackerRef.current) {
    return <Calibration tracker={trackerRef.current} onCalibrated={calibrationFinished} onClassic={startClassic} />
  }
  if (screen === 'minigame') {
    return (
      <Minigame
        mode={controlMode}
        tracker={trackerRef.current}
        neutralNoseY={neutralNoseY}
        onComplete={finishMinigame}
        onClassicFallback={startClassic}
      />
    )
  }
  if (screen === 'minigame-result') return <MinigameResult hints={hintsCollected} onStartQuiz={startQuiz} />
  if (screen === 'result') return <Result score={score} onRestart={openGameIntro} />
  if (screen === 'quiz' && round.length === ROUND_SIZE) {
    return (
      <Quiz
        round={round}
        questionIndex={questionIndex}
        selectedAnswer={selectedAnswer}
        score={score}
        availableHints={availableHints}
        hintRevealed={hintRevealed}
        onUseHint={useHint}
        onAnswer={answerQuestion}
      />
    )
  }

  return <Intro onStart={openGameIntro} error="A experiência precisa ser iniciada novamente." />
}
