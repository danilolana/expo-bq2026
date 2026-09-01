import { describe, expect, it } from 'vitest'
import { questions, validateQuestionBank } from './questions'

describe('banco de perguntas', () => {
  it('contém 70 perguntas na proporção solicitada', () => {
    expect(questions).toHaveLength(70)
    expect(questions.filter((question) => question.category === 'informatica')).toHaveLength(25)
    expect(questions.filter((question) => question.category === 'geral')).toHaveLength(45)
  })

  it('tem IDs únicos e respostas válidas', () => {
    expect(() => validateQuestionBank(questions)).not.toThrow()
    expect(new Set(questions.map((question) => question.id)).size).toBe(70)
  })
})
