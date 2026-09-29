import { Outlet } from "react-router-dom"
import NavRail from "@/components/ui/NavRail"
import BottomBar from "@/components/ui/BottomBar"

export default function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <NavRail />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  )
}
