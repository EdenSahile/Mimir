import { useEffect } from 'react'

interface ThreadEntry {
  author: string
  text: string
}

interface ThreadDrawerProps {
  open: boolean
  onClose: () => void
  entries: ThreadEntry[]
}

export default function ThreadDrawer({
  open,
  onClose,
  entries,
}: ThreadDrawerProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div role="dialog">
      {entries.map((entry, i) => (
        <div key={i}>
          <span>{entry.author}</span>
          <p>{entry.text}</p>
        </div>
      ))}
    </div>
  )
}
