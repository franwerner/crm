import type { StatesStateEnum2Key } from '@shared/api/types/ProjectKpisResponse'

export type ProjectKpiItem = {
  state: StatesStateEnum2Key
  value: number
  trend: { direction: 'up' | 'down' | 'neutral'; value: string }
}

export type ProjectKpisTotal = {
  count: number
  trend: { direction: 'up' | 'down' | 'neutral'; value: string }
}
