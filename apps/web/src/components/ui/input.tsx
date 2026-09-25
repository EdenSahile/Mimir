import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-[var(--r-md)] border border-[rgba(255,255,255,.1)] bg-[var(--field)] px-5 py-[15px] text-[length:var(--fs-body)] text-[var(--ink)] transition-colors duration-[var(--dur-instant)] outline-none placeholder:text-[var(--ink-3)] focus-visible:border-[rgba(206,244,248,.45)] focus-visible:bg-[rgba(206,244,248,.05)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
