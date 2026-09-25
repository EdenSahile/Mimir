import * as React from "react"
import { cn } from "cn"

function Toast({
  className,
  message,
  variant = "default",
  onDismiss,
}: {
  className?: string
  message: string
  variant?: "default" | "alert"
  onDismiss?: () => void
}) {
  React.useEffect(() => {
    if (variant === "alert" || !onDismiss) return

    const timer = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timer)
  }, [variant, onDismiss])

  return (
    <div
      role={variant === "alert" ? "alert" : "status"}
      data-slot="toast"
      className={cn(
        "rounded-[var(--r-md)] px-4 py-3.5 text-[length:var(--fs-ui)] text-[var(--ink)] shadow-[var(--shadow-2)]",
        variant === "alert"
          ? "border border-[rgba(232,199,154,.26)] bg-[rgba(12,18,22,.9)]"
          : "border border-[rgba(206,244,248,.18)] bg-[rgba(12,18,22,.9)]",
        className
      )}
    >
      {variant === "alert" && (
        <span className="mr-2 text-[var(--caution-ink)]">!</span>
      )}
      {message}
    </div>
  )
}

export default Toast
