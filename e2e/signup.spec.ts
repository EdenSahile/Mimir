import { expect, test } from "@playwright/test"
import { prisma } from "@mimir/db"
import { TEST_PASSWORD, fillCredentials, logoutControl, signupSubmit, submitButton, uniqueEmail } from "./helpers"

// Critere 2 -- Inscription par email bout en bout (part manuelle du 🟠).
// Verifie l'effet reel : un compte en base, actif immediatement, session ouverte,
// sans verification d'email.
test("l'inscription cree un compte actif et ouvre une session", async ({ page }) => {
  const email = uniqueEmail("signup")

  await page.goto("/signup")
  await fillCredentials(page, email, TEST_PASSWORD)
  await submitButton(page, signupSubmit).click()

  await expect(page).not.toHaveURL(/\/signup$/)
  await expect(submitButton(page, logoutControl)).toBeVisible()

  const createdUser = await prisma.user.findUnique({ where: { email } })

  expect(createdUser, "une ligne User doit exister pour l'email inscrit").not.toBeNull()
})
