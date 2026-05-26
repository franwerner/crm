import React from 'react'
import { useForm, Controller, type FieldValues, type DefaultValues, type Path, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import type { FormDescriptor, AnyFormFieldDescriptor, FieldSlot } from '@shared/lib/form-view/types'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Textarea } from '@shared/ui/textarea'
import { Switch } from '@shared/ui/switch'
import { FormField } from '@shared/ui/form-field'
import { DatePicker } from '@shared/ui/date-picker'
import { DateTimePicker } from '@shared/ui/datetime-picker'
import { RelationCombobox } from '@shared/ui/relation-combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'

type Props<T extends FieldValues> = {
  descriptor: FormDescriptor<T>
  schema: ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void | Promise<void>
  onCancel?: () => void
  submitLabel: string
  pendingLabel?: string
  cancelLabel?: string
  isPending?: boolean
  errorMessage?: string | null
  fieldSlots?: Partial<Record<keyof T, FieldSlot<T>>>
}

const relationTrigger =
  'flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-left'

export function EntityForm<T extends FieldValues>({
  descriptor,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  pendingLabel = 'Guardando…',
  cancelLabel = 'Cancelar',
  isPending = false,
  errorMessage,
  fieldSlots,
}: Props<T>) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    defaultValues,
  })

  const allValues = watch()

  function renderControl(field: AnyFormFieldDescriptor<T>) {
    const name = field.key as Path<T>
    const id = String(field.key)
    const value = watch(name)
    const set = (next: unknown) => setValue(name, next as never, { shouldValidate: true })

    switch (field.widget) {
      case 'number':
        return <Input id={id} type="number" placeholder={field.placeholder} {...register(name, { valueAsNumber: true })} />
      case 'textarea':
        return <Textarea id={id} placeholder={field.placeholder} {...register(name)} />

      case 'select':
        return (
          <Select value={(value as string) ?? ''} onValueChange={set}>
            <SelectTrigger id={id} size="default" className="w-full">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'switch':
        return <Switch checked={Boolean(value)} onCheckedChange={set} />
      case 'date':
        return <DatePicker mode="single" value={(value as string) ?? undefined} onValueChange={set} />
      case 'datetime':
        return <DateTimePicker value={(value as string) ?? undefined} onValueChange={set} />

      case 'relation':
        return field.relation ? (
          <RelationCombobox
            multiple={false}
            value={value ? [value as string] : []}
            onChange={(ids) => set(ids[0])}
            search={field.relation.search}
            resolve={field.relation.resolve}
            className={relationTrigger}
            placeholder={field.placeholder}
          />
        ) : null
      default:
        return <Input id={id} placeholder={field.placeholder} {...register(name)} />
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<T>)} className="flex flex-col gap-4">
      {descriptor.fields.map((field) => {
        if (field.visible && !field.visible(allValues as Partial<T>)) return null
        const id = String(field.key)
        const slot = fieldSlots?.[field.key as keyof T]
        if (slot) {
          return (
            <Controller
              key={id}
              name={field.key as Path<T>}
              control={control}
              render={({ field: controllerField, fieldState }) =>
                slot({
                  field: {
                    value: controllerField.value,
                    onChange: controllerField.onChange,
                    onBlur: controllerField.onBlur,
                    name: controllerField.name,
                  },
                  fieldState,
                  descriptor: field,
                }) as React.ReactElement
              }
            />
          )
        }
        const error = errors[field.key]?.message as string | undefined
        const extra = typeof field.extra === 'function' ? field.extra(allValues as Partial<T>) : field.extra
        return (
          <FormField
            key={id}
            label={field.label}
            required={field.required}
            extra={extra}
            error={error}
            htmlFor={id}
          >
            {renderControl(field)}
          </FormField>
        )
      })}

      {errorMessage && (
        <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{errorMessage}</p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" variant="default" size="sm" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
