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
  hintRevealed: boolean
  onUseHint: () => void
  onAnswer: (answerIndex: number) => void
}

export function Quiz({
  round,
  questionIndex,
  selectedAnswer,
  score,
  availableHints,
  hintRevealed,
  onUseHint,
  onAnswer,
}: QuizProps) {
  const question = round[questionIndex]
  const hasAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === question.correctAnswer
  const canUseHint = availableHints > 0 && !hintRevealed && !hasAnswered

  return (
    <main className="page-shell quiz-page">
      <BrandHeader />
      <div className="quiz-status">
        <div className="progress-copy">
          <span>Rodada atual</span>
          <strong>{String(questionIndex + 1).padStart(2, '0')} <em>/ 05</em></strong>
        </div>
        <div className="progress-rail" aria-label={`Pergunta ${questionIndex + 1} de ${ROUND_SIZE}`}>
          {Array.from({ length: ROUND_SIZE }, (_, index) => (
            <span className={index < questionIndex ? 'done' : index === questionIndex ? 'active' : ''} key={index} />
          ))}
        </div>
        <div className="quiz-counters">
          <HintCounter count={availableHints} />
          <div className="score-chip"><span>Acertos</span><strong>{score}</strong></div>
        </div>
      </div>

      <section className={`quiz-layout ${hasAnswered ? (isCorrect ? 'answer-correct' : 'answer-wrong') : ''}`}>
        <aside className={`hint-panel ${hintRevealed ? 'hint-panel--revealed' : 'hint-panel--locked'}`}>
          <div className="hint-image">
            <picture>
              <source srcSet="/assets/mascote.ia.webp" type="image/webp" />
              <img
                src="/assets/mascote.ia.png"
                alt="Mascote BQ"
                width="1254"
                height="1254"
                decoding="async"
              />
            </picture>
          </div>
          <div className="hint-copy">
            <span className="hint-label">Pista do Bentinho</span>
            {hintRevealed ? (
              <p data-testid="question-hint">{question.hint}</p>
            ) : (
              <>
                <p className="hint-locked-copy">A pista desta pergunta está escondida.</p>
                <button
                  className="hint-button"
                  type="button"
                  disabled={!canUseHint}
                  onClick={onUseHint}
                >
                  {availableHints > 0 ? 'Usar uma dica' : 'Sem dicas disponíveis'}
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
              const feedbackClass = hasAnswered ? isAnswer ? 'correct' : isSelected ? 'wrong' : 'muted' : ''
              return (
                <button
                  className={`option-button ${feedbackClass}`}
                  disabled={hasAnswered}
                  key={option}
                  onClick={() => onAnswer(index)}
                  type="button"
                >
                  <span className="option-letter">{optionLetters[index]}</span>
                  <span>{option}</span>
                  <i aria-hidden="true">{hasAnswered && isAnswer ? '✓' : hasAnswered && isSelected ? '×' : '↗'}</i>
                </button>
              )
            })}
          </div>
          <div className={`answer-feedback ${hasAnswered ? 'visible' : ''}`} role="status">
            {hasAnswered && (
              <>
                <strong>{isCorrect ? 'Boa! Resposta certa.' : 'Quase! Agora você já sabe.'}</strong>
                <span>Próxima pergunta em instantes…</span>
              </>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
