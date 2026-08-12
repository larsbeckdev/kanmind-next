"use client"

import { CalendarDaysIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { CommentThread } from "@/components/board/comment-thread"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { BoardTask, UserShort } from "@/lib/api/types"
import { daysUntilDue, formatDueDate } from "@/lib/format"
import { PRIORITY_META, STATUS_META } from "@/lib/task-meta"
import { cn } from "@/lib/utils"

type TaskDetailDialogProps = {
  task: BoardTask | null
  boardId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

function PersonRow({ label, user }: { label: string; user: UserShort | null }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {user ? (
        <span className="flex items-center gap-2">
          <UserAvatar fullname={user.fullname} size="sm" />
          <span className="truncate text-sm font-medium">{user.fullname}</span>
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Nobody yet</span>
      )}
    </div>
  )
}

export function TaskDetailDialog({
  task,
  boardId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting,
}: TaskDetailDialogProps) {
  if (!task) {
    return null
  }

  const status = STATUS_META[task.status]
  const priority = PRIORITY_META[task.priority]
  const remainingDays = daysUntilDue(task.due_date)
  const isOverdue = task.status !== "done" && remainingDays !== null && remainingDays < 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg leading-snug">{task.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={status.accent}>
              <status.icon className="size-3" />
              {status.label}
            </Badge>
            <Badge variant="secondary" className={priority.className}>
              <priority.icon className="size-3" />
              {priority.label}
            </Badge>
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "font-semibold text-destructive" : "text-muted-foreground"
              )}
            >
              <CalendarDaysIcon className="size-3.5" />
              {formatDueDate(task.due_date)}
              {isOverdue ? " · overdue" : null}
            </span>
          </DialogDescription>
        </DialogHeader>

        {task.description ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <PersonRow label="Assignee" user={task.assignee} />
          <PersonRow label="Reviewer" user={task.reviewer} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" className="h-9" onClick={onEdit}>
            <PencilIcon />
            Edit task
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="h-9"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2Icon />
            {isDeleting ? "Deleting…" : "Delete task"}
          </Button>
        </div>

        <Separator />

        <CommentThread taskId={task.id} boardId={boardId} />
      </DialogContent>
    </Dialog>
  )
}
