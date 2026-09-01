import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./pages/Minigame', () => ({
  Minigame: ({ mode, onComplete }: { mode: string; onComplete: (hints: number) => void }) => (
    <main>
      <p>Minigame em modo {mode}</p>
      <button type="button" onClick={() => onComplete(2)}>Finalizar com 2 dicas</button>
      <button type="button" onClick={() => onComplete(0)}>Finalizar sem dicas</button>
    </main>
  ),
}))

describe('experiência Desafio BQ', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  function openIntro() {
    render(<App />)
    act(() => vi.advanceTimersByTime(1050))
  }

  function openGameIntro() {
    openIntro()
    fireEvent.click(screen.getByRole('button', { name: /começar desafio/i }))
  }

  function reachQuiz(hints: 0 | 2 = 2) {
    openGameIntro()
    fireEvent.click(screen.getByRole('button', { name: /jogar no modo clássico/i }))
    expect(screen.getByText(/minigame em modo classic/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: hints ? /finalizar com 2 dicas/i : /finalizar sem dicas/i }))
    expect(screen.getByLabelText(`${hints} dicas conquistadas`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /começar quiz/i }))
  }

  it('mostra o preloader e permite entrar na nova etapa', () => {
    render(<App />)
    expect(screen.getByText('Preparando o desafio')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1050))
    fireEvent.click(screen.getByRole('button', { name: /começar desafio/i }))
    expect(screen.getByRole('heading', { name: /conquiste.*suas dicas/i })).toBeInTheDocument()
  })

  it('permite escolher o modo clássico e leva as dicas ao quiz', () => {
    reachQuiz(2)
    expect(screen.getByLabelText('2 dicas disponíveis')).toBeInTheDocument()
    expect(screen.getByLabelText('Pergunta 1 de 5')).toBeInTheDocument()
  })

  it('oferece fallback quando a câmera falha', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError'))
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    openGameIntro()
    vi.useRealTimers()
    fireEvent.click(screen.getByRole('button', { name: /jogar com a câmera/i }))

    await waitFor(() => expect(screen.getByText(/permissão da câmera não foi concedida/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /jogar no modo clássico/i })).toBeEnabled()
    consoleSpy.mockRestore()
  })

  it('gasta uma única dica, revela a pista e preserva o saldo na pergunta seguinte', () => {
    reachQuiz(2)
    fireEvent.click(screen.getByRole('button', { name: /usar uma dica/i }))

    expect(screen.getByTestId('question-hint')).toBeVisible()
    expect(screen.getByLabelText('1 dicas disponíveis')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /usar uma dica/i })).not.toBeInTheDocument()

    fireEvent.click(document.querySelector<HTMLButtonElement>('.option-button')!)
    act(() => vi.advanceTimersByTime(650))

    expect(screen.getByLabelText('Pergunta 2 de 5')).toBeInTheDocument()
    expect(screen.getByLabelText('1 dicas disponíveis')).toBeInTheDocument()
    expect(screen.queryByTestId('question-hint')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /usar uma dica/i })).toBeEnabled()
  })

  it('mantém o quiz funcional sem nenhuma dica e conclui cinco perguntas', () => {
    reachQuiz(0)
    expect(screen.getByRole('button', { name: /sem dicas disponíveis/i })).toBeDisabled()

    for (let index = 0; index < 5; index += 1) {
      fireEvent.click(document.querySelector<HTMLButtonElement>('.option-button')!)
      act(() => vi.advanceTimersByTime(650))
    }

    expect(screen.getByRole('button', { name: /jogar outra rodada/i })).toBeInTheDocument()
    expect(screen.getByText('Rodada concluída')).toBeInTheDocument()
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(52)
  })
})
