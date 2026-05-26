import { uuidv7 } from 'uuidv7'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels, contactAssignments, events, stateChanges, users } from '@shared/db/schema'

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

const companyNames = [
  'Distribuidora Sur', 'Constructora Norte', 'Tech Solutions', 'Importadora del Plata',
  'Agencia Digital', 'Logística Central', 'Consultora Andina', 'Servicios Integrales SA',
  'Grupo Comercial', 'Inversiones del Este',
]

const streets = [
  'Av. Corrientes', 'Av. Santa Fe', 'Calle Florida', 'Av. Rivadavia', 'San Martín',
  'Belgrano', 'Bartolomé Mitre', 'Av. Cabildo', 'Av. de Mayo', 'Lavalle',
]

const locations = [
  { city: 'Buenos Aires', province: 'CABA' },
  { city: 'Córdoba', province: 'Córdoba' },
  { city: 'Rosario', province: 'Santa Fe' },
  { city: 'Mendoza', province: 'Mendoza' },
  { city: 'La Plata', province: 'Buenos Aires' },
  { city: 'Mar del Plata', province: 'Buenos Aires' },
  { city: 'San Miguel de Tucumán', province: 'Tucumán' },
  { city: 'Salta', province: 'Salta' },
]

const tagsPool = ['vip', 'mayorista', 'minorista', 'frecuente', 'nuevo', 'potencial', 'corporativo', 'referido']

const notesPool = [
  'Pidió cotización por catálogo completo.',
  'Contactar después de las 18hs.',
  'Cliente recurrente, buen historial de pago.',
  'Interesado en la línea premium.',
  'Derivado por un cliente actual.',
  'Pendiente de enviar propuesta.',
]

const pipelineStates = ['Contact', 'Lead', 'AtRisk', 'Customer', 'Discarded'] as const
const sourceChannels = ['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'] as const
const interestLevels = ['Cold', 'Warm', 'Hot'] as const
const sexValues = ['Male', 'Female', 'Other', 'Unspecified'] as const
const secondaryChannelTypes = ['Email', 'WhatsApp', 'Instagram', 'Website'] as const

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function pickSome<T>(items: readonly T[], max: number): T[] {
  const count = Math.floor(Math.random() * (max + 1))
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)
}

function randomPhone(): string {
  const number = Math.floor(10000000 + Math.random() * 89999999)
  return `+54 9 11 ${number}`
}

function randomPostalCode(): string {
  const letter = pick(['C', 'X', 'B', 'M', 'S', 'T'] as const)
  return `${letter}${Math.floor(1000 + Math.random() * 8999)}`
}

function secondaryChannelValue(type: (typeof secondaryChannelTypes)[number], name: string): string {
  const slug = slugify(name)
  switch (type) {
    case 'Email':
      return `${slug}@example.com`
    case 'WhatsApp':
      return randomPhone()
    case 'Instagram':
      return `@${slug}`
    case 'Website':
      return `https://${slug}.com`
  }
}

export async function seedContacts(db: Db): Promise<void> {
  const allUsers = await db.select({ id: users.id }).from(users)
  const [owner] = allUsers
  if (!owner) {
    console.log('seed: no user found, run admin seed first')
    return
  }

  await db.delete(stateChanges)
  await db.delete(events)
  await db.delete(contactChannels)
  await db.delete(contactAssignments)
  await db.delete(contacts)

  const now = new Date()
  const contactRows: (typeof contacts.$inferInsert)[] = []
  const channelRows: (typeof contactChannels.$inferInsert)[] = []
  const assignmentRows: (typeof contactAssignments.$inferInsert)[] = []

  for (let i = 0; i < CONTACT_COUNT; i++) {
    const isCompany = Math.random() < 0.2
    const contactId = uuidv7()
    const name = isCompany ? pick(companyNames) : `${pick(firstNames)} ${pick(lastNames)}`
    const hasAddress = Math.random() < 0.6
    const loc = pick(locations)

    contactRows.push({
      id: contactId,
      name,
      contactType: isCompany ? 'Company' : 'Person',
      sex: isCompany ? null : pick(sexValues),
      addressStreet: hasAddress ? pick(streets) : null,
      addressNumber: hasAddress ? String(Math.floor(100 + Math.random() * 8900)) : null,
      addressPostalCode: hasAddress ? randomPostalCode() : null,
      addressCity: hasAddress ? loc.city : null,
      addressProvince: hasAddress ? loc.province : null,
      addressCountry: hasAddress ? 'Argentina' : null,
      tags: pickSome(tagsPool, 3),
      notes: Math.random() < 0.3 ? pick(notesPool) : null,
      pipelineState: pick(pipelineStates),
      sourceChannel: pick(sourceChannels),
      interestLevel: pick(interestLevels),
      createdBy: owner.id,
      createdAt: now,
      updatedAt: now,
    })

    channelRows.push({
      id: uuidv7(),
      contactId,
      channelType: 'Phone',
      value: randomPhone(),
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    })

    if (Math.random() < 0.6) {
      const type = pick(secondaryChannelTypes)
      channelRows.push({
        id: uuidv7(),
        contactId,
        channelType: type,
        value: secondaryChannelValue(type, name),
        isPrimary: false,
        createdAt: now,
        updatedAt: now,
      })
    }

    if (Math.random() < 0.7) {
      const assignedUserIds = new Set<string>()
      assignedUserIds.add(owner.id)
      assignmentRows.push({
        id: uuidv7(),
        contactId,
        userId: owner.id,
        role: 'Owner',
        assignedBy: owner.id,
        assignedAt: now,
        createdAt: now,
        updatedAt: now,
      })

      const collaboratorCount = Math.floor(Math.random() * 3)
      for (let j = 0; j < collaboratorCount; j++) {
        const candidate = pick(allUsers)
        if (assignedUserIds.has(candidate.id)) continue
        assignedUserIds.add(candidate.id)
        assignmentRows.push({
          id: uuidv7(),
          contactId,
          userId: candidate.id,
          role: 'Collaborator',
          assignedBy: owner.id,
          assignedAt: now,
          createdAt: now,
          updatedAt: now,
        })
      }
    }
  }

  await db.insert(contacts).values(contactRows)
  await db.insert(contactChannels).values(channelRows)
  if (assignmentRows.length > 0) {
    await db.insert(contactAssignments).values(assignmentRows)
  }
  console.log(
    `seed: ${contactRows.length} contacts, ${channelRows.length} channels, ${assignmentRows.length} assignments created`,
  )
}
