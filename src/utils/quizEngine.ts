import type { Question } from '../types'

export const ROUND_SIZE = 5
export const USED_QUESTIONS_KEY = 'desafio-bq:used-question-ids:v1'

export interface QuizRound {
  questions: Question[]
  usedIds: string[]
  cycleRestarted: boolean
}

type RandomSource = () => number

function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

export function createQuizRound(
  bank: readonly Question[],
  previouslyUsedIds: readonly string[],
  random: RandomSource = Math.random,
): QuizRound {
  const validIds = new Set(bank.map((question) => question.id))
  const safeUsedIds = [...new Set(previouslyUsedIds.filter((id) => validIds.has(id)))]
  let available = bank.filter((question) => !safeUsedIds.includes(question.id))
  let cycleRestarted = false

  const availableTech = () => available.filter((question) => question.category === 'informatica')

  if (available.length < ROUND_SIZE || availableTech().length === 0) {
    available = [...bank]
    safeUsedIds.length = 0
    cycleRestarted = true
  }

  const techPool = shuffle(availableTech(), random)
  const generalPool = shuffle(
    available.filter((question) => question.category === 'geral'),
    random,
  )

  if (available.length < ROUND_SIZE || techPool.length === 0) {
    throw new Error('Não há perguntas suficientes para criar uma rodada válida.')
  }

  const futureRounds = Math.ceil((available.length - ROUND_SIZE) / ROUND_SIZE)
  const maxExtraTech = Math.min(
    ROUND_SIZE - 1,
    Math.max(0, techPool.length - 1 - futureRounds),
  )
  const minExtraTech = Math.max(0, ROUND_SIZE - 1 - generalPool.length)

  if (minExtraTech > maxExtraTech) {
    throw new Error('A distribuição de categorias não permite uma rodada válida.')
  }

  const extraTechCount =
    minExtraTech + Math.floor(random() * (maxExtraTech - minExtraTech + 1))
  const selected = [
    techPool[0],
    ...techPool.slice(1, 1 + extraTechCount),
    ...generalPool.slice(0, ROUND_SIZE - 1 - extraTechCount),
  ]
  const roundQuestions = shuffle(selected, random)

  return {
    questions: roundQuestions,
    usedIds: [...safeUsedIds, ...roundQuestions.map((question) => question.id)],
    cycleRestarted,
  }
}

export function loadUsedQuestionIds(storage: Storage = window.localStorage): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(USED_QUESTIONS_KEY) ?? '[]')
    return Array.isArray(value) && value.every((id) => typeof id === 'string') ? value : []
  } catch {
    return []
  }
}

export function saveUsedQuestionIds(
  ids: readonly string[],
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(USED_QUESTIONS_KEY, JSON.stringify(ids))
  } catch {
    // O quiz continua funcionando quando o armazenamento estiver indisponível.
  }
}
