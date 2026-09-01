import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { questions } from './data/questions'

describe('experiência Desafio BQ', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  function reachQuiz() {
    render(<App />)
    act(() => vi.advanceTimersByTime(1050))
    fireEvent.click(screen.getByRole('button', { name: /começar desafio/i }))
  }

  it('vai diretamente da abertura para a rodada de três perguntas', () => {
    reachQuiz()
    expect(screen.getByLabelText('Pergunta 1 de 3')).toBeInTheDocument()
    expect(screen.getByLabelText('1 dicas disponíveis')).toBeInTheDocument()
    expect(screen.getByText(/pontos/i)).toBeInTheDocument()
  })

  it('usa a única dica da rodada para eliminar duas respostas erradas', () => {
    reachQuiz()
    fireEvent.click(screen.getByRole('button', { name: /usar dica: eliminar 2 erradas/i }))

    expect(screen.getByTestId('hint-applied')).toBeVisible()
    expect(screen.getByLabelText('0 dicas disponíveis')).toBeInTheDocument()
    expect(document.querySelectorAll<HTMLButtonElement>('.option-button:disabled')).toHaveLength(2)
  })

  it('encerra a rodada na primeira resposta incorreta e mostra a pontuação', () => {
    reachQuiz()
    const prompt = screen.getByRole('heading', { level: 2 }).textContent
    const question = questions.find((item) => item.prompt === prompt)!
    const wrongAnswer = question.options.findIndex((_, index) => index !== question.correctAnswer)
    fireEvent.click(document.querySelectorAll<HTMLButtonElement>('.option-button')[wrongAnswer])
    act(() => vi.advanceTimersByTime(650))

    expect(screen.getByText(/fim de jogo/i)).toBeInTheDocument()
    expect(screen.getByText(/você errou a questão/i)).toBeInTheDocument()
    expect(screen.getByText(/pontuação final/i)).toBeInTheDocument()
  })
})
