import { describe, expect, it } from 'vitest'
import { questions } from '../data/questions'
import { createQuizRound, ROUND_SIZE } from './quizEngine'

function seededRandom(seed = 123456): () => number {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

describe('createQuizRound', () => {
  it('cria uma rodada de três perguntas com ao menos uma de informática', () => {
    const round = createQuizRound(questions, [], seededRandom())

    expect(ROUND_SIZE).toBe(3)
    expect(round.questions).toHaveLength(3)
    expect(round.questions.some((question) => question.category === 'informatica')).toBe(true)
    expect(new Set(round.questions.map((question) => question.id)).size).toBe(3)
  })

  it('não repete perguntas enquanto há perguntas suficientes para outra rodada', () => {
    const random = seededRandom()
    let usedIds: string[] = []

    for (let roundNumber = 0; roundNumber < 23; roundNumber += 1) {
      const round = createQuizRound(questions, usedIds, random)
      const previousIds = new Set(usedIds)

      expect(round.questions).toHaveLength(3)
      expect(round.questions.some((question) => question.category === 'informatica')).toBe(true)
      expect(round.questions.every((question) => !previousIds.has(question.id))).toBe(true)
      usedIds = round.usedIds
    }

    expect(new Set(usedIds).size).toBe(69)
  })

  it('reinicia o ciclo quando não há perguntas suficientes para uma nova rodada', () => {
    const usedIds = questions.slice(0, 68).map((question) => question.id)
    const round = createQuizRound(questions, usedIds, seededRandom())

    expect(round.cycleRestarted).toBe(true)
    expect(round.usedIds).toHaveLength(3)
  })

  it('ignora IDs inválidos recebidos do armazenamento', () => {
    const round = createQuizRound(questions, ['id-inexistente'], seededRandom())

    expect(round.usedIds).toHaveLength(3)
    expect(round.usedIds).not.toContain('id-inexistente')
  })
})
