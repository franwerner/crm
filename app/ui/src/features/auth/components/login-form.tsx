import { useForm, type Resolver } from 'react-hook-form'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { LoginFormValues } from '@features/auth/auth.types'

type Props = {
  onSubmit: (values: LoginFormValues) => void
  isPending: boolean
  errorMessage: string | null
  resolver: Resolver<LoginFormValues>
}

export function LoginForm({ onSubmit, isPending, errorMessage, resolver }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </div>
    </form>
  )
}
