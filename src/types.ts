export type QuestionCategory = 'informatica' | 'geral'

export interface Question {
  id: string
  category: QuestionCategory
  prompt: string
  options: readonly [string, string, string, string]
  correctAnswer: number
  hint: string
}
