// Les migrations prennent des verrous consultatifs et des instructions de
// session, que PgBouncer en mode transaction supporte mal : elles doivent
// passer par la connexion directe de Neon. Verifie a la source sur Prisma 7.10 :
// declarer directUrl dans prisma.config.ts ne suffit pas, migrate deploy se
// connecte quand meme au host poole de url. C'est donc url qui porte la
// connexion directe, pour les commandes qui en ont besoin.
//
// Le controle vit ici parce que prisma.config.ts est traverse par les 2 chemins
// de migration : le buildCommand du service api en preview, et
// scripts/db-deploy.sh en production.

const MIGRATION_COMMANDS = ["migrate", "push"]

function isMigrationCommand(argv: string[]): boolean {
  return argv.some((argument) => MIGRATION_COMMANDS.includes(argument))
}

export function resolveCliDatasourceUrl(env: Record<string, string | undefined>, argv: string[]): string {
  if (!isMigrationCommand(argv)) {
    // generate ne se connecte a rien : la CI le lance sans aucune variable.
    return env.DATABASE_URL ?? ""
  }

  const directUrl = env.DIRECT_URL
  if (!directUrl) {
    throw new Error(
      "DIRECT_URL is required to run migrations: without it they would go through the pooled connection",
    )
  }
  if (directUrl.includes("-pooler.")) {
    throw new Error("DIRECT_URL points at a -pooler host: migrations require the direct connection")
  }

  return directUrl
}
