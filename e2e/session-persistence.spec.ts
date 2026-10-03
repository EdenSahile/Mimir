import { expect, test } from "@playwright/test"
import { prisma } from "@mimir/db"
import { TEST_PASSWORD, fillCredentials, logoutControl, signupSubmit, submitButton, uniqueEmail } from "./helpers"

// Critere 4 -- Sessions persistees en base (smokes-MIM-23.md).
// Une ligne de session ecrite en base, reliee au User, et qui survit au reload.
// Le modele Session sera ajoute par Better Auth ; aujourd'hui prisma.session
// n'existe pas, donc ce test est rouge tant que l'auth n'est pas cablee.
const sessionModel = () =>
  (prisma as unknown as { session: { findFirst: (args: unknown) => Promise<{ userId: string } | null> } }).session

test("la session est persistee en base et survit a un rechargement", async ({ page }) => {
  const email = uniqueEmail("session")

  await page.goto("/signup")
  await fillCredentials(page, email, TEST_PASSWORD)
  await submitButton(page, signupSubmit).click()
  await expect(submitButton(page, logoutControl)).toBeVisible()

  const createdUser = await prisma.user.findUnique({ where: { email } })
  expect(createdUser).not.toBeNull()

  const persistedSession = await sessionModel().findFirst({ where: { userId: createdUser?.id } })
  expect(persistedSession, "une ligne de session reliee au User doit exister").not.toBeNull()

  await page.reload()
  await expect(submitButton(page, logoutControl)).toBeVisible()

  const meResponse = await page.request.get("/api/me")
  expect(meResponse.ok(), "/api/me doit renvoyer l'utilisateur courant").toBeTruthy()
  expect(await meResponse.json()).toMatchObject({ email })
})
