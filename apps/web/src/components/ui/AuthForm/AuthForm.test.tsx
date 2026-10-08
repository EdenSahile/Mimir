import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AuthForm from "@/components/ui/AuthForm/AuthForm"

const navigateMock = vi.fn()
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return { ...actual, useNavigate: () => navigateMock }
})

type AuthResult = { error: { code?: string } | null }

function renderAuthForm(onSubmit: (credentials: { email: string; password: string }) => Promise<AuthResult>) {
  return render(<AuthForm idPrefix="login" submitLabel="Se connecter" onSubmit={onSubmit} />)
}

beforeEach(() => {
  navigateMock.mockClear()
})

describe("AuthForm", () => {
  it("renders the fields with the id prefix and the submit label", () => {
    renderAuthForm(vi.fn().mockResolvedValue({ error: null }))

    expect(screen.getByLabelText(/email/i)).toHaveAttribute("id", "login-email")
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument()
  })

  it("does not call onSubmit when the form is empty", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ error: null })
    renderAuthForm(onSubmit)

    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("calls onSubmit with the credentials and navigates on success", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ error: null })
    renderAuthForm(onSubmit)
    await user.type(screen.getByLabelText(/email/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123")

    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(onSubmit).toHaveBeenCalledWith({ email: "ada@mimir.app", password: "motdepasse123" })
    expect(navigateMock).toHaveBeenCalledWith("/mimir")
  })

  it("shows an error message and does not navigate when onSubmit fails", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ error: { code: "INVALID_EMAIL_OR_PASSWORD" } })
    renderAuthForm(onSubmit)
    await user.type(screen.getByLabelText(/email/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "mauvais")

    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect/i)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it("disables the submit button while the submission is pending", async () => {
    const user = userEvent.setup()
    let resolveSubmit: (result: AuthResult) => void = () => {}
    const onSubmit = vi.fn().mockReturnValue(
      new Promise<AuthResult>((resolve) => {
        resolveSubmit = resolve
      }),
    )
    renderAuthForm(onSubmit)
    await user.type(screen.getByLabelText(/email/i), "ada@mimir.app")
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123")

    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(screen.getByRole("button", { name: "Se connecter" })).toBeDisabled()

    resolveSubmit({ error: null })
    await waitFor(() => expect(screen.getByRole("button", { name: "Se connecter" })).toBeEnabled())
  })
})
