export function HintCounter({ count }: { count: number; showMaximum?: boolean }) {
  return (
    <div className="hint-counter" aria-label={`${count} dicas disponíveis`}>
      <span className="hint-counter__icon" aria-hidden="true">?</span>
      <span>Dicas</span>
      <strong>{count}</strong>
    </div>
  )
}
