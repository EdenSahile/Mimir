import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chip } from '@/components/ui/Chip'

describe('Chip', () => {
  it('renders with role checkbox', () => {
    render(<Chip>Frontend</Chip>)

    expect(screen.getByRole('checkbox', { name: 'Frontend' })).toBeInTheDocument()
  })

  it('has aria-pressed false by default', () => {
    render(<Chip>Frontend</Chip>)

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-pressed', 'false')
  })

  it('has aria-pressed true when active', () => {
    render(<Chip active>Frontend</Chip>)

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles aria-pressed on click', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    render(<Chip onToggle={onToggle}>Frontend</Chip>)
    await user.click(screen.getByRole('checkbox'))

    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('applies different classes for active and inactive states', () => {
    const { rerender } = render(<Chip>Frontend</Chip>)

    const inactiveClassName = screen.getByRole('checkbox').className

    rerender(<Chip active>Frontend</Chip>)

    const activeClassName = screen.getByRole('checkbox').className
    expect(activeClassName).not.toBe(inactiveClassName)
  })

  it('has min-height of 44px (touch target)', () => {
    render(<Chip>Frontend</Chip>)

    const chip = screen.getByRole('checkbox')
    expect(chip.className).toMatch(/min-h-11|min-h-\[44px\]/)
  })
})
