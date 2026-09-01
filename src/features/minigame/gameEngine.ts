import { circleIntersectsRect, rectanglesOverlap } from './collision'
import { getDifficulty } from './difficulty'
import {
  GAME_DURATION_SECONDS,
  GAME_HEIGHT,
  GAME_WIDTH,
  MAX_COLLISIONS,
  MAX_HINTS,
  type GameController,
  type GameFinishReason,
  type GameSnapshot,
  type GameState,
  type ObstaclePair,
  type Particle,
} from './game.types'
import type { ControlMode } from '../../experience.types'

const BIRD_X = 255
const BIRD_WIDTH = 54
const BIRD_HEIGHT = 38

export function createGameState(mode: ControlMode): GameState {
  return {
    mode,
    elapsed: 0,
    remaining: GAME_DURATION_SECONDS,
    hints: 0,
    collisions: 0,
    birdY: GAME_HEIGHT / 2,
    birdRotation: 0,
    invulnerableFor: 0,
    hitFlashFor: 0,
    collectFlashFor: 0,
    spawnAccumulator: 1.25,
    nextId: 1,
    finished: false,
    finishReason: null,
    obstacles: [],
    collectibles: [],
    particles: [],
  }
}

function obstacleRects(obstacle: ObstaclePair) {
  return [
    { x: obstacle.x, y: 0, width: obstacle.width, height: obstacle.gapY },
    {
      x: obstacle.x,
      y: obstacle.gapY + obstacle.gapHeight,
      width: obstacle.width,
      height: GAME_HEIGHT - obstacle.gapY - obstacle.gapHeight,
    },
  ]
}

function spawnParticles(state: GameState, x: number, y: number, color: string, count: number) {
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * (55 + (index % 3) * 28),
      vy: Math.sin(angle) * (55 + (index % 3) * 28),
      life: 0.65,
      color,
    })
  }
}

export interface UpdateResult {
  collected: boolean
  collided: boolean
  finished: boolean
}

export function updateGameState(
  state: GameState,
  deltaSeconds: number,
  nextBirdY: number,
  random: () => number = Math.random,
): UpdateResult {
  if (state.finished) return { collected: false, collided: false, finished: true }

  const delta = Math.min(deltaSeconds, 0.05)
  const difficulty = getDifficulty(state.elapsed)
  state.elapsed = Math.min(GAME_DURATION_SECONDS, state.elapsed + delta)
  state.remaining = Math.max(0, GAME_DURATION_SECONDS - state.elapsed)
  state.birdRotation = Math.max(-0.28, Math.min(0.3, (nextBirdY - state.birdY) * 0.02))
  state.birdY = Math.max(34, Math.min(GAME_HEIGHT - 34, nextBirdY))
  state.invulnerableFor = Math.max(0, state.invulnerableFor - delta)
  state.hitFlashFor = Math.max(0, state.hitFlashFor - delta)
  state.collectFlashFor = Math.max(0, state.collectFlashFor - delta)
  state.spawnAccumulator += delta

  if (state.spawnAccumulator >= difficulty.spawnInterval) {
    state.spawnAccumulator = 0
    const gapY = 74 + random() * (GAME_HEIGHT - difficulty.gapHeight - 148)
    const obstacle: ObstaclePair = {
      id: state.nextId++,
      x: GAME_WIDTH + 30,
      width: 82,
      gapY,
      gapHeight: difficulty.gapHeight,
    }
    state.obstacles.push(obstacle)
    if (state.hints < MAX_HINTS && state.collectibles.length < 2) {
      state.collectibles.push({
        id: state.nextId++,
        x: obstacle.x + obstacle.width / 2,
        y: gapY + difficulty.gapHeight / 2,
        radius: 20,
      })
    }
  }

  state.obstacles.forEach((obstacle) => { obstacle.x -= difficulty.speed * delta })
  state.collectibles.forEach((collectible) => { collectible.x -= difficulty.speed * delta })
  state.particles.forEach((particle) => {
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    particle.vy += 90 * delta
    particle.life -= delta
  })

  const birdRect = {
    x: BIRD_X - BIRD_WIDTH / 2 + 5,
    y: state.birdY - BIRD_HEIGHT / 2 + 4,
    width: BIRD_WIDTH - 10,
    height: BIRD_HEIGHT - 8,
  }

  let collided = false
  if (state.invulnerableFor <= 0 && state.obstacles.some(
    (obstacle) => obstacleRects(obstacle).some((rect) => rectanglesOverlap(birdRect, rect)),
  )) {
    collided = true
    state.collisions += 1
    state.invulnerableFor = 1.05
    state.hitFlashFor = 0.24
    spawnParticles(state, BIRD_X, state.birdY, '#ef6b55', 9)
    if (state.collisions >= MAX_COLLISIONS) {
      state.finished = true
      state.finishReason = 'collisions'
    }
  }

  let collected = false
  if (state.hints < MAX_HINTS) {
    const collectedItem = state.collectibles.find((item) => circleIntersectsRect(item, birdRect))
    if (collectedItem) {
      collected = true
      state.hints += 1
      state.collectFlashFor = 0.28
      state.collectibles = state.collectibles.filter((item) => item.id !== collectedItem.id)
      spawnParticles(state, collectedItem.x, collectedItem.y, '#9bcf4a', 13)
      if (state.hints >= MAX_HINTS) {
        state.collectibles = []
        if (!state.finished) {
          state.finished = true
          state.finishReason = 'hints'
        }
      }
    }
  }

  state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10)
  state.collectibles = state.collectibles.filter((item) => item.x + item.radius > -10)
  state.particles = state.particles.filter((particle) => particle.life > 0)

  if (state.remaining <= 0 && !state.finished) {
    state.finished = true
    state.finishReason = 'time'
  }
  return { collected, collided, finished: state.finished }
}

export class GameEngine {
  private readonly context: CanvasRenderingContext2D
  private readonly state: GameState
  private frameId: number | undefined
  private lastTimestamp: number | undefined
  private lastSnapshotSecond = -1

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly controller: GameController,
    mode: ControlMode,
    private readonly onSnapshot: (snapshot: GameSnapshot) => void,
    private readonly onFinish: (hints: number, reason: GameFinishReason) => void,
  ) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D indisponível.')
    this.context = context
    this.state = createGameState(mode)
  }

  start(): void {
    this.controller.attach(this.canvas)
    this.onSnapshot({ remaining: this.state.remaining, hints: 0, collisions: 0, finished: false })
    this.frameId = requestAnimationFrame(this.frame)
  }

  private frame = (timestamp: number) => {
    const delta = this.lastTimestamp === undefined ? 0 : (timestamp - this.lastTimestamp) / 1000
    this.lastTimestamp = timestamp
    const birdY = this.controller.update(Math.min(delta, 0.05), this.state.birdY)
    const result = updateGameState(this.state, delta, birdY)
    if (result.collided) this.controller.onCollision()
    this.render()

    const currentSecond = Math.ceil(this.state.remaining)
    if (result.collected || result.collided || currentSecond !== this.lastSnapshotSecond) {
      this.lastSnapshotSecond = currentSecond
      this.onSnapshot({
        remaining: this.state.remaining,
        hints: this.state.hints,
        collisions: this.state.collisions,
        finished: this.state.finished,
      })
    }

    if (result.finished) {
      this.onFinish(this.state.hints, this.state.finishReason ?? 'time')
      return
    }
    this.frameId = requestAnimationFrame(this.frame)
  }

  private render(): void {
    const ctx = this.context
    const state = this.state
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    const background = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
    background.addColorStop(0, '#0b416c')
    background.addColorStop(1, '#061d33')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.strokeStyle = 'rgba(155, 207, 74, .10)'
    ctx.lineWidth = 1
    const gridOffset = (state.elapsed * 38) % 48
    for (let x = -gridOffset; x < GAME_WIDTH; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); ctx.stroke()
    }
    for (let y = 0; y < GAME_HEIGHT; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y); ctx.stroke()
    }

    state.obstacles.forEach((obstacle) => this.drawObstacle(obstacle))
    state.collectibles.forEach((item) => this.drawCollectible(item.x, item.y, item.radius, state.elapsed))
    state.particles.forEach((particle) => this.drawParticle(particle))
    this.drawBird(state)

    if (state.hitFlashFor > 0) {
      ctx.fillStyle = `rgba(239, 107, 85, ${state.hitFlashFor * 0.55})`
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }
    if (state.collectFlashFor > 0) {
      ctx.fillStyle = `rgba(155, 207, 74, ${state.collectFlashFor * 0.3})`
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }
  }

  private drawObstacle(obstacle: ObstaclePair) {
    const ctx = this.context
    obstacleRects(obstacle).forEach((rect, index) => {
      ctx.fillStyle = '#dce7eb'
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
      ctx.fillStyle = '#07518b'
      ctx.fillRect(rect.x + 9, rect.y, 9, rect.height)
      ctx.fillStyle = '#9bcf4a'
      const edgeY = index === 0 ? rect.height - 13 : rect.y
      ctx.fillRect(rect.x - 7, edgeY, rect.width + 14, 13)
      ctx.strokeStyle = 'rgba(7, 81, 139, .28)'
      ctx.lineWidth = 3
      for (let y = rect.y + 28; y < rect.y + rect.height - 16; y += 42) {
        ctx.beginPath(); ctx.moveTo(rect.x + 26, y); ctx.lineTo(rect.x + 65, y); ctx.stroke()
        ctx.fillStyle = '#07518b'; ctx.fillRect(rect.x + 61, y - 4, 8, 8)
      }
    })
  }

  private drawCollectible(x: number, y: number, radius: number, elapsed: number) {
    const ctx = this.context
    const pulse = 1 + Math.sin(elapsed * 7) * 0.08
    ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse)
    ctx.shadowColor = '#9bcf4a'; ctx.shadowBlur = 22
    ctx.fillStyle = '#9bcf4a'; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#061d33'; ctx.font = '800 25px Bahnschrift, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('?', 0, 1)
    ctx.restore()
  }

  private drawParticle(particle: Particle) {
    this.context.globalAlpha = Math.max(0, particle.life / 0.65)
    this.context.fillStyle = particle.color
    this.context.fillRect(particle.x - 3, particle.y - 3, 6, 6)
    this.context.globalAlpha = 1
  }

  private drawBird(state: GameState) {
    const ctx = this.context
    const blinking = state.invulnerableFor > 0 && Math.floor(state.invulnerableFor * 14) % 2 === 0
    ctx.save(); ctx.translate(BIRD_X, state.birdY); ctx.rotate(state.birdRotation)
    ctx.globalAlpha = blinking ? 0.38 : 1
    ctx.fillStyle = '#f1f5f6'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 20, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#07518b'; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(-43, -18); ctx.lineTo(-34, 6); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#9bcf4a'; ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(-25, 26); ctx.lineTo(11, 15); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#efb72f'; ctx.beginPath(); ctx.moveTo(24, -4); ctx.lineTo(41, 2); ctx.lineTo(24, 8); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#061d33'; ctx.beginPath(); ctx.arc(13, -7, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(14, -9, 1.8, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  destroy(): void {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId)
    this.controller.destroy()
  }
}
