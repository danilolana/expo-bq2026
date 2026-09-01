import { describe, expect, it } from 'vitest'
import { getStableNosePosition } from '../faceTracking/calibration'
import { normalizedNoseToGameY } from '../faceTracking/smoothing'
import { createGameState, updateGameState } from './gameEngine'
import { GAME_HEIGHT, MAX_HINTS } from './game.types'

describe('engine do minigame', () => {
  it('encerra a rodada após aproximadamente 30 segundos', () => {
    const state = createGameState('classic')
    state.hints = MAX_HINTS
    for (let frame = 0; frame < 610; frame += 1) {
      updateGameState(state, 0.05, GAME_HEIGHT / 2, () => 0.5)
    }
    expect(state.finished).toBe(true)
    expect(state.remaining).toBe(0)
  })

  it('limita os coletáveis conquistados a três', () => {
    const state = createGameState('classic')
    state.spawnAccumulator = -100

    for (let index = 0; index < MAX_HINTS; index += 1) {
      state.collectibles = [{ id: 100 + index, x: 255, y: state.birdY, radius: 20 }]
      updateGameState(state, 0.01, state.birdY)
    }

    expect(state.hints).toBe(MAX_HINTS)
    expect(state.collectibles).toHaveLength(0)
    expect(state.finished).toBe(true)
  })

  it('encerra no terceiro impacto e preserva as dicas coletadas', () => {
    const state = createGameState('classic')
    state.spawnAccumulator = -100
    state.hints = 2
    state.obstacles = [{ id: 1, x: 220, width: 90, gapY: 10, gapHeight: 40 }]

    const firstHit = updateGameState(state, 0.016, state.birdY)
    expect(firstHit.collided).toBe(true)
    expect(state.finished).toBe(false)

    state.invulnerableFor = 0
    updateGameState(state, 0.016, state.birdY)
    state.invulnerableFor = 0
    const thirdHit = updateGameState(state, 0.016, state.birdY)

    expect(thirdHit.collided).toBe(true)
    expect(thirdHit.finished).toBe(true)
    expect(state.collisions).toBe(3)
    expect(state.hints).toBe(2)
    expect(state.finishReason).toBe('collisions')
  })
})

describe('rastreamento facial', () => {
  it('calibra apenas uma sequência estável e mapeia o nariz com limites', () => {
    const readings = Array.from({ length: 44 }, (_, index) => ({
      noseY: 0.5 + Math.sin(index) * 0.002,
      timestamp: index * 40,
      faceDetected: true,
    }))

    expect(getStableNosePosition(readings, 1720)).toBeCloseTo(0.5, 2)
    expect(normalizedNoseToGameY(0.5, 0.5, GAME_HEIGHT)).toBe(GAME_HEIGHT / 2)
    expect(normalizedNoseToGameY(1, 0.5, GAME_HEIGHT)).toBeLessThanOrEqual(GAME_HEIGHT - 58)
  })
})
