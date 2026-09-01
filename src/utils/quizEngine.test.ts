import { describe, expect, it } from 'vitest'
import { questions } from '../data/questions'
import { createQuizRound } from './quizEngine'

function seededRandom(seed = 123456): () => number {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

describe('createQuizRound', () => {
  it('cria uma rodada de cinco perguntas com ao menos uma de informática', () => {
    const round = createQuizRound(questions, [], seededRandom())

    expect(round.questions).toHaveLength(5)
    expect(round.questions.some((question) => question.category === 'informatica')).toBe(true)
    expect(new Set(round.questions.map((question) => question.id)).size).toBe(5)
  })

  it('usa as 70 perguntas sem repetir ao longo de 14 rodadas', () => {
    const random = seededRandom()
    let usedIds: string[] = []

    for (let roundNumber = 0; roundNumber < 14; roundNumber += 1) {
      const round = createQuizRound(questions, usedIds, random)
      const previousIds = new Set(usedIds)

      expect(round.questions).toHaveLength(5)
      expect(round.questions.some((question) => question.category === 'informatica')).toBe(true)
      expect(round.questions.every((question) => !previousIds.has(question.id))).toBe(true)
      usedIds = round.usedIds
    }

    expect(new Set(usedIds).size).toBe(70)
  })

  it('reinicia o ciclo somente depois de esgotar o banco', () => {
    const round = createQuizRound(
      questions,
      questions.map((question) => question.id),
      seededRandom(),
    )

    expect(round.cycleRestarted).toBe(true)
    expect(round.usedIds).toHaveLength(5)
  })

  it('ignora IDs inválidos recebidos do armazenamento', () => {
    const round = createQuizRound(questions, ['id-inexistente'], seededRandom())

    expect(round.usedIds).toHaveLength(5)
    expect(round.usedIds).not.toContain('id-inexistente')
  })
})
