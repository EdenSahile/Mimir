import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMimirConversation } from '@/logic/assistant/useMimirConversation/useMimirConversation'

const LISTENING_MS = 1000
const THINKING_MS = 1200
const PROCESSING_MS = 1500
const SOURCE_STEP_MS = 320
const WORD_STEP_MS = 55
const SUCCESS_GAP_MS = 600
const IDLE_AFTER_SUCCESS_MS = 2800

const REACH_PROCESSING_MS = LISTENING_MS + THINKING_MS
const REACH_RESPONDING_MS = LISTENING_MS + THINKING_MS + PROCESSING_MS

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function advanceTimers(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

function finishRevealAndReturnText(
  getResponse: () => string,
): string {
  let previousText: string | null = null
  let safety = 0

  while (getResponse() !== previousText && safety < 500) {
    previousText = getResponse()
    advanceTimers(WORD_STEP_MS)
    safety += 1
  }

  return getResponse()
}

describe('useMimirConversation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes the full contract with idle starting values', () => {
    const { result } = renderHook(() => useMimirConversation())

    const conversation = result.current

    expect(conversation.state).toBe('idle')
    expect(conversation.response).toBe('')
    expect(conversation.sources).toEqual([])
    expect(conversation.success).toBe(false)
    expect(typeof conversation.amplitude).toBe('number')
    expect(typeof conversation.send).toBe('function')
    expect(conversation.inputMode).toBe('texte')
  })

  it('keeps the sent message available as the current request', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })

    expect(result.current.request).toBe('Résume ma semaine')
  })

  it('walks through the six states in order after a send', () => {
    const { result } = renderHook(() => useMimirConversation())

    expect(result.current.state).toBe('idle')

    act(() => {
      result.current.send('Résume ma semaine')
    })
    expect(result.current.state).toBe('listening')

    advanceTimers(LISTENING_MS)
    expect(result.current.state).toBe('thinking')

    advanceTimers(THINKING_MS)
    expect(result.current.state).toBe('processing')

    advanceTimers(PROCESSING_MS)
    expect(result.current.state).toBe('responding')

    finishRevealAndReturnText(() => result.current.response)
    advanceTimers(SUCCESS_GAP_MS)
    expect(result.current.state).toBe('success')

    advanceTimers(IDLE_AFTER_SUCCESS_MS)
    expect(result.current.state).toBe('idle')
  })

  it('holds a freshly entered state for at least 400ms', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(399)

    expect(result.current.state).toBe('listening')
  })

  it('lights the four sources one at a time every 320ms while processing', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_PROCESSING_MS)

    expect(result.current.sources).toHaveLength(0)

    advanceTimers(SOURCE_STEP_MS)
    expect(result.current.sources).toHaveLength(1)

    advanceTimers(SOURCE_STEP_MS)
    expect(result.current.sources).toHaveLength(2)

    advanceTimers(SOURCE_STEP_MS)
    expect(result.current.sources).toHaveLength(3)

    advanceTimers(SOURCE_STEP_MS)
    expect(result.current.sources).toHaveLength(4)
  })

  it('reveals the response one word every 55ms while responding', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_RESPONDING_MS)

    advanceTimers(WORD_STEP_MS)
    expect(wordCount(result.current.response)).toBe(1)

    advanceTimers(WORD_STEP_MS)
    expect(wordCount(result.current.response)).toBe(2)
  })

  it('marks the reveal as in progress until the full text is shown', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_RESPONDING_MS)
    advanceTimers(WORD_STEP_MS)

    const partialResponse = result.current.response

    const fullResponse = finishRevealAndReturnText(() => result.current.response)

    expect(partialResponse.length).toBeLessThan(fullResponse.length)
    expect(result.current.state).toBe('responding')
  })

  it('turns success on 600ms after the reveal ends', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_RESPONDING_MS)
    finishRevealAndReturnText(() => result.current.response)

    advanceTimers(SUCCESS_GAP_MS)

    expect(result.current.success).toBe(true)
    expect(result.current.state).toBe('success')
  })

  it('returns to idle and clears the cycle 2.8s after success', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_RESPONDING_MS)
    finishRevealAndReturnText(() => result.current.response)
    advanceTimers(SUCCESS_GAP_MS)

    advanceTimers(IDLE_AFTER_SUCCESS_MS)

    expect(result.current.state).toBe('idle')
    expect(result.current.response).toBe('')
    expect(result.current.sources).toEqual([])
    expect(result.current.success).toBe(false)
  })

  it('keeps the chosen input mode across successive sends', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine', 'voix')
    })
    advanceTimers(REACH_RESPONDING_MS)
    finishRevealAndReturnText(() => result.current.response)
    advanceTimers(SUCCESS_GAP_MS)
    advanceTimers(IDLE_AFTER_SUCCESS_MS)

    act(() => {
      result.current.send('Et demain ?')
    })

    expect(result.current.inputMode).toBe('voix')
  })

  it('restarts at listening and clears sources when interrupted during processing', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_PROCESSING_MS)
    advanceTimers(SOURCE_STEP_MS)

    act(() => {
      result.current.send('Change de sujet')
    })

    expect(result.current.state).toBe('listening')
    expect(result.current.sources).toEqual([])
  })

  it('cancels the previous timers when interrupted so no stale transition fires', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_PROCESSING_MS)

    act(() => {
      result.current.send('Change de sujet')
    })
    advanceTimers(LISTENING_MS - 1)

    expect(result.current.state).toBe('listening')
  })

  it('clears the revealed response when interrupted during responding', () => {
    const { result } = renderHook(() => useMimirConversation())

    act(() => {
      result.current.send('Résume ma semaine')
    })
    advanceTimers(REACH_RESPONDING_MS)
    advanceTimers(WORD_STEP_MS)

    act(() => {
      result.current.send('Change de sujet')
    })

    expect(result.current.state).toBe('listening')
    expect(result.current.response).toBe('')
  })

  it('draws its hardcoded responses from a set of two to three distinct texts', () => {
    const { result } = renderHook(() => useMimirConversation())

    const revealedTexts = new Set<string>()
    for (let cycle = 0; cycle < 20; cycle += 1) {
      act(() => {
        result.current.send('Résume ma semaine')
      })
      advanceTimers(REACH_RESPONDING_MS)
      revealedTexts.add(finishRevealAndReturnText(() => result.current.response))
    }

    expect(revealedTexts.size).toBeGreaterThanOrEqual(2)
    expect(revealedTexts.size).toBeLessThanOrEqual(3)
  })
})
