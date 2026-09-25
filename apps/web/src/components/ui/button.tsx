import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[var(--r-pill)] min-h-11 cursor-pointer text-[length:var(--fs-ui)] font-medium whitespace-nowrap transition-all duration-[var(--dur-instant)] outline-none select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[rgba(255,255,255,.03)] disabled:border-[rgba(255,255,255,.06)] disabled:text-[rgba(230,238,240,.4)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(180deg,rgba(206,244,248,.95),rgba(176,226,232,.82))] text-[var(--on-light)] font-medium px-7 shadow-[var(--glow-primary)] hover:shadow-[var(--glow-primary-hover)]",
        secondary:
          "bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.1)] text-[rgba(230,238,240,.82)] hover:border-[rgba(206,244,248,.35)]",
        ghost:
          "text-[var(--light)] underline underline-offset-4 hover:text-[var(--light-hover)]",
        destructive:
          "bg-transparent border border-[var(--danger-border)] text-[var(--danger)] hover:bg-[rgba(236,196,176,.06)]",
      },
      size: {
        default: "gap-2 px-7 py-3.5",
        sm: "gap-1.5 px-5 py-2.5 text-[13px]",
        lg: "gap-2 px-9 py-4 text-[15px]",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
