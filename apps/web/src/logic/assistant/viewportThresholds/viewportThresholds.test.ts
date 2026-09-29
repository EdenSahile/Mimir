import { describe, expect, it } from 'vitest'
import {
  shouldShowGreeting,
  shouldShowRequestLabel,
} from '@/logic/assistant/viewportThresholds/viewportThresholds'

describe('shouldShowGreeting', () => {
  it('hides the greeting just under 700px of height', () => {
    expect(shouldShowGreeting(699)).toBe(false)
  })

  it('shows the greeting at exactly 700px of height', () => {
    expect(shouldShowGreeting(700)).toBe(true)
  })

  it('shows the greeting on a tall viewport', () => {
    expect(shouldShowGreeting(900)).toBe(true)
  })
})

describe('shouldShowRequestLabel', () => {
  it('hides the request label just under 640px of height', () => {
    expect(shouldShowRequestLabel(639)).toBe(false)
  })

  it('shows the request label at exactly 640px of height', () => {
    expect(shouldShowRequestLabel(640)).toBe(true)
  })

  it('shows the request label on a tall viewport', () => {
    expect(shouldShowRequestLabel(800)).toBe(true)
  })
})
