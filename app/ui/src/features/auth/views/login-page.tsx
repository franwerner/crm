import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLogin, loginFormResolver } from '@features/auth/hooks/use-login'
import { LoginForm } from '@features/auth/components/login-form'
import { Logo } from '@shared/ui/logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import type { LoginFormValues } from '@features/auth/auth.types'

const GRID_MASK = 'radial-gradient(ellipse at center, black 35%, transparent 80%)'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isPending, errorMessage } = useLogin()
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scanRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const anim = el.animate(
      [
        { transform: 'translateY(0)', opacity: 0 },
        { transform: 'translateY(10vh)', opacity: 1, offset: 0.1 },
        { transform: 'translateY(90vh)', opacity: 1, offset: 0.9 },
        { transform: 'translateY(100vh)', opacity: 0 },
      ],
      { duration: 900, easing: 'ease-in-out' },
    )
    return () => anim.cancel()
  }, [])

  async function handleSubmit(values: LoginFormValues) {
    await login(values)
    await navigate({ to: '/contacts' })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--ds-color-neutral-200) 1px, transparent 1px), linear-gradient(to bottom, var(--ds-color-neutral-200) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: GRID_MASK,
          WebkitMaskImage: GRID_MASK,
        }}
      />

      <div
        ref={scanRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 opacity-0"
        style={{
          background:
            'linear-gradient(to right, transparent, var(--ds-color-primary-400) 35%, var(--ds-color-primary-400) 65%, transparent)',
          boxShadow: '0 0 14px 2px color-mix(in srgb, var(--ds-color-primary-400) 60%, transparent)',
        }}
      />

      <Card className="relative z-10 w-full max-w-md shadow-brutal-lg">
        <CardHeader className="gap-4 space-y-0">
          <Logo />
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresá tus credenciales para continuar</CardDescription>
          </div>
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

      <span className="pointer-events-none absolute bottom-5 right-10 z-10 font-mono text-[10px] tracking-wider text-muted-foreground">
        Freshup Labs · v{__APP_VERSION__}
      </span>
    </div>
  )
}
