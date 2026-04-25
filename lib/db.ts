import postgres from 'postgres'

let db: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (!db) {
    db = postgres(process.env.DATABASE_URL ?? '', {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }
  return db
}

// Create a fresh db instance per call — avoids singleton async issues
export function getDbFresh() {
  return postgres(process.env.DATABASE_URL ?? '', {
    max: 5,
    idle_timeout: 10,
    connect_timeout: 5,
  })
}

export type Database = typeof getDb extends postgres.Sql ? ReturnType<typeof postgres> : never
