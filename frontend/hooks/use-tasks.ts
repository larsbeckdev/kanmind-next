"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-keys"
import {
  createTask,
  deleteTask,
  listAssignedTasks,
  listReviewingTasks,
  updateTask,
} from "@/lib/api/tasks"
import type { BoardDetail, TaskStatus, TaskWritePayload } from "@/lib/api/types"

export function useAssignedTasks() {
  return useQuery({
    queryKey: queryKeys.assignedTasks,
    queryFn: listAssignedTasks,
  })
}

export function useReviewingTasks() {
  return useQuery({
    queryKey: queryKeys.reviewingTasks,
    queryFn: listReviewingTasks,
  })
}

function invalidateTaskViews(
  queryClient: ReturnType<typeof useQueryClient>,
  boardId: number
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
  void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
  void queryClient.invalidateQueries({ queryKey: queryKeys.assignedTasks })
  void queryClient.invalidateQueries({ queryKey: queryKeys.reviewingTasks })
}

export function useCreateTask(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskWritePayload) =>
      createTask({ ...payload, board: boardId }),
    onSuccess: () => invalidateTaskViews(queryClient, boardId),
  })
}

export function useUpdateTask(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: number
      payload: Partial<Omit<TaskWritePayload, "board">>
    }) => updateTask(taskId, payload),
    onSuccess: () => invalidateTaskViews(queryClient, boardId),
  })
}

export function useDeleteTask(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => invalidateTaskViews(queryClient, boardId),
  })
}

/**
 * The API deletes one task per request, so emptying the trash fans out. The
 * calls run in parallel and the result reports how many actually went
 * through, because the API only lets the task creator or the board owner
 * delete a ticket.
 */
export function useEmptyTrash(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskIds: number[]) => {
      const results = await Promise.allSettled(taskIds.map(deleteTask))
      return {
        deleted: results.filter((result) => result.status === "fulfilled").length,
        failed: results.filter((result) => result.status === "rejected").length,
      }
    },
    onSuccess: () => invalidateTaskViews(queryClient, boardId),
  })
}

/**
 * Drag and drop needs the card to stay under the cursor, so the board detail
 * cache is patched before the request goes out and rolled back when the API
 * rejects the move.
 */
export function useMoveTask(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) })
      const previous = queryClient.getQueryData<BoardDetail>(
        queryKeys.board(boardId)
      )

      if (previous) {
        queryClient.setQueryData<BoardDetail>(queryKeys.board(boardId), {
          ...previous,
          tasks: previous.tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task
          ),
        })
      }

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), context.previous)
      }
    },
    onSettled: () => invalidateTaskViews(queryClient, boardId),
  })
}
