import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '@shared/config'
import * as schema from '@shared/db/schema'

const queryClient = postgres(config.databaseUrl)

export const db = drizzle(queryClient, { schema })

export type Db = typeof db

// DrizzleTx is the transaction callback argument — reuses the Parameters<> idiom established in the repo.
// Repos that participate in a UnitOfWork accept an optional tx?: DrizzleTx and use it when present.
export type DrizzleTx = Parameters<Parameters<Db['transaction']>[0]>[0]
