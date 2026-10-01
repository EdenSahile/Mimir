import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SpokenResponse from '@/components/pages/Assistant/SpokenResponse'

const LONG_ANSWER =
  'Votre semaine est chargée côté design, plus légère côté réunions. Je vous ai gardé deux plages calmes mercredi.'

describe('SpokenResponse', () => {
  it('renders the response text', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    expect(screen.getByText(LONG_ANSWER)).toBeInTheDocument()
  })

  it('renders the text in a serif font', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    const responseZone = screen.getByTestId('spoken-response')
    expect(responseZone.className).toMatch(/font-serif/)
  })

  it('renders no message avatar next to the text', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('wraps the text in no chat bubble', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    const responseZone = screen.getByTestId('spoken-response')
    expect(responseZone.className).not.toMatch(/rounded|border|bg-\[/)
  })

  it('caps its own scroll zone at 34vh', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    const responseZone = screen.getByTestId('spoken-response')
    expect(responseZone.style.maxHeight).toBe('34vh')
  })

  it('scrolls vertically inside its own zone', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    const responseZone = screen.getByTestId('spoken-response')
    expect(['auto', 'scroll']).toContain(responseZone.style.overflowY)
  })

  it('fades its bottom edge with a mask-image gradient', () => {
    render(<SpokenResponse text={LONG_ANSWER} />)

    const responseZone = screen.getByTestId('spoken-response')
    expect(responseZone.getAttribute('style') ?? '').toMatch(
      /mask-image:\s*linear-gradient\(180deg/,
    )
  })
})
