import { useCallback, useEffect, useRef, useState } from 'react'
import type { MimirState } from '@/types/mimir'

export type InputMode = 'texte' | 'voix'

const LISTENING_MS = 1000
const THINKING_MS = 1200
const PROCESSING_MS = 1500
const SOURCE_STEP_MS = 320
const SOURCE_COUNT = 4
const WORD_STEP_MS = 55
const SUCCESS_GAP_MS = 600
const IDLE_AFTER_SUCCESS_MS = 2800

const RESPONSES = [
  'Voici un résumé clair de ta semaine.',
  "J'ai rassemblé les points clés pour toi.",
  'Tout est prêt, voici ce que j\'ai trouvé.',
]

export interface MimirConversation {
  state: MimirState
  amplitude: number
  request: string
  response: string
  sources: number[]
  success: boolean
  inputMode: InputMode
  send: (text: string, mode?: InputMode) => void
}

export function useMimirConversation(): MimirConversation {
  const [state, setState] = useState<MimirState>('idle')
  const [request, setRequest] = useState('')
  const [response, setResponse] = useState('')
  const [sources, setSources] = useState<number[]>([])
  const [success, setSuccess] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>('texte')

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const nextResponse = useRef(0)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const schedule = useCallback((delay: number, run: () => void) => {
    timers.current.push(setTimeout(run, delay))
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const send = useCallback(
    (text: string, mode?: InputMode) => {
      clearTimers()
      setRequest(text)
      if (mode !== undefined) {
        setInputMode(mode)
      }
      setResponse('')
      setSources([])
      setSuccess(false)
      setState('listening')

      const thinkingAt = LISTENING_MS
      const processingAt = thinkingAt + THINKING_MS
      const respondingAt = processingAt + PROCESSING_MS

      schedule(thinkingAt, () => setState('thinking'))
      schedule(processingAt, () => setState('processing'))

      for (let source = 1; source <= SOURCE_COUNT; source += 1) {
        schedule(processingAt + SOURCE_STEP_MS * source, () => {
          setSources((lit) => [...lit, lit.length])
        })
      }

      const words = RESPONSES[nextResponse.current % RESPONSES.length].split(' ')
      nextResponse.current += 1

      schedule(respondingAt, () => setState('responding'))
      words.forEach((_, index) => {
        schedule(respondingAt + WORD_STEP_MS * (index + 1), () => {
          setResponse(words.slice(0, index + 1).join(' '))
        })
      })

      const revealEndsAt = respondingAt + WORD_STEP_MS * words.length
      schedule(revealEndsAt + SUCCESS_GAP_MS, () => {
        setState('success')
        setSuccess(true)
      })
      schedule(revealEndsAt + SUCCESS_GAP_MS + IDLE_AFTER_SUCCESS_MS, () => {
        setState('idle')
        setResponse('')
        setSources([])
        setSuccess(false)
      })
    },
    [clearTimers, schedule],
  )

  // amplitude (0) et la forme de sources sont des placeholders simulés : le vrai signal arrivera du stream Claude (MIM-29).
  return { state, amplitude: 0, request, response, sources, success, inputMode, send }
}
