import { db } from '@shared/db/client'
import { seedAdmin } from '@shared/db/seed/admin.seed'

async function main(): Promise<void> {
  await seedAdmin(db)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
