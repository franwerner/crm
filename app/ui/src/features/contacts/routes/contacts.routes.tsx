import { createRoute, notFound } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { filterGroupsSchema } from '@shared/lib/utils/filter'
import { toSortFields } from '@shared/lib/data-view'
import { getContactsIdQueryOptions } from '@shared/api/hooks/useGetContactsId'
import { contactsDescriptor } from '@features/contacts/components/contacts.descriptor'
import { CONTACT_TABS } from '@features/contacts/constants/contact-detail-tabs'
import { ContactsPage } from '../views/contacts-page'
import { ContactDetailPage } from '../views/contact-detail-page'

const contactsSortDirEnum = z.enum(['asc', 'desc'])
const contactsSortFieldEnum = z.enum(
  toSortFields(contactsDescriptor) as [string, ...string[]],
)

export const contactsSearchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional(),
  filterGroups: filterGroupsSchema,
  sortField: contactsSortFieldEnum.optional().default('updatedAt'),
  sortDir: contactsSortDirEnum.optional().default('desc'),
})

export function createContactsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  const contactsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/contacts',
    validateSearch: contactsSearchSchema,
    staticData: { breadcrumb: [{ label: 'Contactos' }] },
    component: ContactsPage,
  })

  const contactDetailSearchSchema = z.object({
    tab: z.enum(CONTACT_TABS).optional().default('overview'),
  })

  const contactDetailRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/contacts/$id',
    validateSearch: contactDetailSearchSchema,
    staticData: { breadcrumb: [{ label: 'Contactos', to: '/contacts' }, { label: 'Detalle de contacto' }] },
    loader: async ({ context, params }) => {
      try {
        await context.queryClient.ensureQueryData(getContactsIdQueryOptions(params.id))
      } catch {
        throw notFound()
      }
    },
    notFoundComponent: () => (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <span className="text-foreground text-[length:var(--ds-font-size-md)]">Contacto no encontrado</span>
        <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">El contacto solicitado no existe.</span>
      </div>
    ),
    component: ContactDetailPage,
  })

  return [contactsRoute, contactDetailRoute] as const
}
