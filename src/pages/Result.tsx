import type { CSSProperties } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { ROUND_SIZE } from '../utils/quizEngine'

const confettiPieces = Array.from({ length: 52 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  delay: `${(index % 9) * 55}ms`,
  duration: `${2100 + (index % 6) * 130}ms`,
  rotation: `${(index * 53) % 360}deg`,
  color: ['#9bd33d', '#0e5b99', '#f6c744', '#ef6b55', '#ffffff'][index % 5],
}))

interface ResultProps {
  score: number
  failedQuestionIndex: number | null
  onRestart: () => void
}

export function Result({ score, failedQuestionIndex, onRestart }: ResultProps) {
  const completedRound = failedQuestionIndex === null

  return (
    <main className="page-shell result-page">
      {completedRound && (
        <div className="confetti" aria-hidden="true">
          {confettiPieces.map((piece, index) => (
            <i
              className={`confetti-piece confetti-piece--${index % 3}`}
              key={index}
              style={{
                '--confetti-left': piece.left,
                '--confetti-delay': piece.delay,
                '--confetti-duration': piece.duration,
                '--confetti-rotation': piece.rotation,
                '--confetti-color': piece.color,
              } as CSSProperties}
            />
          ))}
        </div>
      )}
      <BrandHeader />
      <section className="result-card">
        <div className="result-copy">
          <p className="eyebrow"><span /> {completedRound ? 'Rodada concluída' : `Você errou a questão ${String(failedQuestionIndex + 1).padStart(2, '0')}`}</p>
          <h1>{completedRound ? 'Rodada concluída!' : 'Fim de jogo!'}</h1>
          <p>
            {completedRound
              ? <>Você acertou as {ROUND_SIZE} questões e conquistou <strong>{score.toLocaleString('pt-BR')} pontos</strong>!</>
              : <>A rodada foi encerrada na questão <strong>{failedQuestionIndex + 1}</strong>. Sua pontuação final é <strong>{score.toLocaleString('pt-BR')} pontos</strong>.</>}
          </p>
          <button className="primary-button" type="button" onClick={onRestart}>
            Jogar outra rodada <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div className="score-dial" style={{ '--score': `${(score / (ROUND_SIZE * 1000)) * 360}deg` } as CSSProperties}>
          <div><strong>{score.toLocaleString('pt-BR')}</strong><span>pontos</span></div>
        </div>
      </section>
    </main>
  )
}
