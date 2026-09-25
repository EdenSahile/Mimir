import { render, screen } from '@testing-library/react'
import { Toast } from '@/components/ui/Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with role status by default', () => {
    render(<Toast message="Saved" />)

    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it('disappears after 6 seconds', () => {
    const onDismiss = vi.fn()

    render(<Toast message="Saved" onDismiss={onDismiss} />)
    vi.advanceTimersByTime(6000)

    expect(onDismiss).toHaveBeenCalled()
  })

  it('renders alert variant with role alert', () => {
    render(<Toast message="Something went wrong" variant="alert" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('does not auto-dismiss when variant is alert', () => {
    const onDismiss = vi.fn()

    render(<Toast message="Error" variant="alert" onDismiss={onDismiss} />)
    vi.advanceTimersByTime(6000)

    expect(onDismiss).not.toHaveBeenCalled()
  })
})
