import { MAX_HINTS } from '../features/minigame/game.types'

export function HintCounter({ count, showMaximum = false }: { count: number; showMaximum?: boolean }) {
  return (
    <div className="hint-counter" aria-label={`${count} dicas disponíveis`}>
      <span className="hint-counter__icon" aria-hidden="true">?</span>
      <span>Dicas</span>
      <strong>{count}{showMaximum ? ` / ${MAX_HINTS}` : ''}</strong>
    </div>
  )
}

