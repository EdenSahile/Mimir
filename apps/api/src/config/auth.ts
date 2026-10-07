import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@mimir/db"

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173"
const baseURL = process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3001}`

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // Inscription email + mot de passe, compte actif immédiatement (pas de vérification d'email).
  emailAndPassword: { enabled: true },
  trustedOrigins: [frontendUrl],
})
