import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import MoreSheet from "@/components/ui/MoreSheet"

function BottomBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed right-[var(--s-3)] bottom-[var(--s-3)] left-[var(--s-3)] z-50 flex items-center justify-around rounded-[var(--r-xl)] border border-[rgba(255,255,255,.08)] bg-[rgba(8,12,16,.92)] px-[var(--s-4)] py-[var(--s-2)] shadow-[var(--shadow-2)] backdrop-blur-[22px] desktop:hidden",
        className
      )}
    >
      <Link
        to="/day"
        className="min-h-11 flex items-center justify-center px-[var(--s-2)] text-[length:var(--fs-ui)] text-[rgba(230,238,240,.66)]"
      >
        My Day
      </Link>
      <Link
        to="/projects"
        className="min-h-11 flex items-center justify-center px-[var(--s-2)] text-[length:var(--fs-ui)] text-[rgba(230,238,240,.66)]"
      >
        Projets
      </Link>
      <Link
        to="/mimir"
        className="min-h-11 flex items-center justify-center"
      >
        <div
          data-testid="mimir-presence"
          className="size-[50px] animate-[mim-presence_4s_var(--ease-breath)_infinite] rounded-full bg-[rgba(var(--light-rgb),.15)]"
        />
      </Link>
      <Link
        to="/documents"
        className="min-h-11 flex items-center justify-center px-[var(--s-2)] text-[length:var(--fs-ui)] text-[rgba(230,238,240,.66)]"
      >
        Docs
      </Link>
      <MoreSheet />
    </div>
  )
}

export default BottomBar
