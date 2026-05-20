import type { ContactsRepository } from '../../domain/contact.repository'
import { NotFoundError } from '../../../../shared/errors'

export interface DeleteContactInput {
  id: string
}

export interface DeleteContactDeps {
  repo: ContactsRepository
}

export async function deleteContact(input: DeleteContactInput, deps: DeleteContactDeps): Promise<void> {
  const contact = await deps.repo.findById(input.id)
  if (!contact) {
    throw new NotFoundError(`Contact ${input.id} not found`)
  }

  const deleted = contact.softDelete(new Date())
  await deps.repo.save(deleted)
}
