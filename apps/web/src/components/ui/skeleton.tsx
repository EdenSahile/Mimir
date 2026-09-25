import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-[var(--r-xs)] bg-[rgba(255,255,255,.06)] animate-[pulse_1.8s_ease-in-out_infinite]", className)}
      {...props}
    />
  )
}

export { Skeleton }
