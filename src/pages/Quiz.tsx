import { BrandHeader } from '../components/BrandHeader'
import { HintCounter } from '../components/HintCounter'
import type { Question } from '../types'
import { ROUND_SIZE } from '../utils/quizEngine'

const optionLetters = ['A', 'B', 'C', 'D'] as const

interface QuizProps {
  round: readonly Question[]
  questionIndex: number
  selectedAnswer: number | null
  score: number
  availableHints: number
  eliminatedOptions: readonly number[]
  onUseHint: () => void
  onAnswer: (answerIndex: number) => void
}

export function Quiz({
  round,
  questionIndex,
  selectedAnswer,
  score,
  availableHints,
  eliminatedOptions,
  onUseHint,
  onAnswer,
}: QuizProps) {
  const question = round[questionIndex]
  const hasAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === question.correctAnswer
  const canUseHint = availableHints > 0 && !hasAnswered

  return (
    <main className="page-shell quiz-page">
      <BrandHeader />
      <div className="quiz-status">
        <div className="progress-copy">
          <span>Rodada atual</span>
          <strong>{String(questionIndex + 1).padStart(2, '0')} <em>/ {String(ROUND_SIZE).padStart(2, '0')}</em></strong>
        </div>
        <div className="progress-rail" aria-label={`Pergunta ${questionIndex + 1} de ${ROUND_SIZE}`}>
          {Array.from({ length: ROUND_SIZE }, (_, index) => (
            <span className={index < questionIndex ? 'done' : index === questionIndex ? 'active' : ''} key={index} />
          ))}
        </div>
        <div className="quiz-counters">
          <HintCounter count={availableHints} />
          <div className="score-chip"><span>Pontos</span><strong>{score.toLocaleString('pt-BR')}</strong></div>
        </div>
      </div>

      <section className={`quiz-layout ${hasAnswered ? (isCorrect ? 'answer-correct' : 'answer-wrong') : ''}`}>
        <aside className={`hint-panel ${eliminatedOptions.length ? 'hint-panel--revealed' : 'hint-panel--locked'}`}>
          <div className="hint-image">
            <picture>
              <source srcSet="/assets/mascote.ia.webp" type="image/webp" />
              <img src="/assets/mascote.ia.png" alt="Mascote BQ" width="1254" height="1254" decoding="async" />
            </picture>
          </div>
          <div className="hint-copy">
            <span className="hint-label">Dica do Bentinho</span>
            {eliminatedOptions.length ? (
              <p data-testid="hint-applied">Duas alternativas incorretas foram eliminadas.</p>
            ) : (
              <>
                <p className="hint-locked-copy">Use a dica para remover duas alternativas erradas.</p>
                <button className="hint-button" type="button" disabled={!canUseHint} onClick={onUseHint}>
                  {availableHints > 0 ? 'Usar dica: eliminar 2 erradas' : 'Dica já utilizada'}
                </button>
              </>
            )}
          </div>
        </aside>

        <article className="question-card" aria-live="polite">
          <div className="question-meta">
            <span className={`category-tag ${question.category}`}>
              {question.category === 'informatica' ? 'Informática' : 'Conhecimentos gerais'}
            </span>
            <span>Questão {String(questionIndex + 1).padStart(2, '0')}</span>
          </div>
          <h2>{question.prompt}</h2>
          <div className="options-grid">
            {question.options.map((option, index) => {
              const isAnswer = index === question.correctAnswer
              const isSelected = index === selectedAnswer
              const isEliminated = eliminatedOptions.includes(index)
              const feedbackClass = hasAnswered ? isAnswer ? 'correct' : isSelected ? 'wrong' : 'muted' : isEliminated ? 'eliminated' : ''
              return (
                <button
                  className={`option-button ${feedbackClass}`}
                  disabled={hasAnswered || isEliminated}
                  key={option}
                  onClick={() => onAnswer(index)}
                  type="button"
                >
                  <span className="option-letter">{optionLetters[index]}</span>
                  <span>{option}</span>
                  <i aria-hidden="true">{hasAnswered && isAnswer ? '✓' : hasAnswered && isSelected ? '×' : isEliminated ? '—' : '↗'}</i>
                </button>
              )
            })}
          </div>
          <div className={`answer-feedback ${hasAnswered ? 'visible' : ''}`} role="status">
            {hasAnswered && (
              <>
                <strong>{isCorrect ? 'Boa! +1.000 pontos.' : 'Resposta incorreta. A rodada terminou.'}</strong>
                <span>{isCorrect && questionIndex < ROUND_SIZE - 1 ? 'Próxima pergunta em instantes…' : 'Veja seu resultado em instantes…'}</span>
              </>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
