import { useEffect, useRef, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { HintCounter } from '../components/HintCounter'
import type { ControlMode } from '../experience.types'
import type { FaceTracker } from '../features/faceTracking/FaceTracker'
import { CameraController } from '../features/minigame/controls/CameraController'
import { ClassicController } from '../features/minigame/controls/ClassicController'
import { GameEngine } from '../features/minigame/gameEngine'
import {
  GAME_DURATION_SECONDS,
  GAME_HEIGHT,
  GAME_WIDTH,
  MAX_COLLISIONS,
  type GameFinishReason,
} from '../features/minigame/game.types'

interface MinigameProps {
  mode: ControlMode
  tracker: FaceTracker | null
  neutralNoseY: number | null
  onComplete: (hints: number) => void
  onClassicFallback: () => void
}

export function Minigame({ mode, tracker, neutralNoseY, onComplete, onClassicFallback }: MinigameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const finishRef = useRef(onComplete)
  const [remaining, setRemaining] = useState(GAME_DURATION_SECONDS)
  const [hints, setHints] = useState(0)
  const [collisions, setCollisions] = useState(0)
  const [cameraIssue, setCameraIssue] = useState('')
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => { finishRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    let finishTimer: number | undefined
    if (!canvas) return
    if (mode === 'camera' && (!tracker || neutralNoseY === null)) {
      setCameraIssue('O controle pela câmera perdeu a conexão.')
      return
    }

    if (mode === 'camera' && tracker && videoRef.current) {
      void tracker.attachVideo(videoRef.current).catch((error) => {
        console.warn('A prévia da câmera não pôde ser exibida durante o jogo.', error)
      })
    }

    const controller = mode === 'camera'
      ? new CameraController(tracker as FaceTracker, neutralNoseY as number)
      : new ClassicController()
    const engine = new GameEngine(
      canvas,
      controller,
      mode,
      (snapshot) => {
        setRemaining(Math.ceil(snapshot.remaining))
        setHints(snapshot.hints)
        setCollisions(snapshot.collisions)
      },
      (collected, reason: GameFinishReason) => {
        if (reason === 'collisions') {
          setGameOver(true)
          finishTimer = window.setTimeout(() => finishRef.current(collected), 1600)
          return
        }
        finishRef.current(collected)
      },
    )
    engine.start()
    return () => {
      window.clearTimeout(finishTimer)
      engine.destroy()
    }
  }, [mode, neutralNoseY, tracker])

  return (
    <main className="page-shell minigame-page">
      <BrandHeader />
      <section className="game-stage-wrap">
        <header className="game-hud">
          <div className="timer-block">
            <span>Tempo</span>
            <strong>{String(remaining).padStart(2, '0')}s</strong>
            <small>Impactos: {collisions} / {MAX_COLLISIONS}</small>
          </div>
          <div className="mode-indicator"><i /> {mode === 'camera' ? 'Controle facial ativo' : 'Modo clássico'}</div>
          <HintCounter count={hints} showMaximum />
        </header>
        <div className="canvas-frame">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            aria-label={mode === 'classic'
              ? 'Minigame do pássaro BQ. Toque, clique ou pressione espaço para subir.'
              : 'Minigame do pássaro BQ controlado pelo movimento do rosto.'}
            aria-describedby={mode === 'classic' ? 'game-controls' : undefined}
            tabIndex={mode === 'classic' ? 0 : -1}
          />
          {mode === 'classic' && <p className="control-callout" id="game-controls">Clique, toque ou pressione espaço para subir</p>}
          <p className="orientation-note">Para uma área de jogo maior, use o celular na horizontal.</p>
          {mode === 'camera' && (
            <div className="live-camera-chip"><video ref={videoRef} autoPlay muted playsInline /><span>local</span></div>
          )}
          {cameraIssue && (
            <div className="game-camera-error" role="alert">
              <p>{cameraIssue}</p>
              <button type="button" onClick={onClassicFallback}>Continuar no modo clássico</button>
            </div>
          )}
          {gameOver && (
            <div className="game-over-overlay" role="alert" aria-live="assertive">
              <strong>Game Over</strong>
              <span>Limite de impactos atingido</span>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
