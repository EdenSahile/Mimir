import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'
import StateLabel from '@/components/ui/MimirAvatar/StateLabel'

const STATE_LABELS: Record<MimirState, string> = {
  idle: 'Présent',
  listening: 'À l’écoute',
  thinking: 'Réflexion',
  processing: 'Traitement des données',
  responding: 'Réponse',
  success: 'Terminé',
}

describe('StateLabel', () => {
  it('renders with aria-live="polite"', () => {
    render(<StateLabel state="idle" />)

    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it.each(Object.entries(STATE_LABELS))('displays "%s" as "%s"', (state, label) => {
    render(<StateLabel state={state as MimirState} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('renders a luminous dot element', () => {
    const { container } = render(<StateLabel state="idle" />)

    const dot = container.querySelector('[data-testid="state-dot"]')
    expect(dot).toBeInTheDocument()
  })

  it('uses monospace font', () => {
    render(<StateLabel state="idle" />)

    const region = screen.getByRole('status')
    expect(region.className).toMatch(/font-mono/)
  })
})
