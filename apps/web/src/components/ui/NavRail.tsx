import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Mímir", path: "/mimir" },
  { label: "My Day", path: "/day" },
  { label: "Projets", path: "/projects" },
  { label: "AI News", path: "/news" },
  { label: "Job Watch", path: "/jobs" },
  { label: "Mémoire", path: "/memory" },
  { label: "Documents", path: "/documents" },
  { label: "Réglages", path: "/settings" },
]

function NavRail({ className }: { className?: string }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className={cn(
        "hidden desktop:flex w-[var(--rail-w)] shrink-0 flex-col border-r border-[rgba(255,255,255,.05)] py-[var(--s-5)]",
        className
      )}
    >
      <span
        className="cursor-pointer px-[var(--s-5)] pb-[var(--s-6)] font-heading text-[18px] tracking-[.32em] text-[var(--ink-strong)]"
        onClick={() => navigate("/")}
      >
        MÍMIR
      </span>
      {NAV_ITEMS.map(({ label, path }) => {
        const isActive = location.pathname.startsWith(path)
        return (
          <Link
            key={path}
            to={path}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex items-center px-[var(--s-5)] py-[9px] text-[length:var(--fs-ui)] transition-colors duration-[var(--dur-instant)]",
              isActive
                ? "text-[var(--ink-strong)]"
                : "text-[rgba(230,238,240,.66)] hover:text-[var(--ink)]"
            )}
          >
            {isActive && (
              <span
                data-active-indicator
                className="absolute left-0 h-[13px] w-px bg-[var(--light)] shadow-[var(--nav-glow)]"
              />
            )}
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default NavRail
