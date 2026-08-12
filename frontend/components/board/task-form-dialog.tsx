"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { taskPrioritySchema, taskStatusSchema } from "@/lib/api/types"
import type { BoardTask, TaskWritePayload, UserShort } from "@/lib/api/types"
import { toDateInputValue, todayAsDateInputValue } from "@/lib/format"
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  SYSTEM_STATUS_ORDER,
} from "@/lib/task-meta"

const UNASSIGNED = "none"

const taskFormSchema = z.object({
  title: z.string().min(1, "Please enter a title."),
  description: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z.string().min(1, "Please pick a due date."),
  assignee: z.string(),
  reviewer: z.string(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

type TaskFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Undefined creates a new task, a task edits the existing one. */
  task?: BoardTask
  defaultStatus: TaskWritePayload["status"]
  candidates: UserShort[]
  isSubmitting: boolean
  onSubmit: (payload: TaskWritePayload) => Promise<unknown>
}

function toOptionValue(user: UserShort | null | undefined): string {
  return user ? String(user.id) : UNASSIGNED
}

function toUserId(value: string): number | null {
  return value === UNASSIGNED ? null : Number(value)
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  candidates,
  isSubmitting,
  onSubmit,
}: TaskFormDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
      priority: "medium",
      due_date: todayAsDateInputValue(),
      assignee: UNASSIGNED,
      reviewer: UNASSIGNED,
    },
  })
  const { control, reset } = form
  const selected = useWatch({ control })

  React.useEffect(() => {
    if (!open) {
      return
    }
    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? defaultStatus,
      priority: task?.priority ?? "medium",
      due_date: task ? toDateInputValue(task.due_date) : todayAsDateInputValue(),
      assignee: toOptionValue(task?.assignee),
      reviewer: toOptionValue(task?.reviewer),
    })
  }, [open, task, defaultStatus, reset])

  const userItems = [
    { value: UNASSIGNED, label: "Unassigned" },
    ...candidates.map((user) => ({ value: String(user.id), label: user.fullname })),
  ]
  // Archive and trash are usually reached by dragging, but the form has to
  // offer them so a ticket can be brought back from there as well.
  const statusItems = [...STATUS_ORDER, ...SYSTEM_STATUS_ORDER].map((status) => ({
    value: status,
    label: STATUS_META[status].label,
  }))
  const priorityItems = PRIORITY_ORDER.map((priority) => ({
    value: priority,
    label: PRIORITY_META[priority].label,
  }))

  async function handleSubmit(values: TaskFormValues) {
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        due_date: values.due_date,
        assignee_id: toUserId(values.assignee),
        reviewer_id: toUserId(values.reviewer),
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Saving the task failed."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            {task ? "Edit task" : "New task"}
          </DialogTitle>
          <DialogDescription>
            Assignee and reviewer have to be members of this board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
          <Field label="Title" htmlFor="task-title" error={form.formState.errors.title?.message}>
            <Input
              id="task-title"
              className="h-9 text-sm"
              placeholder="Fix the login redirect"
              aria-invalid={Boolean(form.formState.errors.title)}
              {...form.register("title")}
            />
          </Field>

          <Field label="Description" htmlFor="task-description">
            <Textarea
              id="task-description"
              rows={4}
              className="text-sm"
              placeholder="What has to happen for this ticket to be done?"
              {...form.register("description")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="task-status">
              <Select
                items={statusItems}
                value={selected.status ?? defaultStatus}
                onValueChange={(value) =>
                  form.setValue("status", taskStatusSchema.parse(value))
                }
              >
                <SelectTrigger id="task-status" className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority" htmlFor="task-priority">
              <Select
                items={priorityItems}
                value={selected.priority ?? "medium"}
                onValueChange={(value) =>
                  form.setValue("priority", taskPrioritySchema.parse(value))
                }
              >
                <SelectTrigger id="task-priority" className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Assignee" htmlFor="task-assignee">
              <Select
                items={userItems}
                value={selected.assignee ?? UNASSIGNED}
                onValueChange={(value) => form.setValue("assignee", String(value))}
              >
                <SelectTrigger id="task-assignee" className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Reviewer" htmlFor="task-reviewer">
              <Select
                items={userItems}
                value={selected.reviewer ?? UNASSIGNED}
                onValueChange={(value) => form.setValue("reviewer", String(value))}
              >
                <SelectTrigger id="task-reviewer" className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Due date"
            htmlFor="task-due-date"
            error={form.formState.errors.due_date?.message}
          >
            <Input
              id="task-due-date"
              type="date"
              className="h-9 w-full text-sm sm:w-56"
              aria-invalid={Boolean(form.formState.errors.due_date)}
              {...form.register("due_date")}
            />
          </Field>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="h-9" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
