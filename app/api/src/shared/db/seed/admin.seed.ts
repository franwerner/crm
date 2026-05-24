import { eq } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { Db } from '@shared/db/client'
import { users } from '@shared/db/schema'

export async function seedAdmin(db: Db): Promise<void> {
  const email = (process.env['SEED_ADMIN_EMAIL'] ?? 'admin@crm.local').toLowerCase().trim()
  const password = process.env['SEED_ADMIN_PASSWORD'] ?? 'admin'
  const name = process.env['SEED_ADMIN_NAME'] ?? 'Admin'

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log(`seed: admin already exists (${email})`)
    return
  }

  const now = new Date()
  await db.insert(users).values({
    id: uuidv7(),
    email,
    name,
    passwordHash: await Bun.password.hash(password),
    createdAt: now,
    updatedAt: now,
  })

  console.log(`seed: admin created (${email})`)
}
