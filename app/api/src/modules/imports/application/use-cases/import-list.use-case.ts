import type { ImportQueries, ImportListItem } from '@modules/imports/application/import.query'
import type { Page, PageParams } from '@shared/types/pagination'

export class ImportListUseCase {
  constructor(private readonly queries: ImportQueries) {}

  async execute(params: PageParams): Promise<Page<ImportListItem>> {
    return this.queries.list(params)
  }
}
