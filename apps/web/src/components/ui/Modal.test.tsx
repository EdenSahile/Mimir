import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/Modal'

describe('Modal', () => {
  it('has aria-modal true when open', () => {
    render(<Modal open title="Confirm">Content</Modal>)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has title linked to dialog via aria-labelledby', () => {
    render(<Modal open title="Confirm">Content</Modal>)

    const dialog = screen.getByRole('dialog')
    const labelledById = dialog.getAttribute('aria-labelledby')
    const titleElement = document.getElementById(labelledById!)

    expect(titleElement).toHaveTextContent('Confirm')
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Modal open title="Confirm" onClose={onClose}>Content</Modal>)
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('does not render content when closed', () => {
    render(<Modal open={false} title="Confirm">Content</Modal>)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
