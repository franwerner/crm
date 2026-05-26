import type { Option } from '@shared/lib/types/option'

export function optionsToLabelMap<T extends string>(
  options: ReadonlyArray<Option<T>>,
): Record<T, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<T, string>
}
