import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useSession } from "@/lib/authClient"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession()

  if (isPending) return null
  if (!data) return <Navigate to="/login" replace />

  return <>{children}</>
}
