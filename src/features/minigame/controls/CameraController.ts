import type { FaceTracker } from '../../faceTracking/FaceTracker'
import { exponentialSmooth, normalizedNoseToGameY } from '../../faceTracking/smoothing'
import { GAME_HEIGHT, type GameController } from '../game.types'

export class CameraController implements GameController {
  private targetY = GAME_HEIGHT / 2

  constructor(
    private readonly tracker: FaceTracker,
    private readonly neutralNoseY: number,
  ) {}

  attach(): void {}

  update(deltaSeconds: number, currentY: number): number {
    const reading = this.tracker.getLatestReading()
    if (reading?.faceDetected) {
      this.targetY = normalizedNoseToGameY(reading.noseY, this.neutralNoseY, GAME_HEIGHT)
    }
    const response = 1 - Math.exp(-9 * deltaSeconds)
    return exponentialSmooth(currentY, this.targetY, response)
  }

  onCollision(): void {
    this.targetY = Math.min(GAME_HEIGHT - 58, this.targetY + 18)
  }

  destroy(): void {}
}

