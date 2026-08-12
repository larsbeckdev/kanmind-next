"use client"

import { useBoard, useBoards } from "@/hooks/use-boards"
import { findBoardBySlug } from "@/lib/slug"
import type { BoardDetail } from "@/lib/api/types"

type BoardBySlug = {
  board: BoardDetail | undefined
  boardId: number | null
  isPending: boolean
  isUnknownSlug: boolean
  error: unknown
}

/**
 * The URL carries the board title, not its id. The API has no lookup by slug,
 * so the board list resolves it first - the same query the overview uses,
 * which means it usually answers straight from the cache.
 */
export function useBoardBySlug(slug: string): BoardBySlug {
  const boards = useBoards()
  const match = boards.data
    ? findBoardBySlug(boards.data, decodeURIComponent(slug))
    : null
  const detail = useBoard(match?.id ?? Number.NaN)

  return {
    board: detail.data,
    boardId: match?.id ?? null,
    isPending: boards.isPending || (match !== null && detail.isPending),
    isUnknownSlug: !boards.isPending && !boards.error && match === null,
    error: boards.error ?? detail.error,
  }
}
