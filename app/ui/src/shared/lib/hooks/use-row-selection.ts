import { useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

export function useRowSelection() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  function clearSelection() {
    setRowSelection({})
  }

  return { rowSelection, setRowSelection, selectedIds, clearSelection }
}
