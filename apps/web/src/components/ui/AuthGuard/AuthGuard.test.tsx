import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AuthGuard from "@/components/ui/AuthGuard/AuthGuard"
import { useSession } from "@/lib/authClient"

vi.mock("@/lib/authClient", () => ({
  useSession: vi.fn(),
}))

const useSessionMock = vi.mocked(useSession)

function renderGuardedRoute() {
  return render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route
          path="/private"
          element={
            <AuthGuard>
              <p>Tableau de bord privé</p>
            </AuthGuard>
          }
        />
        <Route path="/login" element={<p>Écran de connexion</p>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useSessionMock.mockReset()
})

describe("AuthGuard", () => {
  it("renders the protected content when a session is present", () => {
    useSessionMock.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    } as unknown as ReturnType<typeof useSession>)

    renderGuardedRoute()

    expect(screen.getByText("Tableau de bord privé")).toBeInTheDocument()
  })

  it("redirects to the login screen when no session is present", () => {
    useSessionMock.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>)

    renderGuardedRoute()

    expect(screen.getByText("Écran de connexion")).toBeInTheDocument()
    expect(screen.queryByText("Tableau de bord privé")).not.toBeInTheDocument()
  })
})
