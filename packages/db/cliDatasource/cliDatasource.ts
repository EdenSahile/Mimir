// Quelle connexion le CLI Prisma emprunte, et sur quelle base il a le droit de
// passer. Ce fichier est traverse par les 2 chemins de migration : le
// buildCommand du service api en preview, et scripts/db-deploy.sh.
//
// Les migrations prennent des verrous consultatifs et des instructions de
// session, que PgBouncer en mode transaction supporte mal : elles doivent
// passer par la connexion directe de Neon. Verifie a la source sur Prisma 7.10 :
// declarer directUrl dans prisma.config.ts ne suffit pas, migrate deploy se
// connecte quand meme au host poole de url. C'est donc url qui porte la
// connexion directe.

// Le defaut est l'exigence de la connexion directe. Seules les commandes
// listees ici s'en passent, parce qu'elles ne se connectent a rien : une
// commande future touchant au schema tombe donc du bon cote sans qu'on ait
// pense a elle.
const POOLED_CONNECTION_COMMANDS = ["generate"]

// db push applique le schema sans rien inscrire dans _prisma_migrations : la
// base se retrouve desalignee de l'historique des migrations, et le
// migrate deploy suivant echoue en P3018 sur un objet deja existant. C'est
// arrive sur la base de preview. La commande reste donc cantonnee aux bases
// dont personne d'autre ne depend.
const PUSH_ALLOWED_HOSTS = ["ep-little-boat-b2sruvec", "ep-withered-fire-b2jm9g5v"]

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ""
  }
}

export function resolveCliDatasourceUrl(env: Record<string, string | undefined>, argv: string[]): string {
  if (argv.some((argument) => POOLED_CONNECTION_COMMANDS.includes(argument))) {
    return env.DATABASE_URL ?? ""
  }

  const directUrl = env.DIRECT_URL
  if (!directUrl) {
    throw new Error("DIRECT_URL is required: without it this command would go through the pooled connection")
  }
  if (directUrl.includes("-pooler.")) {
    throw new Error("DIRECT_URL points at a -pooler host: this command requires the direct connection")
  }

  if (argv.includes("push")) {
    const host = hostOf(directUrl)
    const isAllowed = PUSH_ALLOWED_HOSTS.some((allowedHost) => host.startsWith(allowedHost))
    if (!isAllowed) {
      throw new Error(
        `db push is only allowed on the local and test databases, not on ${host}: use a migration instead`,
      )
    }
  }

  return directUrl
}
