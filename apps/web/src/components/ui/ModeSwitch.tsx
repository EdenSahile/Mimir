import * as React from "react"
import Segmented from "@/components/ui/Segmented"

const MODE_OPTIONS = ["Assistant", "Workspace"]

function ModeSwitch({ className }: { className?: string }) {
  const [mode, setMode] = React.useState("Assistant")

  return (
    <div className="transition-all duration-[900ms] ease-[var(--ease-presence)]">
      <Segmented
        className={className}
        options={MODE_OPTIONS}
        value={mode}
        onChange={setMode}
      />
    </div>
  )
}

export default ModeSwitch
