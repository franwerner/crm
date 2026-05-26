import type { ControllerFieldState } from 'react-hook-form'
import type { Option } from '@shared/lib/types/option'
import type { RelationResolver } from '@shared/lib/utils/filter'
import type React from 'react'
import type { ReactNode } from 'react'

export type FormWidget = 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'date' | 'datetime' | 'relation'

export type FormFieldDescriptor<T, K extends keyof T = keyof T> = {
  key: K
  label: string
  widget: FormWidget
  placeholder?: string
  required?: boolean
  extra?: string | ((values: Partial<T>) => ReactNode)
  options?: ReadonlyArray<Option>
  relation?: RelationResolver
  visible?: (values: Partial<T>) => boolean
  badgeVariants?: Record<string, string | null | undefined>
}

export type AnyFormFieldDescriptor<T> = { [K in keyof T]: FormFieldDescriptor<T, K> }[keyof T]

export type FieldDef<T> = {
  key: keyof T
  label: string
  widget: FormWidget
  placeholder?: string
  extra?: string | ((values: Partial<T>) => ReactNode)
  options?: ReadonlyArray<Option>
  relation?: RelationResolver
  visible?: (values: Partial<T>) => boolean
  badgeVariants?: Record<string, string | null | undefined>
}

export function toFieldDef<T>(raw: AnyFormFieldDescriptor<T>): FieldDef<T> {
  return {
    key: raw.key,
    label: raw.label,
    widget: raw.widget,
    placeholder: raw.placeholder,
    extra: raw.extra,
    options: raw.options,
    relation: raw.relation,
    visible: raw.visible,
    badgeVariants: raw.badgeVariants,
  }
}

export type FieldSlotBindings = {
  value: unknown
  onChange: (...event: unknown[]) => void
  onBlur: () => void
  name: string
}

export type FieldSlot<T> = (args: {
  field: FieldSlotBindings
  fieldState: ControllerFieldState
  descriptor: AnyFormFieldDescriptor<T>
}) => React.ReactNode

export type FormDescriptor<T> = {
  name: string
  fields: ReadonlyArray<AnyFormFieldDescriptor<T>>
}
