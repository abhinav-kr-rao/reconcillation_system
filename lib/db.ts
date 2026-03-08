import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { DATABASE_URL } from './config'

const adapter = new PrismaNeon({
  connectionString: DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter })