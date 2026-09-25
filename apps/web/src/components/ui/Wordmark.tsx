import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "font-heading text-[18px] tracking-[.32em] text-[var(--ink-strong)] no-underline",
        className
      )}
    >
      MÍMIR
    </Link>
  )
}

export default Wordmark
