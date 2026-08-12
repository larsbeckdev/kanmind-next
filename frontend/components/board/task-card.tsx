"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  CalendarDaysIcon,
  GripVerticalIcon,
  MessageSquareIcon,
  PencilIcon,
  type LucideIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/user-avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { daysUntilDue, formatDueDate } from "@/lib/format"
import { PRIORITY_META } from "@/lib/task-meta"
import type { BoardTask, TaskStatus } from "@/lib/api/types"
import { cn } from "@/lib/utils"

/** A one-click alternative to dragging: move this card to another column. */
export type QuickMove = {
  status: TaskStatus
  label: string
  icon: LucideIcon
}

type TaskCardProps = {
  task: BoardTask
  onOpen: (taskId: number) => void
  onEdit?: (taskId: number) => void
  quickMoves?: QuickMove[]
  onQuickMove?: (taskId: number, status: TaskStatus) => void
}

export function TaskCard({
  task,
  onOpen,
  onEdit,
  quickMoves = [],
  onQuickMove,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task:${task.id}`,
    data: { type: "task", taskId: task.id, status: task.status },
  })
  const priority = PRIORITY_META[task.priority]
  const remainingDays = daysUntilDue(task.due_date)
  const isOverdue = task.status !== "done" && remainingDays !== null && remainingDays < 0

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "group/task grid gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-shadow",
        isDragging ? "z-50 opacity-90 shadow-xl ring-primary/50" : "hover:ring-primary/30"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="flex-1 text-left text-sm leading-snug font-semibold transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          {task.title}
        </button>
        <div className="mt-0.5 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/task:opacity-100 focus-within:opacity-100">
          {onEdit ? (
            <button
              type="button"
              aria-label={`Edit ${task.title}`}
              onClick={() => onEdit(task.id)}
              className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <PencilIcon className="size-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Drag ${task.title}`}
            className="flex size-6 cursor-grab touch-none items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none active:cursor-grabbing"
            {...listeners}
            {...attributes}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        </div>
      </div>

      {task.description ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <span className={cn("flex items-center gap-1 font-semibold", priority.className)}>
          <priority.icon className="size-3.5" />
          {priority.label}
        </span>

        <span
          className={cn(
            "flex items-center gap-1",
            isOverdue ? "font-semibold text-destructive" : "text-muted-foreground"
          )}
        >
          <CalendarDaysIcon className="size-3.5" />
          {formatDueDate(task.due_date)}
        </span>

        {task.comments_count > 0 ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <MessageSquareIcon className="size-3.5" />
            {task.comments_count}
          </span>
        ) : null}

        {onQuickMove && quickMoves.length > 0 ? (
          <span className="flex items-center gap-0.5">
            {quickMoves.map((move) => (
              <Tooltip key={move.status}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`${move.label}: ${task.title}`}
                      onClick={() => onQuickMove(task.id, move.status)}
                      className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                    />
                  }
                >
                  <move.icon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>{move.label}</TooltipContent>
              </Tooltip>
            ))}
          </span>
        ) : null}

        <span className="ml-auto flex items-center -space-x-2">
          {task.assignee ? (
            <UserAvatar
              fullname={task.assignee.fullname}
              size="sm"
              title={`Assignee: ${task.assignee.fullname}`}
              className="ring-2 ring-card"
            />
          ) : null}
          {task.reviewer ? (
            <UserAvatar
              fullname={task.reviewer.fullname}
              size="sm"
              title={`Reviewer: ${task.reviewer.fullname}`}
              className="ring-2 ring-card"
            />
          ) : null}
        </span>
      </div>
    </article>
  )
}
