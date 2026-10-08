import type { Page } from "@playwright/test"

export const TEST_PASSWORD = "Sup3rSecret!2026"

// Email neuf a chaque run : garde chaque test autonome et idempotent meme si la
// base n'etait pas vide.
export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@mimir.test`
}

export async function fillCredentials(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/mot de passe|password/i).fill(password)
}

export function submitButton(page: Page, name: RegExp) {
  return page.getByRole("button", { name })
}

export const signupSubmit = /inscription|s'inscrire|inscrire|créer|sign ?up|register/i
export const loginSubmit = /connexion|se connecter|connecter|sign ?in|log ?in/i
export const logoutControl = /déconnexion|se déconnecter|déconnecter|log ?out|sign ?out/i
