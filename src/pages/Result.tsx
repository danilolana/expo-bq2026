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

export function Result({ score, onRestart }: { score: number; onRestart: () => void }) {
  const percentage = Math.round((score / ROUND_SIZE) * 100)
  const title = score === 5 ? 'Gabaritou!' : score >= 3 ? 'Mandou bem!' : 'Vale outra rodada!'

  return (
    <main className="page-shell result-page">
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
      <BrandHeader />
      <section className="result-card">
        <div className="result-copy">
          <p className="eyebrow"><span /> Rodada concluída</p>
          <h1>{title}</h1>
          <p>Seu conhecimento entrou em campo e deixou sua marca: <strong>{score} de {ROUND_SIZE}</strong>!</p>
          <button className="primary-button" type="button" onClick={onRestart}>
            Jogar outra rodada <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div className="score-dial" style={{ '--score': `${percentage * 3.6}deg` } as CSSProperties}>
          <div><strong>{percentage}<small>%</small></strong><span>aproveitamento</span></div>
        </div>
      </section>
    </main>
  )
}

