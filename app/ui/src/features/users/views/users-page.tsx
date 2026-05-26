import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useUsers } from '@features/users/hooks/use-users'
import { useCreateUser, useUpdateUser, useDeleteUser } from '@features/users/hooks/use-user-mutations'
import { UserCard } from '@features/users/components/user-card'
import { InputSearch } from '@shared/ui/input-search'
import { CreateUserModal } from '@features/users/components/create-user-modal'
import { EditUserModal } from '@features/users/components/edit-user-modal'
import { Button } from '@shared/ui/button'
import { Plus } from 'lucide-react'
import type { UserView } from '@shared/api/types/UserView'
import type { CreateUserFormValues, UpdateUserFormValues } from '@features/users/types/users.types'
import { DeleteDialog } from '@shared/ui/delete-dialog'

export function UsersPage() {
  const { search } = useSearch({ from: '/_authenticated/users' })
  const navigate = useNavigate({ from: '/users' })

  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserView | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserView | null>(null)

  const { users, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useUsers({ search })

  const { createUser, isPending: isCreating, errorMessage: createError } = useCreateUser()
  const { updateUser, isPending: isUpdating, errorMessage: updateError } = useUpdateUser()
  const { deleteUser, isPending: isDeleting } = useDeleteUser()

  function handleSearchChange(value: string) {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
    })
  }

  async function handleCreate(data: CreateUserFormValues) {
    await createUser(data)
  }

  async function handleUpdate(id: string, data: UpdateUserFormValues) {
    await updateUser(id, data)
  }

  async function handleConfirmDelete() {
    if (!deletingUser) return
    try {
      await deleteUser(deletingUser.id)
    } catch {
      toast.error('Error al eliminar el usuario')
    } finally {
      setDeletingUser(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <InputSearch value={search ?? ''} onChange={handleSearchChange} />
        <Button
          variant="default"
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="shrink-0"
        >
          <Plus />
          Crear usuario
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[100px] animate-pulse rounded-lg border-[1.5px] border-brand bg-muted"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No se encontraron usuarios.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={setEditingUser}
              onDelete={setDeletingUser}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      )}

      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isPending={isCreating}
        errorMessage={createError}
      />
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdate}
        isPending={isUpdating}
        errorMessage={updateError}
      />
      <DeleteDialog
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
        title="Eliminar usuario"
        content="¿Eliminar este usuario? Esta acción no se puede deshacer."
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
