import { Link } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'
import { Card, CardContent } from '@shared/ui/card'

type SubSection = {
  label: string
  description: string
  to: string
  icon: React.ReactNode
}

const SUB_SECTIONS: SubSection[] = [
  {
    label: 'Templates de análisis',
    description: 'Configurá los templates que se usan para enriquecer contactos con IA.',
    to: '/settings/templates',
    icon: <Settings2 className="size-5 text-muted-foreground" />,
  },
]

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[length:var(--ds-font-size-xl)] font-[var(--ds-font-weight-semibold)] text-foreground">
          Configuración
        </h1>
        <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
          Ajustes del producto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUB_SECTIONS.map((section) => (
          <Link key={section.to} to={section.to}>
            <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex flex-col gap-2 p-5">
                {section.icon}
                <span className="text-[length:var(--ds-font-size-sm)] font-[var(--ds-font-weight-semibold)] text-foreground">
                  {section.label}
                </span>
                <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                  {section.description}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
