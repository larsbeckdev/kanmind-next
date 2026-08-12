import { z } from "zod"

import { emptyResponseSchema, request } from "@/lib/api/client"
import { taskSchema } from "@/lib/api/types"
import type { Task, TaskWritePayload } from "@/lib/api/types"

export function listAssignedTasks(): Promise<Task[]> {
  return request("/tasks/assigned-to-me/", z.array(taskSchema))
}

export function listReviewingTasks(): Promise<Task[]> {
  return request("/tasks/reviewing/", z.array(taskSchema))
}

export function createTask(payload: TaskWritePayload): Promise<Task> {
  return request("/tasks/", taskSchema, { method: "POST", body: payload })
}

/**
 * PATCH /api/tasks/{id}/ never echoes the board id back, so the response is
 * parsed without it and the caller keeps the board it already knows.
 */
export function updateTask(
  taskId: number,
  payload: Partial<Omit<TaskWritePayload, "board">>
): Promise<Omit<Task, "board" | "comments_count">> {
  return request(`/tasks/${taskId}/`, taskSchema.omit({ board: true, comments_count: true }), {
    method: "PATCH",
    body: payload,
  })
}

export function deleteTask(taskId: number): Promise<void> {
  return request(`/tasks/${taskId}/`, emptyResponseSchema, { method: "DELETE" })
}
