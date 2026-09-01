import type { ControlMode } from '../../experience.types'

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540
export const GAME_DURATION_SECONDS = 30
export const MAX_HINTS = 3
export const MAX_COLLISIONS = 3

export type GameFinishReason = 'time' | 'hints' | 'collisions'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ObstaclePair {
  id: number
  x: number
  width: number
  gapY: number
  gapHeight: number
}

export interface Collectible {
  id: number
  x: number
  y: number
  radius: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export interface GameState {
  mode: ControlMode
  elapsed: number
  remaining: number
  hints: number
  collisions: number
  birdY: number
  birdRotation: number
  invulnerableFor: number
  hitFlashFor: number
  collectFlashFor: number
  spawnAccumulator: number
  nextId: number
  finished: boolean
  finishReason: GameFinishReason | null
  obstacles: ObstaclePair[]
  collectibles: Collectible[]
  particles: Particle[]
}

export interface GameSnapshot {
  remaining: number
  hints: number
  collisions: number
  finished: boolean
}

export interface GameController {
  attach(canvas: HTMLCanvasElement): void
  update(deltaSeconds: number, currentY: number): number
  onCollision(): void
  destroy(): void
}
