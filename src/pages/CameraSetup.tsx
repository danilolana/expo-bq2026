import { useEffect, useRef, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { FaceTracker } from '../features/faceTracking/FaceTracker'
import { CameraSetupError } from '../features/faceTracking/faceTracking.types'

interface CameraSetupProps {
  onReady: (tracker: FaceTracker) => void
  onClassic: () => void
}

const friendlyError = (error: unknown) => {
  if (!(error instanceof CameraSetupError)) return 'Não conseguimos usar sua câmera neste dispositivo.'
  if (error.kind === 'permission') return 'A permissão da câmera não foi concedida.'
  if (error.kind === 'not-found') return 'Nenhuma câmera foi encontrada neste dispositivo.'
  if (error.kind === 'busy') return 'A câmera parece estar sendo usada por outro aplicativo.'
  if (error.kind === 'unsupported') return 'Este navegador não oferece acesso à câmera.'
  if (error.kind === 'model') return 'O controle facial não pôde ser carregado agora.'
  return 'Não conseguimos usar sua câmera neste dispositivo.'
}

export function CameraSetup({ onReady, onClassic }: CameraSetupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackerRef = useRef<FaceTracker | null>(null)
  const [status, setStatus] = useState('Solicitando acesso à câmera…')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let handedOff = false
    const tracker = new FaceTracker()
    trackerRef.current = tracker

    const setup = async () => {
      try {
        if (!videoRef.current) return
        await tracker.startCamera(videoRef.current)
        if (!active) {
          tracker.stop()
          return
        }
        setStatus('Câmera pronta. Carregando controle facial…')
        await tracker.initialize()
        if (!active) return
        tracker.startTracking()
        handedOff = true
        onReady(tracker)
      } catch (caughtError) {
        console.error('Falha na configuração da câmera.', caughtError)
        if (active) setError(friendlyError(caughtError))
      }
    }

    void setup()
    return () => {
      active = false
      if (!handedOff) tracker.stop()
    }
  }, [onReady])

  const useClassic = () => {
    trackerRef.current?.stop()
    onClassic()
  }

  return (
    <main className="page-shell game-flow-page">
      <BrandHeader />
      <section className="setup-card">
        <div className="camera-preview camera-preview--setup">
          <video ref={videoRef} autoPlay muted playsInline aria-label="Prévia da câmera" />
          <span className="scan-line" aria-hidden="true" />
        </div>
        <div className="setup-copy">
          <p className="eyebrow"><span /> Controle por câmera</p>
          <h1>{error ? 'Tudo bem.' : 'Preparando a experiência'}</h1>
          {error ? (
            <p className="camera-error" role="alert">{error}<br />Você ainda pode jogar normalmente.</p>
          ) : <p className="setup-status" role="status">{status}</p>}
          <p className="privacy-note">
            Sua câmera é utilizada apenas para controlar o jogo. As imagens são processadas neste dispositivo e não são armazenadas.
          </p>
          <button className={error ? 'primary-button' : 'secondary-button'} type="button" onClick={useClassic}>
            Jogar no modo clássico
          </button>
        </div>
      </section>
    </main>
  )
}
