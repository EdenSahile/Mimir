import "dotenv/config"
import { defineConfig } from "prisma/config"
import { resolveCliDatasourceUrl } from "./cliDatasource/cliDatasource.js"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Ce fichier ne sert qu'au CLI Prisma : le runtime passe par l'adaptateur
    // Neon et DATABASE_URL. Les regles de choix, et l'echec bruyant quand une
    // migration n'a pas de connexion directe, sont dans cliDatasource.
    url: resolveCliDatasourceUrl(process.env, process.argv),
    directUrl: process.env.DIRECT_URL,
  },
})
