import { describe, expect, it } from "vitest"
import { resolveCliDatasourceUrl } from "./cliDatasource.js"

const pooledUrl = "postgresql://user:pass@ep-demo-pooler.eu-central-1.aws.neon.tech/neondb"
const localDirectUrl = "postgresql://user:pass@ep-little-boat-b2sruvec.c-6.eu-central-1.aws.neon.tech/neondb"
const testDirectUrl = "postgresql://user:pass@ep-withered-fire-b2jm9g5v.c-6.eu-central-1.aws.neon.tech/neondb"
const previewDirectUrl = "postgresql://user:pass@ep-sweet-paper-b2d3bg45.c-6.eu-central-1.aws.neon.tech/neondb"
const sharedDirectUrl = previewDirectUrl
const unknownDirectUrl = "postgresql://user:pass@ep-inconnue-b9x7y1z2.c-6.eu-central-1.aws.neon.tech/neondb"

describe("generate, seule commande autorisee sur la connexion poolee", () => {
  it("utilise DATABASE_URL", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: localDirectUrl }, generateArgv)).toBe(
      pooledUrl,
    )
  })

  // La CI lance prisma generate sans aucune variable de base : generate ne se
  // connecte a rien, donc leur absence ne doit pas le casser.
  it("tolere l'absence totale de variables", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({}, generateArgv)).toBe("")
  })
})

describe("toute autre commande exige la connexion directe", () => {
  it("rend DIRECT_URL pour migrate deploy", () => {
    const migrationArgv = ["node", "prisma", "migrate", "deploy"]

    expect(resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: localDirectUrl }, migrationArgv)).toBe(
      localDirectUrl,
    )
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

  // Le defaut est inverse : une commande que ce fichier ne connait pas, dont
  // une commande future touchant au schema, exige la connexion directe au lieu
  // de glisser sur l'URL poolee.
  it("exige la connexion directe pour une commande inconnue", () => {
    const futureArgv = ["node", "prisma", "schema", "reshape"]

    expect(() => resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl }, futureArgv)).toThrow(/DIRECT_URL/)
  })
})

describe("db push, restreint aux bases locale et de test", () => {
  it("accepte la base de developpement local", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(resolveCliDatasourceUrl({ DIRECT_URL: localDirectUrl }, pushArgv)).toBe(localDirectUrl)
  })

  it("accepte la base de test", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(resolveCliDatasourceUrl({ DIRECT_URL: testDirectUrl }, pushArgv)).toBe(testDirectUrl)
  })

  // db push applique le schema sans rien inscrire dans _prisma_migrations :
  // c'est ce qui a desaligne la base de preview de l'historique des migrations.
  it("refuse une base partagee, meme avec une connexion directe valide", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(() => resolveCliDatasourceUrl({ DIRECT_URL: sharedDirectUrl }, pushArgv)).toThrow(/db push/)
  })
})

describe("migrate reset, restreint aux bases jetables", () => {
  it("accepte la base de test", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(resolveCliDatasourceUrl({ DIRECT_URL: testDirectUrl }, resetArgv)).toBe(testDirectUrl)
  })

  it("accepte la base de preview, qui est jetable", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(resolveCliDatasourceUrl({ DIRECT_URL: previewDirectUrl }, resetArgv)).toBe(previewDirectUrl)
  })

  // Le seul rempart contre une faute de frappe sur le fichier d'environnement :
  // migrate reset detruit tout, et aucune base hors de la liste blanche n'a a
  // le subir.
  it("refuse une base qui n'est pas declaree jetable", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(() => resolveCliDatasourceUrl({ DIRECT_URL: unknownDirectUrl }, resetArgv)).toThrow(/migrate reset/)
  })
})
