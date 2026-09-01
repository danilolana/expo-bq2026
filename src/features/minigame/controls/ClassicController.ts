import { clamp } from '../../faceTracking/smoothing'
import { GAME_HEIGHT, type GameController } from '../game.types'

export class ClassicController implements GameController {
  private velocity = 0
  private canvas: HTMLCanvasElement | null = null

  private flap = (event: Event) => {
    event.preventDefault()
    this.velocity = -305
  }

  private keydown = (event: KeyboardEvent) => {
    if (event.code !== 'Space' || event.repeat) return
    this.flap(event)
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    canvas.addEventListener('pointerdown', this.flap)
    window.addEventListener('keydown', this.keydown)
  }

  update(deltaSeconds: number, currentY: number): number {
    this.velocity = Math.min(this.velocity + 980 * deltaSeconds, 520)
    const nextY = clamp(currentY + this.velocity * deltaSeconds, 38, GAME_HEIGHT - 38)
    if (nextY === 38 || nextY === GAME_HEIGHT - 38) this.velocity *= -0.28
    return nextY
  }

  onCollision(): void {
    this.velocity = -140
  }

  destroy(): void {
    this.canvas?.removeEventListener('pointerdown', this.flap)
    window.removeEventListener('keydown', this.keydown)
    this.canvas = null
  }
}
