import { z } from 'zod/v4'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateContactFormValues } from '@features/contacts/contacts.types'
import { createContactBodySchema } from '@shared/api/schemas/createContactBodySchema'
import { sourceChannelOptions, interestLevelOptions } from '@features/contacts/contacts.options'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseButton,
  DialogDescription,
} from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'

const schema = createContactBodySchema.extend({ name: z.string().min(1, 'El nombre es obligatorio') })

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateContactFormValues) => Promise<void>
  isPending: boolean
  errorMessage: string | null
}

export function CreateContactModal({ open, onOpenChange, onSubmit, isPending, errorMessage }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: null,
      sourceChannel: null,
      interestLevel: null,
    },
  })

  const sourceChannelValue = watch('sourceChannel')
  const interestLevelValue = watch('interestLevel')

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset()
    }
    onOpenChange(nextOpen)
  }

  async function handleFormSubmit(data: CreateContactFormValues) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Nuevo contacto</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Crear un nuevo contacto</DialogDescription>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Nombre completo"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <span className="text-[length:var(--ds-font-size-xs)] text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 11 1234-5678"
                {...register('phone')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sourceChannel">Canal de origen</Label>
              <Select
                value={sourceChannelValue ?? ''}
                onValueChange={(val) => setValue('sourceChannel', val as CreateContactFormValues['sourceChannel'])}
              >
                <SelectTrigger id="sourceChannel" size="default" className="w-full">
                  <SelectValue placeholder="Seleccionar canal…" />
                </SelectTrigger>
                <SelectContent>
                  {sourceChannelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="interestLevel">Nivel de interés</Label>
              <Select
                value={interestLevelValue ?? ''}
                onValueChange={(val) => setValue('interestLevel', val as CreateContactFormValues['interestLevel'])}
              >
                <SelectTrigger id="interestLevel" size="default" className="w-full">
                  <SelectValue placeholder="Seleccionar nivel…" />
                </SelectTrigger>
                <SelectContent>
                  {interestLevelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <p className="text-[length:var(--ds-font-size-sm)] text-destructive">
                {errorMessage}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isPending}
            >
              {isPending ? 'Creando…' : 'Crear contacto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
