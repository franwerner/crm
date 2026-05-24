import { uuidv7 } from 'uuidv7'
import type { Db } from '@shared/db/client'
import { contacts, users } from '@shared/db/schema'

const CONTACT_COUNT = 100

const firstNames = [
  'Sofía', 'Mateo', 'Valentina', 'Santiago', 'Isabella', 'Benjamín', 'Camila', 'Joaquín',
  'Martina', 'Thiago', 'Lucía', 'Bautista', 'Emma', 'Lautaro', 'Catalina', 'Felipe',
  'Julieta', 'Tomás', 'Renata', 'Agustín', 'Victoria', 'Nicolás', 'Florencia', 'Ignacio',
  'Delfina', 'Lucas', 'Mía', 'Gael', 'Pilar', 'Dylan',
]

const lastNames = [
  'González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez',
  'Sánchez', 'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ruiz', 'Ramírez', 'Flores',
  'Acosta', 'Benítez', 'Medina', 'Suárez', 'Herrera', 'Aguirre', 'Giménez', 'Molina',
  'Silva', 'Castro', 'Rojas', 'Ortiz', 'Núñez', 'Luna',
]

const pipelineStates = ['Contact', 'Lead', 'Customer', 'Discarded'] as const
const sourceChannels = ['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'] as const
const interestLevels = ['Cold', 'Warm', 'Hot'] as const

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function randomPhone(): string {
  const number = Math.floor(10000000 + Math.random() * 89999999)
  return `+54 9 11 ${number}`
}

export async function seedContacts(db: Db): Promise<void> {
  const existing = await db.select({ id: contacts.id }).from(contacts).limit(1)
  if (existing.length > 0) {
    console.log('seed: contacts already exist')
    return
  }

  const [owner] = await db.select({ id: users.id }).from(users).limit(1)
  if (!owner) {
    console.log('seed: no user found, run admin seed first')
    return
  }

  const now = new Date()
  const rows: (typeof contacts.$inferInsert)[] = []

  for (let i = 0; i < CONTACT_COUNT; i++) {
    rows.push({
      id: uuidv7(),
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phone: Math.random() < 0.15 ? null : randomPhone(),
      pipelineState: pick(pipelineStates),
      stateLocked: false,
      sourceChannel: pick(sourceChannels),
      interestLevel: pick(interestLevels),
      createdBy: owner.id,
      createdAt: now,
      updatedAt: now,
    })
  }

  await db.insert(contacts).values(rows)
  console.log(`seed: ${rows.length} contacts created`)
}
