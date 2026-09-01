import { BrandHeader } from '../components/BrandHeader'

interface GameIntroProps {
  onCamera: () => void
  onClassic: () => void
}

export function GameIntro({ onCamera, onClassic }: GameIntroProps) {
  return (
    <main className="page-shell game-flow-page">
      <BrandHeader />
      <section className="game-intro-card">
        <div className="game-intro-copy">
          <p className="eyebrow"><span /> Etapa bônus · 30 segundos</p>
          <h1>Conquiste<br /><em>suas dicas</em></h1>
          <p>
            Guie o pássaro BQ pelo corredor de circuitos e colete até três pistas para usar nas perguntas.
            As colisões não encerram o jogo.
          </p>
          <div className="mode-actions">
            <button className="primary-button" type="button" onClick={onCamera}>
              Jogar com a câmera <span aria-hidden="true">◉</span>
            </button>
            <button className="secondary-button" type="button" onClick={onClassic}>
              Jogar no modo clássico
            </button>
          </div>
          <p className="recommended-note"><strong>Recomendado:</strong> mova o rosto para controlar sem as mãos.</p>
        </div>
        <div className="game-intro-visual" aria-hidden="true">
          <div className="circuit-orbit circuit-orbit--one" />
          <div className="circuit-orbit circuit-orbit--two" />
          <div className="bird-emblem"><span>?</span></div>
          <div className="collectible-preview"><i>?</i><i>?</i><i>?</i></div>
          <span className="visual-code">ROTA_BQ / 2026</span>
        </div>
      </section>
    </main>
  )
}

