import { z } from "zod"

import { emptyResponseSchema, request } from "@/lib/api/client"
import { commentSchema } from "@/lib/api/types"
import type { Comment } from "@/lib/api/types"

export function listComments(taskId: number): Promise<Comment[]> {
  return request(`/tasks/${taskId}/comments/`, z.array(commentSchema))
}

export function createComment(taskId: number, content: string): Promise<Comment> {
  return request(`/tasks/${taskId}/comments/`, commentSchema, {
    method: "POST",
    body: { content },
  })
}

export function deleteComment(taskId: number, commentId: number): Promise<void> {
  return request(`/tasks/${taskId}/comments/${commentId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
