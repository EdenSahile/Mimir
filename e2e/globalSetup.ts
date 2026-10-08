import { execSync } from "node:child_process"
import { resolve } from "node:path"
import { config as loadEnv } from "dotenv"

// Charge .env.test dans le process du runner pour que les specs qui interrogent
// la base (client Prisma) pointent sur la branche de test Neon, jamais la dev.
const envTestPath = resolve(process.cwd(), ".env.test")
loadEnv({ path: envTestPath, override: true })

// Reset de la base de test avant le run : migrate reset --force rejoue les
// migrations sur une base vide. dotenv-cli charge .env.test dans le process
// Prisma (le package @mimir/db ne lit que process.env).
export default function globalSetup() {
  execSync(
    "pnpm --filter @mimir/db exec dotenv -e ../../.env.test -- prisma migrate reset --force --skip-generate",
    { stdio: "inherit" }
  )
}
