export function BrandHeader() {
  return (
    <header className="brand-header">
      <a className="brand-lockup" href="#inicio" aria-label="Voltar ao início">
        <img
          src="/assets/brasao-bq.png"
          alt="Brasão do Colégio Bento Quirino"
          width="250"
          height="269"
          decoding="async"
        />
        <span className="brand-copy">
          <strong>Desafio BQ</strong>
          <small>Expô Bentinho 2026</small>
        </span>
      </a>
      <div className="edition-mark" aria-label="Edição 2026">
        <span>Edição</span>
        <strong>26</strong>
      </div>
    </header>
  )
}
