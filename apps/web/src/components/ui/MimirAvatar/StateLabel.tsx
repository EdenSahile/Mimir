import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const LABELS: Record<MimirState, string> = {
  idle: 'Présent',
  listening: 'À l’écoute',
  thinking: 'Réflexion',
  processing: 'Traitement des données',
  responding: 'Réponse',
  success: 'Terminé',
}

interface StateLabelProps {
  state: MimirState
  className?: string
}

export default function StateLabel({ state, className }: StateLabelProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`font-mono text-[10px] inline-flex items-center gap-1.5 ${className ?? ''}`}
    >
      <span
        data-testid="state-dot"
        className="size-1.5 rounded-full bg-current opacity-70"
        style={{ boxShadow: '0 0 4px currentColor' }}
      />
      {LABELS[state]}
    </div>
  )
}
