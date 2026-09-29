import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ThreadDrawer from '@/components/pages/Assistant/ThreadDrawer'

const EXCHANGE = [
  { author: 'Vous', text: 'Résume-moi ma semaine.' },
  { author: 'Mímir', text: 'Trois temps forts, deux plages calmes.' },
]

describe('ThreadDrawer', () => {
  it('renders a dialog when open', () => {
    render(<ThreadDrawer open entries={EXCHANGE} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('stays out of the DOM when closed', () => {
    render(<ThreadDrawer open={false} entries={EXCHANGE} onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('labels each entry with its author', () => {
    render(<ThreadDrawer open entries={EXCHANGE} onClose={vi.fn()} />)

    expect(screen.getByText('Vous')).toBeInTheDocument()
    expect(screen.getByText('Mímir')).toBeInTheDocument()
  })

  it('shows the text of each entry', () => {
    render(<ThreadDrawer open entries={EXCHANGE} onClose={vi.fn()} />)

    expect(screen.getByText('Résume-moi ma semaine.')).toBeInTheDocument()
    expect(
      screen.getByText('Trois temps forts, deux plages calmes.'),
    ).toBeInTheDocument()
  })

  it('closes on the Escape key', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(<ThreadDrawer open entries={EXCHANGE} onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalled()
  })
})
