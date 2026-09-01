import { BrandHeader } from '../components/BrandHeader'

export function Intro({ onStart, error }: { onStart: () => void; error: string }) {
  return (
    <main className="page-shell intro-page" id="inicio">
      <BrandHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Quiz de conhecimentos</p>
          <h1>Desafio<span>BQ</span></h1>
          <p className="hero-lead">
            Três perguntas. Uma rodada. Cada acerto vale 1.000 pontos. Mostre que curiosidade e tecnologia combinam com você.
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            Começar desafio <span aria-hidden="true">↗</span>
          </button>
          {error && <p className="error-message" role="alert">{error}</p>}
          <dl className="hero-facts" aria-label="Regras do desafio">
            <div><dt>03</dt><dd>perguntas por rodada</dd></div>
            <div><dt>01</dt><dd>dica por rodada</dd></div>
            <div><dt>1.000</dt><dd>pontos por acerto</dd></div>
          </dl>
        </div>
        <div className="hero-visual" aria-label="Mascote BQ Informática 2026">
          <div className="hero-index" aria-hidden="true">BQ/26</div>
          <div className="mascot-frame">
            <picture>
              <source srcSet="/assets/mascote.ia.webp" type="image/webp" />
              <img src="/assets/mascote.ia.png" alt="Mascote BQ estudando programação em um notebook" width="1254" height="1254" decoding="async" fetchPriority="high" />
            </picture>
          </div>
          <div className="hero-stamp" aria-hidden="true"><span>Conhecimento</span><strong>em movimento</strong></div>
        </div>
      </section>
      <footer className="intro-footer">
        <img src="/assets/logo-bento-quirino.png" alt="Colégio Técnico Bento Quirino — formando gerações desde 1910" width="887" height="317" decoding="async" />
        <span>Campinas · SP</span>
      </footer>
    </main>
  )
}
