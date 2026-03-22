import { betterAuth } from 'better-auth'
import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'

const { Pool } = pg

function createKyselyDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  return new Kysely({
    dialect: new PostgresDialect({ pool }),
  })
}

function createAuth() {
  const db = createKyselyDb()

  return betterAuth({
    database: db,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    trustedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7139',
      'http://localhost:7139',
    ],
  })
}

export const auth = createAuth()
export type Auth = typeof auth

