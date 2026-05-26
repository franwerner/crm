import { useInfiniteQuery } from '@tanstack/react-query'
import { getUsers } from '@shared/api/clients/getUsers'

const LIMIT = 20

type Params = {
  search?: string
}

export function useUsers({ search }: Params) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['users', { search }],
    queryFn: ({ pageParam }) =>
      getUsers({
        search,
        pagination: { limit: LIMIT, offset: pageParam as number },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)
      return loadedCount < lastPage.total ? loadedCount : undefined
    },
  })

  const users = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  return {
    users,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}
