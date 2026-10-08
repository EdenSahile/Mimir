import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@mimir/db"
import { betterAuthUrl, frontendUrl } from "@/config/env/env.js"

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // Inscription email + mot de passe, compte actif immédiatement (pas de vérification d'email).
  emailAndPassword: { enabled: true },
  trustedOrigins: [frontendUrl],
})
