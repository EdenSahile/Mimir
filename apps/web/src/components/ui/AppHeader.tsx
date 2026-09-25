import * as React from "react"
import { cn } from "@/lib/utils"
import ModeSwitch from "@/components/ui/ModeSwitch"

function AppHeader({
  className,
  initials,
  userName,
}: {
  className?: string
  initials: string
  userName: string
}) {
  const [time, setTime] = React.useState(() => new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header
      className={cn(
        "flex items-center justify-between px-[var(--s-5)] py-[var(--s-3)]",
        className
      )}
    >
      <ModeSwitch />
      <div className="flex items-center gap-[var(--s-3)]">
        <span className="hidden wide:block font-mono text-[length:var(--fs-label)] tracking-[var(--ls-label)] uppercase text-[var(--ink-3)]">
          {formattedTime}
        </span>
        <span className="hidden wide:block text-[length:var(--fs-meta)] text-[var(--ink-2)]">
          {userName}
        </span>
        <span className="size-[30px] rounded-full flex items-center justify-center bg-[rgba(255,255,255,.06)] text-[length:var(--fs-meta)] text-[var(--ink-2)]">
          {initials}
        </span>
      </div>
    </header>
  )
}

export default AppHeader
