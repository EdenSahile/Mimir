import { defineConfig, devices } from "@playwright/test"

const headed = process.env.HEADED === "1"

// PREVIEW_URL vise un deploiement Vercel au lieu des serveurs locaux. Les
// previews restent proteges (DEC-012) : sans le secret de contournement, chaque
// requete repart en 302 vers vercel.com/sso-api et tous les tests echouent sur
// une page de connexion. On echoue donc tout de suite, avec la cause.
const previewUrl = process.env.PREVIEW_URL
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

if (previewUrl && !bypassSecret) {
  throw new Error(
    "VERCEL_AUTOMATION_BYPASS_SECRET is required to run the e2e suite against a protected preview",
  )
}

// Le contournement se fait par en-tete HTTP, et non par le CLI Vercel. Le
// second en-tete demande a Vercel de poser le contournement en cookie via une
// redirection : sans lui, seule la premiere requete passe, et les navigations
// du navigateur repartent en 302 (documente par Vercel pour le test en
// navigateur).
const previewHeaders = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : undefined

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
    baseURL: previewUrl ?? "http://localhost:5173",
    extraHTTPHeaders: previewHeaders,
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
  // Aucun serveur local a lancer quand la cible est un preview deja deploye.
  webServer: previewUrl
    ? undefined
    : [
        {
          command: "pnpm exec dotenv run -f .env.test -- pnpm dev:api",
          url: "http://localhost:3001/api/health",
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
