import { prisma } from "./index"

async function main() {
  const [{ result }] = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`

  console.log(`DB connection OK, SELECT 1 returned ${result}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
