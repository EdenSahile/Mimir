import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Verifie a la source sur Prisma 7.10 : avec url posee sur DATABASE_URL et
    // directUrl sur DIRECT_URL, migrate deploy se connecte quand meme au host
    // poole. Teste en remplacant DIRECT_URL par un host inexistant : la
    // commande reussit, donc directUrl n'est pas emprunte. Or les migrations
    // prennent des verrous consultatifs et des instructions de session, que
    // PgBouncer en mode transaction supporte mal. Ce fichier ne sert qu'au CLI
    // Prisma (le runtime passe par l'adaptateur Neon et DATABASE_URL), donc
    // pointer url sur la connexion directe est sans effet sur l'application.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    directUrl: process.env.DIRECT_URL,
  },
})
