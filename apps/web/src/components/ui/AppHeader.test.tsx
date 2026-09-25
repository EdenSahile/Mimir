import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppHeader from '@/components/ui/AppHeader'

function renderAppHeader() {
  return render(
    <MemoryRouter>
      <AppHeader initials="ES" userName="Eden Sahile" />
    </MemoryRouter>,
  )
}

describe('AppHeader', () => {
  it('renders initials in a 30px rounded circle', () => {
    renderAppHeader()

    const initialsElement = screen.getByText('ES')

    expect(initialsElement.className).toMatch(/size-\[30px\]|w-\[30px\]/)
    expect(initialsElement.className).toMatch(/rounded-full/)
  })

  it('renders the clock with mono font', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-25T14:30:00'))

    const { container } = renderAppHeader()
    const clockElement = container.querySelector('.font-mono')

    expect(clockElement).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('hides the clock by default with a responsive class for wide viewports', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-25T14:30:00'))

    const { container } = renderAppHeader()
    const clockElement = container.querySelector('.font-mono')

    expect(clockElement?.className).toMatch(/hidden/)

    vi.useRealTimers()
  })
})
