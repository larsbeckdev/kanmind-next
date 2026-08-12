"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

import {
  getColumnsServerSnapshot,
  getColumnsSnapshot,
  resetColumns,
  setColumns,
  subscribeToColumns,
} from "@/lib/board-columns"
import type { ColumnPreference } from "@/lib/board-columns"
import type { WorkflowStatus } from "@/lib/api/types"

export type BoardColumnsApi = {
  columns: ColumnPreference[]
  visibleColumns: ColumnPreference[]
  rename: (status: WorkflowStatus, title: string) => void
  setHidden: (status: WorkflowStatus, isHidden: boolean) => void
  reorder: (fromStatus: WorkflowStatus, toStatus: WorkflowStatus) => void
  reset: () => void
}

export function useBoardColumns(boardId: number): BoardColumnsApi {
  const getSnapshot = useCallback(() => getColumnsSnapshot(boardId), [boardId])
  const columns = useSyncExternalStore(
    subscribeToColumns,
    getSnapshot,
    getColumnsServerSnapshot
  )

  const visibleColumns = useMemo(
    () => columns.filter((column) => !column.isHidden),
    [columns]
  )

  const rename = useCallback(
    (status: WorkflowStatus, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) {
        return
      }
      setColumns(
        boardId,
        columns.map((column) =>
          column.status === status ? { ...column, title: trimmed } : column
        )
      )
    },
    [boardId, columns]
  )

  const setHidden = useCallback(
    (status: WorkflowStatus, isHidden: boolean) => {
      // Done is where a ticket ends up and the only column archiving starts
      // from, so it stays. The last visible column stays as well, otherwise
      // there would be nothing left to drop a card onto.
      if (isHidden && status === "done") {
        return
      }
      if (isHidden && columns.filter((column) => !column.isHidden).length <= 1) {
        return
      }
      setColumns(
        boardId,
        columns.map((column) =>
          column.status === status ? { ...column, isHidden } : column
        )
      )
    },
    [boardId, columns]
  )

  const reorder = useCallback(
    (fromStatus: WorkflowStatus, toStatus: WorkflowStatus) => {
      const fromIndex = columns.findIndex((column) => column.status === fromStatus)
      const toIndex = columns.findIndex((column) => column.status === toStatus)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return
      }
      const next = [...columns]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      setColumns(boardId, next)
    },
    [boardId, columns]
  )

  const reset = useCallback(() => resetColumns(boardId), [boardId])

  return { columns, visibleColumns, rename, setHidden, reorder, reset }
}
