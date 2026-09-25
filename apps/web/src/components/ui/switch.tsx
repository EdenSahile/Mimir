import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center rounded-full border transition-all duration-[var(--dur-quick)] ease-[var(--ease-presence)] outline-none focus-visible:outline focus-visible:outline-[rgba(206,244,248,.75)] focus-visible:outline-offset-[3px] data-[state=checked]:bg-[rgba(206,244,248,.2)] data-[state=checked]:border-[rgba(206,244,248,.4)] data-[state=unchecked]:bg-[rgba(255,255,255,.04)] data-[state=unchecked]:border-[rgba(255,255,255,.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[18px] rounded-full transition-transform duration-[var(--dur-quick)] ease-[var(--ease-presence)] data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-[var(--light)] data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-[rgba(230,238,240,.4)]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
