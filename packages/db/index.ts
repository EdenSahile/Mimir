import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaNeon({ connectionString })
export const prisma = new PrismaClient({ adapter })

export { PrismaClient } from "@prisma/client"
export type * from "@prisma/client"
