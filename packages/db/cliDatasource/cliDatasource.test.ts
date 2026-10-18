import { describe, expect, it } from "vitest"
import { resolveCliDatasourceUrl } from "./cliDatasource.js"

const pooledUrl = "postgresql://user:pass@ep-demo-pooler.eu-central-1.aws.neon.tech/neondb"
const localDirectUrl = "postgresql://user:pass@ep-locale.c-6.eu-central-1.aws.neon.tech/neondb"
const testDirectUrl = "postgresql://user:pass@ep-de-test.c-6.eu-central-1.aws.neon.tech/neondb"
const unlistedDirectUrl = "postgresql://user:pass@ep-non-declare.c-6.eu-central-1.aws.neon.tech/neondb"
const productionDirectUrl = "postgresql://user:pass@ep-de-production.c-6.eu-central-1.aws.neon.tech/neondb"

// Les listes blanches sont declarees par l'environnement, pas par le code : les
// endpoints d'un projet n'ont rien a faire dans un depot public. Les 2 listes
// sont cantonnees a dev et test : la preview nait saine d'une production saine,
// donc aucune commande destructrice ne la vise, et la production n'y entre
// jamais.
const disposableHosts = {
  PRISMA_PUSH_ALLOWED_HOSTS: "ep-locale,ep-de-test",
  PRISMA_RESET_ALLOWED_HOSTS: "ep-locale,ep-de-test",
}

describe("l'aide et generate ne se connectent a rien", () => {
  it("utilise DATABASE_URL pour generate", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({ DATABASE_URL: pooledUrl, DIRECT_URL: localDirectUrl }, generateArgv)).toBe(
      pooledUrl,
    )
  })

  // La CI lance prisma generate sans aucune variable de base.
  it("tolere l'absence totale de variables pour generate", () => {
    const generateArgv = ["node", "prisma", "generate"]

    expect(resolveCliDatasourceUrl({}, generateArgv)).toBe("")
  })

  it("tolere l'absence de variables sur --help", () => {
    const helpArgv = ["node", "prisma", "migrate", "diff", "--help"]

    expect(resolveCliDatasourceUrl({}, helpArgv)).toBe("")
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

describe("db push, restreint aux hosts declares", () => {
  it("accepte un host de la liste", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(resolveCliDatasourceUrl({ ...disposableHosts, DIRECT_URL: testDirectUrl }, pushArgv)).toBe(testDirectUrl)
  })

  // db push applique le schema sans rien inscrire dans _prisma_migrations :
  // c'est ce qui a desaligne une base de l'historique des migrations. Une
  // connexion directe valide ne suffit donc pas, le host doit etre declare.
  it("refuse un host hors de sa liste, meme avec une connexion directe valide", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(() => resolveCliDatasourceUrl({ ...disposableHosts, DIRECT_URL: unlistedDirectUrl }, pushArgv)).toThrow(
      /db push/,
    )
  })

  it("refuse quand aucune liste n'est declaree", () => {
    const pushArgv = ["node", "prisma", "db", "push"]

    expect(() => resolveCliDatasourceUrl({ DIRECT_URL: localDirectUrl }, pushArgv)).toThrow(
      /PRISMA_PUSH_ALLOWED_HOSTS/,
    )
  })
})

describe("migrate reset, restreint aux hosts declares", () => {
  it("accepte un host de la liste", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(resolveCliDatasourceUrl({ ...disposableHosts, DIRECT_URL: testDirectUrl }, resetArgv)).toBe(testDirectUrl)
  })

  // Un rempart contre une faute de frappe sur le fichier d'environnement, pas
  // le dernier : ce controle a deja contenu l'endpoint de production sous un
  // mauvais nom (commit 7330824). Le controle reel est la detention des
  // identifiants.
  it("refuse un host hors de sa liste", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(() => resolveCliDatasourceUrl({ ...disposableHosts, DIRECT_URL: productionDirectUrl }, resetArgv)).toThrow(
      /migrate reset/,
    )
  })

  // Liste absente, donc refus : l'environnement de production n'a aucune raison
  // de la porter, et c'est ce qui le protege par construction.
  it("refuse quand aucune liste n'est declaree", () => {
    const resetArgv = ["node", "prisma", "migrate", "reset", "--force"]

    expect(() => resolveCliDatasourceUrl({ DIRECT_URL: testDirectUrl }, resetArgv)).toThrow(
      /PRISMA_RESET_ALLOWED_HOSTS/,
    )
  })
})
