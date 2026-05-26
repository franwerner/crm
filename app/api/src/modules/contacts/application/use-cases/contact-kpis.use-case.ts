import type { ContactQueries, ContactKpisResult } from '@modules/contacts/application/contact.query'

export class ContactKpisUseCase {
  constructor(private readonly queries: ContactQueries) {}

  async execute(): Promise<ContactKpisResult> {
    return this.queries.kpis()
  }
}
