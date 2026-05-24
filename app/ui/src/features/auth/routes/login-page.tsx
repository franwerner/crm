import { useNavigate } from '@tanstack/react-router'
import { useLogin, loginFormResolver } from '@features/auth/hooks/use-login'
import { LoginForm } from '@features/auth/components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import type { LoginFormValues } from '@features/auth/auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isPending, errorMessage } = useLogin()

  async function handleSubmit(values: LoginFormValues) {
    await login(values)
    await navigate({ to: '/contacts' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CRM</CardTitle>
          <CardDescription>Iniciá sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSubmit={handleSubmit}
            isPending={isPending}
            errorMessage={errorMessage}
            resolver={loginFormResolver}
          />
        </CardContent>
      </Card>
    </div>
  )
}
