import * as React from "react"
import { cn } from "cn"

function Chip({
  className,
  children,
  active = false,
  onToggle,
  ...props
}: Omit<React.ComponentProps<"button">, "role"> & {
  active?: boolean
  onToggle?: (active: boolean) => void
}) {
  return (
    <button
      role="checkbox"
      aria-pressed={active ? "true" : "false"}
      data-slot="chip"
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center rounded-[var(--r-pill)] border px-[18px] py-3 text-[length:var(--fs-ui)] transition-all duration-[var(--dur-base)] outline-none select-none",
        active
          ? "border-[rgba(206,244,248,.4)] bg-[rgba(206,244,248,.13)] text-[var(--light-hover)]"
          : "border-[rgba(255,255,255,.07)] bg-[var(--chip)] text-[var(--ink-2)]",
        className
      )}
      onClick={() => onToggle?.(!active)}
      {...props}
    >
      {children}
    </button>
  )
}

export { Chip }
