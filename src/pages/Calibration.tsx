import { useEffect, useRef, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { getStableNosePosition } from '../features/faceTracking/calibration'
import type { FaceTracker } from '../features/faceTracking/FaceTracker'
import type { FaceReading } from '../features/faceTracking/faceTracking.types'

interface CalibrationProps {
  tracker: FaceTracker
  onCalibrated: (neutralNoseY: number) => void
  onClassic: () => void
}

export function Calibration({ tracker, onCalibrated, onClassic }: CalibrationProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readingsRef = useRef<FaceReading[]>([])
  const completedRef = useRef(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    let active = true
    let completionTimer: number | undefined
    if (videoRef.current) void tracker.attachVideo(videoRef.current)
    const unsubscribe = tracker.subscribe((reading) => {
      if (!active || completedRef.current) return
      setFaceDetected(reading.faceDetected)
      readingsRef.current.push(reading)
      readingsRef.current = readingsRef.current.filter((item) => reading.timestamp - item.timestamp <= 2100)
      const neutral = getStableNosePosition(readingsRef.current, reading.timestamp)
      if (neutral !== null) {
        completedRef.current = true
        setCompleted(true)
        completionTimer = window.setTimeout(() => active && onCalibrated(neutral), 350)
      }
    })
    const timeout = window.setTimeout(() => setTimedOut(true), 9000)
    return () => {
      active = false
      unsubscribe()
      window.clearTimeout(timeout)
      window.clearTimeout(completionTimer)
    }
  }, [onCalibrated, tracker])

  return (
    <main className="page-shell game-flow-page">
      <BrandHeader />
      <section className="calibration-card">
        <div className={`camera-preview calibration-preview ${faceDetected ? 'face-found' : ''}`}>
          <video ref={videoRef} autoPlay muted playsInline aria-label="Prévia para calibração" />
          <div className="face-guide" aria-hidden="true"><span /></div>
          <span className="camera-state">{faceDetected ? 'Rosto detectado' : 'Procurando rosto'}</span>
        </div>
        <div className="setup-copy">
          <p className="eyebrow"><span /> Calibração</p>
          <h1>{completed ? 'Calibração concluída' : 'Posicione seu rosto no centro.'}</h1>
          <p>Mantenha a cabeça confortável e estável por alguns instantes. Essa posição será o ponto neutro do jogo.</p>
          <div className={`stability-meter ${faceDetected ? 'is-running' : ''}`} aria-hidden="true"><span /></div>
          {timedOut && !faceDetected && (
            <p className="camera-error" role="alert">Ainda não encontramos seu rosto. Ajuste a iluminação ou use o modo clássico.</p>
          )}
          <button className="secondary-button" type="button" onClick={onClassic}>Prefiro jogar sem câmera</button>
        </div>
      </section>
    </main>
  )
}
