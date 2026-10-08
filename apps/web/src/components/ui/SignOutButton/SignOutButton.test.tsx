import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SignOutButton from "@/components/ui/SignOutButton/SignOutButton"
import { signOut } from "@/lib/authClient"

vi.mock("@/lib/authClient", () => ({
  signOut: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

const signOutMock = vi.mocked(signOut)

beforeEach(() => {
  signOutMock.mockClear()
})

describe("SignOutButton", () => {
  it("renders a sign-out control", () => {
    render(<SignOutButton />)

    expect(
      screen.getByRole("button", { name: /déconnexion|se déconnecter/i })
    ).toBeInTheDocument()
  })

  it("calls signOut when clicked", async () => {
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(
      screen.getByRole("button", { name: /déconnexion|se déconnecter/i })
    )

    expect(signOutMock).toHaveBeenCalledOnce()
  })

  it("shows an error message when signOut fails", async () => {
    const user = userEvent.setup()
    signOutMock.mockResolvedValueOnce({
      data: null,
      error: { message: "network error" },
    } as never)
    render(<SignOutButton />)

    await user.click(
      screen.getByRole("button", { name: /déconnexion|se déconnecter/i })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(/échoué/i)
  })
})
