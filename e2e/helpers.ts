import type { Page } from "@playwright/test"

export const TEST_PASSWORD = "Sup3rSecret!2026"

// En mode preview (PREVIEW_URL), le client Prisma du runner pointe .env.test,
// alors que le deploiement ecrit sur la branche Neon de dev : une lecture en
// base ne verrait jamais la ligne creee par le navigateur. Les assertions en
// base sont donc sautees dans ce mode, les assertions visibles du navigateur
// restent jouees. En local, rien ne change : les 2 pointent la meme base.
export const skipsDatabaseAssertions = Boolean(process.env.PREVIEW_URL)

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
