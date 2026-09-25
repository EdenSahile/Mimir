import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavRail from '@/components/ui/NavRail'

const NAV_ITEMS = [
  'Mímir',
  'My Day',
  'Projets',
  'AI News',
  'Job Watch',
  'Mémoire',
  'Documents',
  'Réglages',
]

function renderNavRail(path = '/day') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavRail />
    </MemoryRouter>,
  )
}

describe('NavRail', () => {
  it('renders all 8 navigation items in order', () => {
    renderNavRail()

    const nav = screen.getByRole('navigation')
    const links = within(nav).getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual(NAV_ITEMS)
  })

  it('applies responsive classes to hide on mobile and show on desktop', () => {
    renderNavRail()

    const nav = screen.getByRole('navigation')

    expect(nav.className).toMatch(/hidden/)
    expect(nav.className).toMatch(/flex|block/)
  })

  it('marks the active route item with aria-current page', () => {
    renderNavRail('/day')

    expect(screen.getByRole('link', { name: 'My Day' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not set aria-current on inactive items', () => {
    renderNavRail('/day')

    const inactiveItems = NAV_ITEMS.filter((name) => name !== 'My Day')

    inactiveItems.forEach((name) => {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('renders an active indicator element on the current route item', () => {
    renderNavRail('/day')

    const activeLink = screen.getByRole('link', { name: 'My Day' })
    const indicator = activeLink.querySelector('[data-active-indicator]')

    expect(indicator).toBeInTheDocument()
  })

  it('does not render an active indicator on inactive items', () => {
    renderNavRail('/day')

    const inactiveLink = screen.getByRole('link', { name: 'Projets' })
    const indicator = inactiveLink.querySelector('[data-active-indicator]')

    expect(indicator).not.toBeInTheDocument()
  })

  it('keeps all navigation items keyboard-focusable', () => {
    renderNavRail()

    const links = screen.getAllByRole('link')

    links.forEach((link) => {
      expect(link).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
