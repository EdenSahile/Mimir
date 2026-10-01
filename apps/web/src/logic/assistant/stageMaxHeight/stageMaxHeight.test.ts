import { describe, expect, it } from 'vitest'
import { stageMaxHeight } from '@/logic/assistant/stageMaxHeight/stageMaxHeight'

describe('stageMaxHeight', () => {
  it('caps the stage at 480px on a tall viewport in idle', () => {
    const tallIdle = { viewportHeight: 900, requestInProgress: false }

    expect(stageMaxHeight(tallIdle)).toBe(480)
  })

  it('caps the stage at 480px on a short viewport when no request is in progress', () => {
    const shortIdle = { viewportHeight: 500, requestInProgress: false }

    expect(stageMaxHeight(shortIdle)).toBe(480)
  })

  it('drops the cap to 120px during a request under 640px of height', () => {
    const shortWithRequest = { viewportHeight: 639, requestInProgress: true }

    expect(stageMaxHeight(shortWithRequest)).toBe(120)
  })

  it('keeps the cap at 480px during a request at exactly 640px of height', () => {
    const borderWithRequest = { viewportHeight: 640, requestInProgress: true }

    expect(stageMaxHeight(borderWithRequest)).toBe(480)
  })

  it('keeps the cap at 480px during a request on a tall viewport', () => {
    const tallWithRequest = { viewportHeight: 900, requestInProgress: true }

    expect(stageMaxHeight(tallWithRequest)).toBe(480)
  })
})
