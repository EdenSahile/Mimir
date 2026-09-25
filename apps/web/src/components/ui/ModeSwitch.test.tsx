import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModeSwitch from '@/components/ui/ModeSwitch'

describe('ModeSwitch', () => {
  it('renders Assistant and Workspace as options', () => {
    render(<ModeSwitch />)

    expect(screen.getByRole('radio', { name: 'Assistant' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Workspace' })).toBeInTheDocument()
  })

  it('defaults to Assistant as the active option', () => {
    render(<ModeSwitch />)

    expect(screen.getByRole('radio', { name: 'Assistant' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('radio', { name: 'Workspace' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('switches the active option on click', async () => {
    const user = userEvent.setup()

    render(<ModeSwitch />)
    await user.click(screen.getByRole('radio', { name: 'Workspace' }))

    expect(screen.getByRole('radio', { name: 'Workspace' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('radio', { name: 'Assistant' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('includes transition classes for 900ms duration and ease-presence easing', () => {
    const { container } = render(<ModeSwitch />)

    const html = container.innerHTML

    expect(html).toContain('duration-[900ms]')
    expect(html).toMatch(/--ease-presence/)
  })
})
