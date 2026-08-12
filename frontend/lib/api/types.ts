import { z } from "zod"

/** The four states the documented board workflow is made of. */
export const WORKFLOW_STATUSES = ["to-do", "in-progress", "review", "done"] as const

/** Added on top of the documented workflow: put a ticket aside or bin it. */
export const SYSTEM_STATUSES = ["archive", "trash"] as const

export const TASK_STATUSES = [...WORKFLOW_STATUSES, ...SYSTEM_STATUSES] as const
export const TASK_PRIORITIES = ["low", "medium", "high"] as const

export const taskStatusSchema = z.enum(TASK_STATUSES)
export const workflowStatusSchema = z.enum(WORKFLOW_STATUSES)
export const taskPrioritySchema = z.enum(TASK_PRIORITIES)

export const userShortSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullname: z.string(),
})

export const authResponseSchema = z.object({
  token: z.string(),
  fullname: z.string(),
  email: z.string(),
  user_id: z.number(),
})

/** Task shape embedded in the board detail payload - it carries no board id. */
export const boardTaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assignee: userShortSchema.nullable(),
  reviewer: userShortSchema.nullable(),
  due_date: z.string(),
  comments_count: z.number(),
})

/** Task shape returned by the task endpoints - it does carry the board id. */
export const taskSchema = boardTaskSchema.extend({
  board: z.number(),
})

export const boardSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  member_count: z.number(),
  ticket_count: z.number(),
  tasks_to_do_count: z.number(),
  tasks_high_prio_count: z.number(),
  owner_id: z.number(),
})

export const boardDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  owner_id: z.number(),
  members: z.array(userShortSchema),
  tasks: z.array(boardTaskSchema),
})

/** PATCH /api/boards/{id}/ answers with owner_data / members_data instead. */
export const boardUpdateResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  owner_data: userShortSchema,
  members_data: z.array(userShortSchema),
})

export const commentSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  author: z.string(),
  content: z.string(),
})

export type UserShort = z.infer<typeof userShortSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type BoardTask = z.infer<typeof boardTaskSchema>
export type Task = z.infer<typeof taskSchema>
export type BoardSummary = z.infer<typeof boardSummarySchema>
export type BoardDetail = z.infer<typeof boardDetailSchema>
export type BoardUpdateResponse = z.infer<typeof boardUpdateResponseSchema>
export type Comment = z.infer<typeof commentSchema>

export type TaskWritePayload = {
  board?: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  assignee_id: number | null
  reviewer_id: number | null
}
