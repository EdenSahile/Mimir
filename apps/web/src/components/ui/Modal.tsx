import * as React from "react"
import { cn } from "cn"
import { Dialog as DialogPrimitive } from "radix-ui"

function Modal({
  className,
  children,
  open,
  title,
  onClose,
}: {
  className?: string
  children: React.ReactNode
  open: boolean
  title: string
  onClose?: () => void
}) {
  const titleId = React.useId()

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose?.() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-[var(--scrim)]"
        />
        <DialogPrimitive.Content
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] border border-[rgba(255,255,255,.1)] bg-[var(--overlay)] p-[22px] shadow-[var(--shadow-3)] outline-none sm:max-w-md",
            className
          )}
        >
          <h2
            id={titleId}
            className="font-heading text-[21px] text-[var(--ink-strong)]"
          >
            {title}
          </h2>
          <div className="mt-3 text-[length:var(--fs-ui)] text-[var(--ink-2)]">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Modal
