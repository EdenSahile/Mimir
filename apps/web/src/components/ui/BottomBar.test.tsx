import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomBar from '@/components/ui/BottomBar'

function renderBottomBar(path = '/day') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomBar />
    </MemoryRouter>,
  )
}

describe('BottomBar', () => {
  it('renders the 5 bottom bar elements', () => {
    renderBottomBar()

    expect(screen.getByText('My Day')).toBeInTheDocument()
    expect(screen.getByText('Projets')).toBeInTheDocument()
    expect(screen.getByTestId('mimir-presence')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Plus')).toBeInTheDocument()
  })

  it('renders MimirPresence with a 50px size class', () => {
    renderBottomBar()

    const mimirPresence = screen.getByTestId('mimir-presence')

    expect(mimirPresence.className).toMatch(/size-\[50px\]|w-\[50px\]/)
  })

  it('renders MimirPresence with an animation class', () => {
    renderBottomBar()

    const mimirPresence = screen.getByTestId('mimir-presence')

    expect(mimirPresence.className).toMatch(/animate-/)
  })

  it('applies minimum touch target dimensions to interactive elements', () => {
    renderBottomBar()

    const links = screen.getAllByRole('link')
    const plusButton = screen.getByRole('button', { name: 'Plus' })
    const touchTargets = [...links, plusButton]

    touchTargets.forEach((element) => {
      expect(element.className).toMatch(/min-h-\[44px\]|min-h-11/)
    })
  })
})
