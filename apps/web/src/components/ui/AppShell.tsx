import { Outlet } from "react-router-dom"
import NavRail from "@/components/ui/NavRail"
import BottomBar from "@/components/ui/BottomBar"
import SignOutButton from "@/components/ui/SignOutButton/SignOutButton"

export default function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <NavRail />
      <main className="flex-1">
        <header className="flex justify-end p-4">
          <SignOutButton />
        </header>
        <Outlet />
      </main>
      <BottomBar />
    </div>
  )
}
