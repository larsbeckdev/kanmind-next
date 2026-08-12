"use client"

import Link from "next/link"
import { MessageSquareIcon } from "lucide-react"

import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Task } from "@/lib/api/types"
import { daysUntilDue, formatDueDate } from "@/lib/format"
import { PRIORITY_META, STATUS_META } from "@/lib/task-meta"
import { cn } from "@/lib/utils"

export function TaskTable({ tasks, emptyLabel }: { tasks: Task[]; emptyLabel: string }) {
  if (tasks.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-xs text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Comments</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const priority = PRIORITY_META[task.priority]
            const status = STATUS_META[task.status]
            const remainingDays = daysUntilDue(task.due_date)
            const isOverdue =
              task.status !== "done" && remainingDays !== null && remainingDays < 0

            return (
              <TableRow key={task.id}>
                <TableCell className="max-w-64">
                  <Link
                    href={`/boards/${task.board}`}
                    className="block truncate font-medium transition-colors hover:text-primary"
                  >
                    {task.title}
                  </Link>
                </TableCell>
                <TableCell
                  className={cn(
                    "whitespace-nowrap",
                    isOverdue ? "font-semibold text-destructive" : "text-muted-foreground"
                  )}
                >
                  {formatDueDate(task.due_date)}
                </TableCell>
                <TableCell>
                  <span className={cn("flex items-center gap-1 font-medium", priority.className)}>
                    <priority.icon className="size-3.5" />
                    {priority.label}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={status.accent}>
                    <status.icon className="size-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareIcon className="size-3.5" />
                    {task.comments_count}
                  </span>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <span className="flex items-center gap-2">
                      <UserAvatar fullname={task.assignee.fullname} size="sm" />
                      <span className="truncate">{task.assignee.fullname}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
