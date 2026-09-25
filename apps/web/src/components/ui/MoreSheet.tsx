import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const SHEET_ITEMS = [
  { label: "AI News", path: "/news" },
  { label: "Job Watch", path: "/jobs" },
  { label: "Mémoire", path: "/memory" },
  { label: "Réglages", path: "/settings" },
]

function MoreSheet({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <>
      <button
        className={cn(
          "min-h-11 cursor-pointer bg-transparent text-[length:var(--fs-ui)] text-[rgba(230,238,240,.66)]",
          className
        )}
        onClick={() => setOpen(true)}
      >
        Plus
      </button>
      {open && (
        <>
          <div
            data-testid="scrim"
            className="fixed inset-0 z-40 bg-[var(--scrim)] backdrop-blur-[8px]"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-[var(--s-3)] bottom-[92px] left-[var(--s-3)] z-50 rounded-[var(--r-xl)] border border-[rgba(255,255,255,.07)] bg-[var(--overlay)] p-[var(--s-5)] shadow-[var(--shadow-3)] animate-[mim-rise_400ms_var(--ease-presence)]">
            {SHEET_ITEMS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center justify-between py-[var(--s-3)] text-[15px] text-[var(--ink)] hover:text-[var(--ink-strong)]"
                onClick={() => setOpen(false)}
              >
                {label}
                <span className="font-mono text-[var(--ink-3)]">→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default MoreSheet
