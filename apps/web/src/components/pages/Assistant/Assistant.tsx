import { useState } from 'react'
import MimirAvatar from '@/components/ui/MimirAvatar/MimirAvatar'
import Composer from '@/components/pages/Assistant/Composer'
import SpokenResponse from '@/components/pages/Assistant/SpokenResponse'
import ThreadDrawer from '@/components/pages/Assistant/ThreadDrawer'
function useMediaQuery(query: string): boolean {
  const mql = window.matchMedia(query)
  return mql.matches
}

interface ThreadEntry {
  author: string
  text: string
}

export default function Assistant() {
  const [requestText, setRequestText] = useState<string | null>(null)
  const [responseText, setResponseText] = useState<string | null>(null)
  const [threadOpen, setThreadOpen] = useState(false)
  const [threadEntries, setThreadEntries] = useState<ThreadEntry[]>([])

  const isDesktop = useMediaQuery('(min-width: 1180px)')
  const isMobile = useMediaQuery('(max-width: 760px)')
  const showGreeting = useMediaQuery('(min-height: 700px)')
  const showRequestLabel = useMediaQuery('(min-height: 640px)')

  const requestInProgress = requestText !== null

  function handleSend(text: string) {
    setRequestText(text)
    setResponseText(null)
    setThreadEntries((prev) => [...prev, { author: 'Vous', text }])
  }

  return (
    <div
      data-testid="assistant-scene"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={isMobile ? { paddingBottom: '84px' } : undefined}
    >
      {!requestInProgress && isDesktop && (
        <div className="pointer-events-none absolute inset-0 flex justify-between px-8">
          <div>
            <h2>Aujourd&apos;hui</h2>
          </div>
          <div>
            <h2>Contexte actif</h2>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center">
        {showGreeting && !requestInProgress && <p>Bonjour</p>}

        {requestInProgress && showRequestLabel && (
          <p>Votre demande</p>
        )}

        {requestInProgress && (
          <div data-testid="request-echo">{requestText}</div>
        )}

        <div data-testid="avatar-stage" className="flex-1">
          <MimirAvatar state={requestInProgress ? 'thinking' : 'idle'} size="stage" />
        </div>

        {responseText && <SpokenResponse text={responseText} />}

        {!requestInProgress && (
          <div data-testid="suggestion-chips" className="flex gap-2">
            <button className="cursor-pointer">Résume ma semaine</button>
            <button className="cursor-pointer">Quoi de neuf ?</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={() => setThreadOpen(true)}
          className="cursor-pointer"
        >
          Fil de l&apos;échange
        </button>
      </div>

      <Composer onSend={handleSend} />

      <ThreadDrawer
        open={threadOpen}
        onClose={() => setThreadOpen(false)}
        entries={threadEntries}
      />
    </div>
  )
}
