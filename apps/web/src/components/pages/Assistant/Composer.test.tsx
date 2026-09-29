import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Composer from '@/components/pages/Assistant/Composer'

describe('Composer', () => {
  describe('mode texte', () => {
    it('shows the input with the placeholder "Parlez à Mímir"', () => {
      render(<Composer onSend={vi.fn()} />)

      expect(screen.getByPlaceholderText('Parlez à Mímir')).toBeInTheDocument()
    })

    it('sends the typed text when Enter is pressed', async () => {
      const user = userEvent.setup()
      const handleSend = vi.fn()
      render(<Composer onSend={handleSend} />)

      await user.type(
        screen.getByPlaceholderText('Parlez à Mímir'),
        'Résume ma semaine{Enter}',
      )

      expect(handleSend).toHaveBeenCalledWith('Résume ma semaine')
    })

    it('sends the typed text when clicking "Envoyer"', async () => {
      const user = userEvent.setup()
      const handleSend = vi.fn()
      render(<Composer onSend={handleSend} />)

      await user.type(
        screen.getByPlaceholderText('Parlez à Mímir'),
        'Résume ma semaine',
      )
      await user.click(screen.getByRole('button', { name: 'Envoyer' }))

      expect(handleSend).toHaveBeenCalledWith('Résume ma semaine')
    })

    it('sends nothing when the field is empty', async () => {
      const user = userEvent.setup()
      const handleSend = vi.fn()
      render(<Composer onSend={handleSend} />)

      await user.click(screen.getByRole('button', { name: 'Envoyer' }))

      expect(handleSend).not.toHaveBeenCalled()
    })
  })

  describe('mode voix', () => {
    it('shows a mic button of 64px in voice mode', async () => {
      const user = userEvent.setup()
      render(<Composer onSend={vi.fn()} />)

      await user.click(screen.getByTestId('composer-voice-toggle'))

      const micButton = screen.getByTestId('mic-button')
      expect(micButton.className).toMatch(/size-16/)
    })

    it('shows "Appuyez et parlez" while the mic is at rest', async () => {
      const user = userEvent.setup()
      render(<Composer onSend={vi.fn()} />)

      await user.click(screen.getByTestId('composer-voice-toggle'))

      expect(screen.getByText('Appuyez et parlez')).toBeInTheDocument()
    })

    it('marks the mic as pressed and listening after a click', async () => {
      const user = userEvent.setup()
      render(<Composer onSend={vi.fn()} />)
      await user.click(screen.getByTestId('composer-voice-toggle'))
      const micButton = screen.getByTestId('mic-button')

      await user.click(micButton)

      expect(micButton).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('Mímir vous écoute')).toBeInTheDocument()
    })

    it('applies the glow class only while listening', async () => {
      const user = userEvent.setup()
      render(<Composer onSend={vi.fn()} />)
      await user.click(screen.getByTestId('composer-voice-toggle'))
      const micButton = screen.getByTestId('mic-button')

      expect(micButton.className).not.toMatch(/glow/)

      await user.click(micButton)
      expect(micButton.className).toMatch(/glow/)
    })

    it('returns to rest on a second click', async () => {
      const user = userEvent.setup()
      render(<Composer onSend={vi.fn()} />)
      await user.click(screen.getByTestId('composer-voice-toggle'))
      const micButton = screen.getByTestId('mic-button')

      await user.click(micButton)
      await user.click(micButton)

      expect(micButton).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByText('Appuyez et parlez')).toBeInTheDocument()
    })
  })
})
