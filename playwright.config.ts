import { defineConfig, devices } from "@playwright/test"

const headed = process.env.HEADED === "1"

// apps/api ne charge aucun fichier .env : il lit process.env brut. Le webServer
// doit donc injecter .env.test au boot (dotenv run -f devant pnpm dev:api),
// sinon l'API tournerait sur la base de dev. reuseExistingServer reste false
// pour la meme raison : on ne reutilise jamais un serveur deja lance (il
// pourrait pointer la base de dev).
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/globalSetup.ts",
  // headed : 1 worker pour un deroule sequentiel lisible.
  // sinon undefined : la valeur par defaut de Playwright, la MOITIE des coeurs.
  workers: headed ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    headless: !headed,
    trace: "on-first-retry",
    launchOptions: {
      slowMo: headed ? Number(process.env.SLOWMO ?? 800) : 0,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm exec dotenv run -f .env.test -- pnpm dev:api",
      url: "http://localhost:3001/health",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "pnpm dev:web",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
