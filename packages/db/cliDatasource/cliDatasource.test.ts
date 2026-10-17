import { describe, expect, it } from "vitest"
import { resolveCliDatasourceUrl } from "./cliDatasource.js"

const pooledUrl = "postgresql://user:pass@ep-demo-pooler.eu-central-1.aws.neon.tech/neondb"
const directUrl = "postgresql://user:pass@ep-demo.eu-central-1.aws.neon.tech/neondb"

describe("commandes de migration", () => {
  it("emprunte la connexion directe", () => {
    const migrationArgv = ["node", "prisma", "migrate", "deploy"]

    expect(resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: directUrl }, migrationArgv)).toBe(directUrl)
  })

  it("leve quand DIRECT_URL est absente, au lieu de repartir par le pooler", () => {
    const migrationArgv = ["node", "prisma", "migrate", "deploy"]

    expect(() => resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl }, migrationArgv)).toThrow(/DIRECT_URL/)
  })

  it("leve quand DIRECT_URL designe un host poole", () => {
    const migrationArgv = ["node", "prisma", "migrate", "deploy"]

    expect(() => resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: pooledUrl }, migrationArgv)).toThrow(
      /-pooler/,
    )
  })

  it("couvre aussi db push, qui modifie le schema sans fichier de migration", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(() => resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl }, pushArgv)).toThrow(/DIRECT_URL/)
  })
})

describe("commandes sans migration", () => {
  it("utilise DATABASE_URL pour generate", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: directUrl }, generateArgv)).toBe(pooledUrl)
  })

  // La CI lance prisma generate sans aucune variable de base : exiger
  // DIRECT_URL la casserait, alors que generate ne se connecte a rien.
  it("tolere l'absence totale de variables pour generate", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({}, generateArgv)).toBe("")
  })
})
