import { expect, test } from "@playwright/test"
import {
  TEST_PASSWORD,
  fillCredentials,
  loginSubmit,
  logoutControl,
  signupSubmit,
  submitButton,
  uniqueEmail,
} from "./helpers"

// Critere 3 -- Connexion / deconnexion bout en bout (part manuelle du 🟠).
// Le compte est cree dans le test lui-meme (autonome), puis on teste le cycle
// login -> cookie de session -> logout -> redirection vers /login.
test("la connexion ouvre une session et la deconnexion la ferme", async ({ page }) => {
  const email = uniqueEmail("login")

  await page.goto("/signup")
  await fillCredentials(page, email, TEST_PASSWORD)
  await submitButton(page, signupSubmit).click()
  await submitButton(page, logoutControl).click()

  await page.goto("/login")
  await fillCredentials(page, email, TEST_PASSWORD)
  await submitButton(page, loginSubmit).click()

  await expect(page).not.toHaveURL(/\/login$/)
  await expect(submitButton(page, logoutControl)).toBeVisible()

  const cookiesAfterLogin = await page.context().cookies()
  expect(cookiesAfterLogin.length, "un cookie de session doit etre pose apres login").toBeGreaterThan(0)

  await submitButton(page, logoutControl).click()

  await page.goto("/mimir")
  await expect(page).toHaveURL(/\/login$/)
})
