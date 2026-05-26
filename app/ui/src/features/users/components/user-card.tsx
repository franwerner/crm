import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu'
import { formatDate } from '@shared/lib/utils/date'
import { Avatar } from '@shared/ui/avatar'
import type { UserView } from '@shared/api/types/UserView'

type Props = {
  user: UserView
  onEdit: (user: UserView) => void
  onDelete: (user: UserView) => void
}

export function UserCard({ user, onEdit, onDelete }: Props) {
  return (
    <Card className="relative flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[length:var(--ds-font-size-sm)] font-[var(--ds-font-weight-semibold)] text-foreground">
              {user.name}
            </span>
            <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(user)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(user)}>
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-0">
        <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
          Creado {formatDate(user.createdAt)}
        </span>
      </CardContent>
    </Card>
  )
}
