import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { expect, test } from "@playwright/test"

// Critere 1 -- Better Auth installe et configure (smokes-MIM-23.md).
// On ne verifie pas une valeur de config : on prouve au runtime que le handler
// repond contre la vraie base de test.
test.describe("Better Auth est installe et cable", () => {
  test("better-auth figure dans les dependances de l'API", () => {
    const apiPackageJsonPath = resolve(process.cwd(), "apps/api/package.json")

    const apiPackageJson = JSON.parse(readFileSync(apiPackageJsonPath, "utf-8"))

    expect(apiPackageJson.dependencies ?? {}).toHaveProperty("better-auth")
  })

  test("l'endpoint de session repond sans etre connecte", async ({ request }) => {
    const sessionResponse = await request.get("/api/auth/get-session")

    expect(sessionResponse.status(), "le handler /api/auth/* doit etre monte (pas de 404)").not.toBe(404)
    expect(sessionResponse.status()).toBeLessThan(500)
  })
})
