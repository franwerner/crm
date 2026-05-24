import { Toaster as Sonner, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'flex items-center gap-3 px-4 py-3 rounded-md border-[1.5px] border-brand bg-background text-foreground text-sm shadow-brutal-md',
          title: 'font-medium',
          description: 'text-muted-foreground',
          actionButton:
            'rounded-full border-[1.5px] border-brand bg-primary text-primary-foreground px-3 py-1 text-xs',
          closeButton: 'border-[1.5px] border-brand',
          success: 'bg-[var(--ds-color-success-50)]',
          warning: 'bg-[var(--ds-color-warning-50)]',
          error: 'bg-[var(--ds-color-danger-50)]',
          info: 'bg-muted',
        },
      }}
      {...props}
    />
  )
}
