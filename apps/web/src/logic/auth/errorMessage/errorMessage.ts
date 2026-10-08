type AuthError = { code?: string } | null | undefined

const MESSAGES_PAR_CODE: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet email.",
  PASSWORD_TOO_SHORT: "Le mot de passe est trop court.",
}

const MESSAGE_GENERIQUE = "Une erreur est survenue, réessaie."

export function authErrorMessage(error: AuthError): string {
  if (error?.code && MESSAGES_PAR_CODE[error.code]) return MESSAGES_PAR_CODE[error.code]
  return MESSAGE_GENERIQUE
}
