import * as React from "react"
import { cn } from "cn"

function Segmented({
  className,
  options,
  value,
  onChange,
}: {
  className?: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      role="radiogroup"
      data-slot="segmented"
      className={cn(
        "inline-flex rounded-[var(--r-pill)] border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.035)] p-1",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          role="radio"
          aria-checked={option === value ? "true" : "false"}
          className={cn(
            "cursor-pointer rounded-[var(--r-pill)] px-[18px] py-2 text-[13px] transition-all duration-[var(--dur-instant)] outline-none select-none",
            option === value
              ? "bg-[rgba(206,244,248,.14)] text-[var(--light-hover)]"
              : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"
          )}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default Segmented
