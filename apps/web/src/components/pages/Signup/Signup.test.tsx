import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Signup from "@/components/pages/Signup/Signup"
import { signUp } from "@/lib/authClient"

vi.mock("@/lib/authClient", () => ({
  signUp: { email: vi.fn().mockResolvedValue({ data: {}, error: null }) },
}))

const signUpEmailMock = vi.mocked(signUp.email)

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  )
}

beforeEach(() => {
  signUpEmailMock.mockClear()
})

describe("Signup", () => {
  it("renders the email and password fields and a submit button", () => {
    renderSignup()

    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /s'inscrire|créer un compte|inscription/i })
    ).toBeInTheDocument()
  })

  it("does not call signUp when the form is submitted empty", async () => {
    const user = userEvent.setup()
    renderSignup()

    await user.click(
      screen.getByRole("button", { name: /s'inscrire|créer un compte|inscription/i })
    )

    expect(signUpEmailMock).not.toHaveBeenCalled()
  })

  it("calls signUp with the entered credentials on submit", async () => {
    const user = userEvent.setup()
    renderSignup()
    await user.type(screen.getByLabelText(/e-?mail/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123")

    await user.click(
      screen.getByRole("button", { name: /s'inscrire|créer un compte|inscription/i })
    )

    expect(signUpEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@mimir.app",
        password: "motdepasse123",
      })
    )
  })

  it("shows an error message when signUp fails", async () => {
    const user = userEvent.setup()
    signUpEmailMock.mockResolvedValueOnce({
      data: null,
      error: { code: "USER_ALREADY_EXISTS" },
    } as never)
    renderSignup()
    await user.type(screen.getByLabelText(/e-?mail/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123")

    await user.click(
      screen.getByRole("button", { name: /s'inscrire|créer un compte|inscription/i })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(/compte existe déjà/i)
  })
})
