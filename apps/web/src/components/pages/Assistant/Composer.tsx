import { useState } from 'react'
import { MicIcon, SendIcon } from 'lucide-react'

interface ComposerProps {
  onSend: (text: string) => void
}

export default function Composer({ onSend }: ComposerProps) {
  const [text, setText] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)
  const [listening, setListening] = useState(false)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  if (voiceMode) {
    return (
      <div data-testid="composer" className="shrink-0">
        <button
          data-testid="composer-voice-toggle"
          onClick={() => {
            setVoiceMode(false)
            setListening(false)
          }}
          className="cursor-pointer"
        >
          Texte
        </button>
        <button
          data-testid="mic-button"
          className={`size-16 cursor-pointer rounded-full${listening ? ' glow' : ''}`}
          aria-pressed={listening}
          onClick={() => setListening(!listening)}
        >
          <MicIcon />
        </button>
        <p>{listening ? 'Mímir vous écoute' : 'Appuyez et parlez'}</p>
      </div>
    )
  }

  return (
    <div data-testid="composer" className="shrink-0">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Parlez à Mímir"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} className="cursor-pointer">
          <SendIcon />
          <span className="sr-only">Envoyer</span>
        </button>
        <button
          data-testid="composer-voice-toggle"
          onClick={() => setVoiceMode(true)}
          className="cursor-pointer"
        >
          <MicIcon />
        </button>
      </div>
    </div>
  )
}
