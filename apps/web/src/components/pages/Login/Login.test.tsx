import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Login from "@/components/pages/Login/Login"
import { signIn } from "@/lib/authClient"

vi.mock("@/lib/authClient", () => ({
  signIn: { email: vi.fn().mockResolvedValue({ data: {}, error: null }) },
}))

const signInEmailMock = vi.mocked(signIn.email)

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

beforeEach(() => {
  signInEmailMock.mockClear()
})

describe("Login", () => {
  it("renders the email and password fields and a submit button", () => {
    renderLogin()

    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /se connecter|connexion/i })
    ).toBeInTheDocument()
  })

  it("calls signIn with the entered credentials on submit", async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/e-?mail/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123")

    await user.click(
      screen.getByRole("button", { name: /se connecter|connexion/i })
    )

    expect(signInEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@mimir.app",
        password: "motdepasse123",
      })
    )
  })

  it("shows an error message when signIn fails", async () => {
    const user = userEvent.setup()
    signInEmailMock.mockResolvedValueOnce({
      data: null,
      error: { code: "INVALID_EMAIL_OR_PASSWORD" },
    } as never)
    renderLogin()
    await user.type(screen.getByLabelText(/e-?mail/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "mauvais")

    await user.click(
      screen.getByRole("button", { name: /se connecter|connexion/i })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect/i)
  })
})
