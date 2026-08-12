"use client"

import Link from "next/link"
import { ArrowLeftIcon, Loader2Icon, SearchXIcon, Trash2Icon, Undo2Icon } from "lucide-react"
import { toast } from "sonner"

import { TaskDetailDialog } from "@/components/board/task-detail-dialog"
import { UserAvatar } from "@/components/user-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as React from "react"
import { useBoardBySlug } from "@/hooks/use-board-by-slug"
import { useBoardColumns } from "@/hooks/use-board-columns"
import { useDeleteTask, useEmptyTrash, useMoveTask } from "@/hooks/use-tasks"
import { ApiError } from "@/lib/api/client"
import type { BoardTask } from "@/lib/api/types"
import { formatDueDate } from "@/lib/format"
import { boardHref } from "@/lib/slug"
import { PRIORITY_META, STATUS_META } from "@/lib/task-meta"
import { cn } from "@/lib/utils"

type Bucket = "archive" | "trash"

const COPY: Record<Bucket, { title: string; description: string; empty: string }> = {
  archive: {
    title: "Archive",
    description:
      "Finished tickets that are off the board but kept. Restore one to put it back into the first list.",
    empty: "Nothing archived yet. Use the archive button on a card in Done.",
  },
  trash: {
    title: "Trash",
    description:
      "Tickets on their way out. Restoring puts them back, emptying the trash deletes them for good.",
    empty: "The trash is empty.",
  },
}

export function BoardBucketView({ slug, bucket }: { slug: string; bucket: Bucket }) {
  const { board, boardId, isPending, isUnknownSlug, error } = useBoardBySlug(slug)
  const columns = useBoardColumns(boardId ?? 0)
  const moveTask = useMoveTask(boardId ?? 0)
  const deleteTask = useDeleteTask(boardId ?? 0)
  const emptyTrash = useEmptyTrash(boardId ?? 0)
  const [openTaskId, setOpenTaskId] = React.useState<number | null>(null)
  const [isEmptyPromptOpen, setIsEmptyPromptOpen] = React.useState(false)

  const copy = COPY[bucket]
  const meta = STATUS_META[bucket]
  const tasks = (board?.tasks ?? []).filter((task) => task.status === bucket)
  const restoreTo = columns.visibleColumns[0] ?? null

  async function restore(task: BoardTask) {
    if (!restoreTo) {
      return
    }
    try {
      await moveTask.mutateAsync({ taskId: task.id, status: restoreTo.status })
      toast.success(`"${task.title}" moved to ${restoreTo.title}.`)
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The task was not moved."
      )
    }
  }

  async function removeForGood(task: BoardTask) {
    try {
      await deleteTask.mutateAsync(task.id)
      setOpenTaskId(null)
      toast.success("Task deleted.")
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The task was not deleted."
      )
    }
  }

  async function confirmEmpty() {
    const { deleted, failed } = await emptyTrash.mutateAsync(
      tasks.map((task) => task.id)
    )
    setIsEmptyPromptOpen(false)
    if (deleted > 0) {
      toast.success(`${deleted} task${deleted === 1 ? "" : "s"} deleted.`)
    }
    if (failed > 0) {
      toast.error(
        `${failed} task${failed === 1 ? "" : "s"} kept: only the creator or the board owner may delete them.`
      )
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" aria-busy="true">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (isUnknownSlug || (!board && !error)) {
    return (
      <Card className="items-center gap-3 px-6 py-16 text-center">
        <SearchXIcon className="size-10 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">Board not found</p>
        <Button size="lg" className="h-9" render={<Link href="/boards" />}>
          Back to your boards
        </Button>
      </Card>
    )
  }

  if (error || !board) {
    return (
      <Card className="p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Loading the board failed."}
      </Card>
    )
  }

  const openTask = tasks.find((task) => task.id === openTaskId) ?? null

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <Link
          href={boardHref(board)}
          className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeftIcon className="size-3.5" />
          {board.title}
        </Link>

        <div className="flex flex-wrap items-start gap-4">
          <div className="grid gap-1">
            <h1 className="flex items-center gap-2 font-heading text-3xl font-bold">
              <meta.icon className={cn("size-6", meta.accent)} />
              {copy.title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>

          {bucket === "trash" && tasks.length > 0 ? (
            <Button
              variant="destructive"
              size="lg"
              className="ml-auto h-9"
              onClick={() => setIsEmptyPromptOpen(true)}
            >
              <Trash2Icon />
              Empty trash
            </Button>
          ) : null}
        </div>
      </header>

      {tasks.length === 0 ? (
        <Card className="px-6 py-16 text-center text-sm text-muted-foreground">
          {copy.empty}
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const priority = PRIORITY_META[task.priority]
                return (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-80">
                      <button
                        type="button"
                        onClick={() => setOpenTaskId(task.id)}
                        className="block max-w-full truncate text-left font-medium transition-colors hover:text-primary"
                      >
                        {task.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={priority.className}>
                        <priority.icon className="size-3" />
                        {priority.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDueDate(task.due_date)}
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
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Restore ${task.title}`}
                          disabled={!restoreTo || moveTask.isPending}
                          onClick={() => void restore(task)}
                        >
                          <Undo2Icon />
                        </Button>
                        {bucket === "trash" ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${task.title} permanently`}
                            className="text-muted-foreground hover:text-destructive"
                            disabled={deleteTask.isPending}
                            onClick={() => void removeForGood(task)}
                          >
                            <Trash2Icon />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move ${task.title} to trash`}
                            className="text-muted-foreground hover:text-destructive"
                            disabled={moveTask.isPending}
                            onClick={() =>
                              void moveTask.mutateAsync({
                                taskId: task.id,
                                status: "trash",
                              })
                            }
                          >
                            <Trash2Icon />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <TaskDetailDialog
        task={openTask}
        boardId={board.id}
        open={openTaskId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenTaskId(null)
          }
        }}
        onEdit={() => setOpenTaskId(null)}
        onDelete={() => {
          if (openTask) {
            void removeForGood(openTask)
          }
        }}
        isDeleting={deleteTask.isPending}
      />

      <AlertDialog open={isEmptyPromptOpen} onOpenChange={setIsEmptyPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty the trash?</AlertDialogTitle>
            <AlertDialogDescription>
              {tasks.length} task(s) and all of their comments are deleted for
              good. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={emptyTrash.isPending}
              onClick={() => void confirmEmpty()}
            >
              {emptyTrash.isPending ? "Deleting…" : "Delete everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
