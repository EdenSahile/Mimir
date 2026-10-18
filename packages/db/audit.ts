import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

// Mesure en LECTURE SEULE de l'etat d'une base, destinee a etre lancee par
// l'utilisateur sur la production et transmise telle quelle : la sortie ne
// contient ni identifiant, ni chaine de connexion, ni donnee personnelle, juste
// un host, des comptages et l'historique des migrations.

type MigrationRow = {
  migration_name: string
  finished_at: Date | null
  rolled_back_at: Date | null
  applied_steps_count: number
}

// Une lecture marche aussi bien par la connexion poolee que par la directe :
// accepter les 2 evite d'exiger DATABASE_URL pour une simple mesure. Le client
// est construit ici plutot qu'importe de ./index, qui impose DATABASE_URL a
// l'application et doit le rester.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  console.error("DATABASE_URL ou DIRECT_URL est requise pour mesurer une base")
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

async function main() {
  const host = new URL(connectionString).host

  const [users, sessions, accounts, documents, conversations, messages, memories] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.account.count(),
    prisma.document.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.memory.count(),
  ])

  const appliedMigrations = await prisma.$queryRaw<MigrationRow[]>`
    SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
    FROM _prisma_migrations
    ORDER BY started_at
  `

  console.log(`host                ${host}`)
  console.log(`User                ${users}`)
  console.log(`Session             ${sessions}`)
  console.log(`Account             ${accounts}`)
  console.log(`Document            ${documents}`)
  console.log(`Conversation        ${conversations}`)
  console.log(`Message             ${messages}`)
  console.log(`Memory              ${memories}`)
  console.log(`_prisma_migrations  ${appliedMigrations.length} ligne(s)`)

  for (const migration of appliedMigrations) {
    const state = migration.rolled_back_at
      ? "ANNULEE"
      : migration.finished_at
        ? `appliquee (${migration.applied_steps_count} etape(s))`
        : "EN ECHEC, non terminee"
    console.log(`  ${migration.migration_name}  ${state}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
