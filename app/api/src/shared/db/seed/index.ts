import { db } from '@shared/db/client'
import { seedAdmin } from '@shared/db/seed/admin.seed'
import { seedContacts } from '@shared/db/seed/contacts.seed'

async function main(): Promise<void> {
  await seedAdmin(db)
  await seedContacts(db)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
