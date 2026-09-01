import type { FaceLandmarker, FilesetResolver as FilesetResolverType } from '@mediapipe/tasks-vision'
import {
  CameraSetupError,
  type FaceReading,
  type FaceReadingListener,
} from './faceTracking.types'

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const TRACKING_INTERVAL_MS = 40

export class FaceTracker {
  private landmarker: FaceLandmarker | null = null
  private stream: MediaStream | null = null
  private processingVideo: HTMLVideoElement | null = null
  private previewVideos = new Set<HTMLVideoElement>()
  private listeners = new Set<FaceReadingListener>()
  private trackingTimer: number | undefined
  private lastVideoTime = -1
  private latestReading: FaceReading | null = null

  async initialize(): Promise<void> {
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_ROOT)
      this.landmarker = await this.createLandmarker(vision.FaceLandmarker, fileset, 'GPU')
    } catch (gpuError) {
      try {
        const vision = await import('@mediapipe/tasks-vision')
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_ROOT)
        this.landmarker = await this.createLandmarker(vision.FaceLandmarker, fileset, 'CPU')
      } catch (cpuError) {
        console.error('Falha ao carregar o Face Landmarker.', { gpuError, cpuError })
        throw new CameraSetupError('model', cpuError)
      }
    }
  }

  private createLandmarker(
    FaceLandmarkerClass: typeof FaceLandmarker,
    fileset: Awaited<ReturnType<typeof FilesetResolverType.forVisionTasks>>,
    delegate: 'GPU' | 'CPU',
  ) {
    return FaceLandmarkerClass.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.55,
      minFacePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    })
  }

  async startCamera(video: HTMLVideoElement): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new CameraSetupError('unsupported')

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      const processingVideo = document.createElement('video')
      processingVideo.srcObject = this.stream
      processingVideo.muted = true
      processingVideo.playsInline = true
      this.processingVideo = processingVideo
      await processingVideo.play()

      void this.attachVideo(video).catch((error) => {
        console.warn('A prévia da câmera não pôde ser reproduzida.', error)
      })
    } catch (error) {
      if (error instanceof CameraSetupError) throw error
      const name = error instanceof DOMException ? error.name : ''
      const kind = name === 'NotAllowedError'
        ? 'permission'
        : name === 'NotFoundError'
          ? 'not-found'
          : name === 'NotReadableError'
            ? 'busy'
            : 'unknown'
      throw new CameraSetupError(kind, error)
    }
  }

  async attachVideo(video: HTMLVideoElement): Promise<void> {
    if (!this.stream) throw new CameraSetupError('not-found')
    this.previewVideos.add(video)
    video.srcObject = this.stream
    video.muted = true
    video.playsInline = true
    await video.play()
  }

  startTracking(): void {
    if (this.trackingTimer !== undefined) return

    const analyze = () => {
      if (!this.landmarker || !this.processingVideo) return
      const now = performance.now()
      let reading: FaceReading = { noseY: 0.5, timestamp: now, faceDetected: false }

      try {
        if (
          this.processingVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          && this.processingVideo.currentTime !== this.lastVideoTime
        ) {
          this.lastVideoTime = this.processingVideo.currentTime
          const result = this.landmarker.detectForVideo(this.processingVideo, now)
          const nose = result.faceLandmarks[0]?.[1]
          if (nose) reading = { noseY: nose.y, timestamp: now, faceDetected: true }
        }
      } catch (error) {
        console.error('Falha durante a leitura facial.', error)
      }

      this.latestReading = reading
      this.listeners.forEach((listener) => listener(reading))
    }

    this.trackingTimer = window.setInterval(analyze, TRACKING_INTERVAL_MS)
  }

  subscribe(listener: FaceReadingListener): () => void {
    this.listeners.add(listener)
    if (this.latestReading) listener(this.latestReading)
    return () => this.listeners.delete(listener)
  }

  getLatestReading(): FaceReading | null {
    return this.latestReading
  }

  stop(): void {
    if (this.trackingTimer !== undefined) window.clearInterval(this.trackingTimer)
    this.trackingTimer = undefined
    this.listeners.clear()
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.previewVideos.forEach((video) => { video.srcObject = null })
    this.previewVideos.clear()
    if (this.processingVideo) this.processingVideo.srcObject = null
    this.processingVideo = null
    this.landmarker?.close()
    this.landmarker = null
  }
}
