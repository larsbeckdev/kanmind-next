import { WORKFLOW_STATUSES, workflowStatusSchema } from "@/lib/api/types"
import type { WorkflowStatus } from "@/lib/api/types"
import { STATUS_META } from "@/lib/task-meta"

/**
 * The API models a column as the fixed `status` enum of a task - there is no
 * list entity and no ordering field. Titles, order and visibility of the four
 * workflow columns are therefore a per-board display preference of this
 * client and live in localStorage. Moving a card still writes the real
 * status, so a board looks the same to every member no matter how they
 * arranged their columns.
 *
 * Archive and trash are not part of this: they are always present, always in
 * the same place and are handled separately by the board.
 */
export type ColumnPreference = {
  status: WorkflowStatus
  title: string
  isHidden: boolean
}

const STORAGE_PREFIX = "kanmind.columns."
const COLUMNS_CHANGED_EVENT = "kanmind:columns-changed"

export const DEFAULT_COLUMNS: readonly ColumnPreference[] = WORKFLOW_STATUSES.map(
  (status) => ({ status, title: STATUS_META[status].label, isHidden: false })
)

function isColumnPreference(value: unknown): value is ColumnPreference {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    workflowStatusSchema.safeParse(candidate.status).success &&
    typeof candidate.title === "string" &&
    typeof candidate.isHidden === "boolean"
  )
}

/**
 * Keeps the stored order but re-appends any status the stored preference does
 * not know, so a column can never disappear because of an old entry.
 */
function mergeWithDefaults(stored: ColumnPreference[]): ColumnPreference[] {
  const known = new Set(stored.map((column) => column.status))
  const missing = DEFAULT_COLUMNS.filter((column) => !known.has(column.status))
  return [...stored, ...missing]
}

function readFromStorage(boardId: number): ColumnPreference[] {
  if (typeof window === "undefined") {
    return [...DEFAULT_COLUMNS]
  }
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${boardId}`)
  if (!raw) {
    return [...DEFAULT_COLUMNS]
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_COLUMNS]
    }
    const valid = parsed.filter(isColumnPreference)
    return valid.length > 0 ? mergeWithDefaults(valid) : [...DEFAULT_COLUMNS]
  } catch {
    return [...DEFAULT_COLUMNS]
  }
}

const listeners = new Set<() => void>()
const cache = new Map<number, ColumnPreference[]>()

const SERVER_SNAPSHOT: ColumnPreference[] = [...DEFAULT_COLUMNS]

export function getColumnsSnapshot(boardId: number): ColumnPreference[] {
  const cached = cache.get(boardId)
  if (cached) {
    return cached
  }
  const columns = readFromStorage(boardId)
  cache.set(boardId, columns)
  return columns
}

export function getColumnsServerSnapshot(): ColumnPreference[] {
  return SERVER_SNAPSHOT
}

export function setColumns(boardId: number, columns: ColumnPreference[]): void {
  cache.set(boardId, columns)
  window.localStorage.setItem(
    `${STORAGE_PREFIX}${boardId}`,
    JSON.stringify(columns)
  )
  window.dispatchEvent(new Event(COLUMNS_CHANGED_EVENT))
}

export function resetColumns(boardId: number): void {
  cache.delete(boardId)
  window.localStorage.removeItem(`${STORAGE_PREFIX}${boardId}`)
  window.dispatchEvent(new Event(COLUMNS_CHANGED_EVENT))
}

export function subscribeToColumns(onChange: () => void): () => void {
  listeners.add(onChange)
  const handleExternalChange = () => {
    cache.clear()
    onChange()
  }
  window.addEventListener(COLUMNS_CHANGED_EVENT, onChange)
  window.addEventListener("storage", handleExternalChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener(COLUMNS_CHANGED_EVENT, onChange)
    window.removeEventListener("storage", handleExternalChange)
  }
}
