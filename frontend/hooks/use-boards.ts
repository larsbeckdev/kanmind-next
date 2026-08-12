"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  updateBoard,
} from "@/lib/api/boards"
import type { BoardCreatePayload, BoardUpdatePayload } from "@/lib/api/boards"
import { queryKeys } from "@/lib/api/query-keys"

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards,
    queryFn: listBoards,
  })
}

export function useBoard(boardId: number) {
  return useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: () => getBoard(boardId),
    enabled: Number.isFinite(boardId),
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardCreatePayload) => createBoard(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
  })
}

export function useUpdateBoard(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardUpdatePayload) => updateBoard(boardId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
  })
}

/** Title-only update for the overview, where the board id varies per card. */
export function useRenameBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, title }: { boardId: number; title: string }) =>
      updateBoard(boardId, { title }),
    onSuccess: (_result, { boardId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (boardId: number) => deleteBoard(boardId),
    onSuccess: (_result, boardId) => {
      queryClient.removeQueries({ queryKey: queryKeys.board(boardId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
  })
}
