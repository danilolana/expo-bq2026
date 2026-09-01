import { BrandHeader } from '../components/BrandHeader'

export function MinigameResult({ hints, onStartQuiz }: { hints: number; onStartQuiz: () => void }) {
  const hintLabel = hints === 1 ? 'dica conquistada' : 'dicas conquistadas'

  return (
    <main className="page-shell game-flow-page minigame-result-page">
      <BrandHeader />
      <section className="minigame-result-card">
        <div className="result-hint-summary" aria-label={`${hints} ${hintLabel}`}>
          <span aria-hidden="true">?</span>
          <strong>{hints}</strong>
          <small>{hintLabel}</small>
        </div>
        <div className="minigame-result-content">
          <p className="eyebrow"><span /> Etapa bônus concluída</p>
          <h1>Agora começa o quiz.</h1>
          <p>
            {hints > 0
              ? 'Escolha o melhor momento para revelar cada pista durante as perguntas.'
              : 'Você pode seguir normalmente e mostrar o que sabe nas cinco perguntas.'}
          </p>
          <button className="primary-button" type="button" onClick={onStartQuiz}>
            Começar quiz <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </main>
  )
}
