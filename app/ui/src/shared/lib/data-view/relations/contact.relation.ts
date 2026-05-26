import { getContacts } from '@shared/api/clients'
import { getContactsQueryKey } from '@shared/api/hooks/useGetContacts'
import type { GetContactsQueryParams } from '@shared/api/types/GetContacts'
import type { RelationResolver } from '@shared/lib/utils/filter'
import { makeRelationResolver, SEARCH_LIMIT } from '../make-relation-resolver'

export const contactRelation: RelationResolver = makeRelationResolver({
  queryKey: (params: GetContactsQueryParams) => getContactsQueryKey(params),
  query: (params: GetContactsQueryParams) => getContacts(params),
  getItems: (data) => data.items,
  toOption: (contact) => ({ value: contact.id, label: contact.name }),
  searchParams: (query) => ({
    search: query || undefined,
    pagination: { limit: SEARCH_LIMIT, offset: 0 },
  }),
  resolveParams: (ids) => ({
    filter: { id: { in: ids } },
    pagination: { limit: ids.length, offset: 0 },
  }),
})
