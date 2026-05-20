import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '@shared/config'
import * as schema from '@shared/db/schema'

const queryClient = postgres(config.databaseUrl)

export const db = drizzle(queryClient, { schema })

export type Db = typeof db
