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

// Les 2 commandes qui modifient ou detruisent un schema sont restreintes par
// liste blanche de hosts. Les listes sont declarees par l'environnement et non
// par le code : un endpoint est la moitie d'une chaine de connexion, et ce
// depot est public.
//
// db push applique le schema sans rien inscrire dans _prisma_migrations : la
// base se retrouve desalignee de l'historique des migrations, et le
// migrate deploy suivant echoue en P3018 sur un objet deja existant. C'est
// arrive sur la base de preview, qui est donc hors de cette liste tout en
// restant dans celle du reset : le reset y est le moyen de rendre l'historique
// vrai, la ou db push ne ferait que l'ecarter davantage.
//
// migrate reset detruit toutes les donnees : c'est le dernier rempart contre
// une faute de frappe sur un fichier d'environnement.
//
// Liste absente vaut refus. C'est ce qui protege la production par
// construction : son environnement n'a aucune raison de porter ces variables.
const PUSH_ALLOWED_HOSTS_VARIABLE = "PRISMA_PUSH_ALLOWED_HOSTS"
const RESET_ALLOWED_HOSTS_VARIABLE = "PRISMA_RESET_ALLOWED_HOSTS"

function assertHostAllowed(
  env: Record<string, string | undefined>,
  variableName: string,
  host: string,
  commandName: string,
): void {
  const declaredHosts = (env[variableName] ?? "")
    .split(",")
    .map((declaredHost) => declaredHost.trim())
    .filter((declaredHost) => declaredHost.length > 0)

  if (declaredHosts.length === 0) {
    throw new Error(`${commandName} requires ${variableName} to declare which databases may be targeted`)
  }
  if (!declaredHosts.some((declaredHost) => host.startsWith(declaredHost))) {
    throw new Error(`${commandName} is not allowed on ${host}: it is not listed in ${variableName}`)
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ""
  }
}

export function resolveCliDatasourceUrl(env: Record<string, string | undefined>, argv: string[]): string {
  const connectsToNothing =
    argv.some((argument) => POOLED_CONNECTION_COMMANDS.includes(argument)) ||
    argv.includes("--help") ||
    argv.includes("-h")
  if (connectsToNothing) {
    return env.DATABASE_URL ?? ""
  }

  const directUrl = env.DIRECT_URL
  if (!directUrl) {
    throw new Error("DIRECT_URL is required: without it this command would go through the pooled connection")
  }
  if (directUrl.includes("-pooler.")) {
    throw new Error("DIRECT_URL points at a -pooler host: this command requires the direct connection")
  }

  const host = hostOf(directUrl)

  if (argv.includes("push")) {
    assertHostAllowed(env, PUSH_ALLOWED_HOSTS_VARIABLE, host, "db push")
  }

  if (argv.includes("reset")) {
    assertHostAllowed(env, RESET_ALLOWED_HOSTS_VARIABLE, host, "migrate reset")
  }

  return directUrl
}
