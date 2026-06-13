import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { cn } from '@shared/lib/utils/cn'

export type PanelCardProps = {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function PanelCard({ title, action, children, className, contentClassName }: PanelCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-[length:var(--ds-font-size-md)]">{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
