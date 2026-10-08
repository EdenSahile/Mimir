import { describe, expect, it } from "vitest"
import { authErrorMessage } from "@/logic/auth/errorMessage/errorMessage"

describe("authErrorMessage", () => {
  it("maps invalid credentials to a French message", () => {
    const invalidCredentials = { code: "INVALID_EMAIL_OR_PASSWORD" }

    expect(authErrorMessage(invalidCredentials)).toBe("Email ou mot de passe incorrect.")
  })

  it("maps an already existing account to a French message", () => {
    const existingAccount = { code: "USER_ALREADY_EXISTS" }

    expect(authErrorMessage(existingAccount)).toBe("Un compte existe déjà avec cet email.")
  })

  it("falls back to a generic French message for an unknown code", () => {
    const unknownCode = { code: "SOMETHING_UNEXPECTED" }

    expect(authErrorMessage(unknownCode)).toBe("Une erreur est survenue, réessaie.")
  })

  it("falls back to a generic French message when there is no code", () => {
    const errorWithoutCode = {}

    expect(authErrorMessage(errorWithoutCode)).toBe("Une erreur est survenue, réessaie.")
  })
})
