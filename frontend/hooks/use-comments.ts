"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createComment, deleteComment, listComments } from "@/lib/api/comments"
import { queryKeys } from "@/lib/api/query-keys"

export function useComments(taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.comments(taskId ?? 0),
    queryFn: () => listComments(taskId as number),
    enabled: taskId !== null,
  })
}

export function useCreateComment(taskId: number, boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createComment(taskId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
  })
}

export function useDeleteComment(taskId: number, boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(taskId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
  })
}
