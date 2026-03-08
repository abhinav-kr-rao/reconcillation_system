

const user=process.env.NEON_USER
const password=process.env.NEON_PASSWORD
const endpoint=process.env.NEON_ENDPOINT
const region=process.env.NEON_REGION
const dbname=process.env.NEON_DB_NAME


//Pooled connection for your application
export const DATABASE_URL=`postgresql://${user}:${password}@${endpoint}-pooler.${region}.aws.neon.tech/${dbname}?sslmode=require`

//Direct connection for Prisma CLI
export const DIRECT_URL=`postgresql://${user}:${password}@${endpoint}.${region}.aws.neon.tech/${dbname}?sslmode=require`