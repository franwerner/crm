export type SortDir = 'asc' | 'desc'

export interface Sort {
  field: string
  dir: SortDir
}
