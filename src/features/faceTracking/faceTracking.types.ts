export interface FaceReading {
  noseY: number
  timestamp: number
  faceDetected: boolean
}

export type FaceReadingListener = (reading: FaceReading) => void

export type CameraErrorKind =
  | 'permission'
  | 'not-found'
  | 'busy'
  | 'unsupported'
  | 'model'
  | 'unknown'

export class CameraSetupError extends Error {
  constructor(public readonly kind: CameraErrorKind, cause?: unknown) {
    super(kind)
    this.name = 'CameraSetupError'
    if (cause !== undefined) this.cause = cause
  }
}

