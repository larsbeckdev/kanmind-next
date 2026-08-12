"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  PlusIcon,
  RotateCcwIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { KanbanBoard } from "@/components/board/kanban-board"
import { TaskDetailDialog } from "@/components/board/task-detail-dialog"
import { TaskFormDialog } from "@/components/board/task-form-dialog"
import { BoardFormDialog } from "@/components/boards/board-form-dialog"
import { UserAvatarStack } from "@/components/user-avatar"
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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useBoardColumns } from "@/hooks/use-board-columns"
import { useBoard, useDeleteBoard, useUpdateBoard } from "@/hooks/use-boards"
import {
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useUpdateTask,
} from "@/hooks/use-tasks"
import { ApiError } from "@/lib/api/client"
import type { TaskStatus, UserShort } from "@/lib/api/types"
import { useSession } from "@/lib/auth/use-session"
import { boardHref } from "@/lib/slug"

export function BoardView({ boardId }: { boardId: number }) {
  const router = useRouter()
  const session = useSession()
  const { data: board, isPending, error } = useBoard(boardId)
  const boardColumns = useBoardColumns(boardId)

  const updateBoard = useUpdateBoard(boardId)
  const deleteBoard = useDeleteBoard()
  const createTask = useCreateTask(boardId)
  const updateTask = useUpdateTask(boardId)
  const deleteTask = useDeleteTask(boardId)
  const moveTask = useMoveTask(boardId)

  const [openTaskId, setOpenTaskId] = React.useState<number | null>(null)
  const [editingTaskId, setEditingTaskId] = React.useState<number | null>(null)
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false)
  const [newTaskStatus, setNewTaskStatus] = React.useState<TaskStatus>("to-do")
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isDeletePromptOpen, setIsDeletePromptOpen] = React.useState(false)

  const isOwner = board?.owner_id === session?.userId
  const openTask = board?.tasks.find((task) => task.id === openTaskId) ?? null
  const editingTask = board?.tasks.find((task) => task.id === editingTaskId)

  /**
   * The board detail payload lists members only. The owner is a participant
   * too, so they are added back for the assignee and reviewer pickers.
   */
  const candidates: UserShort[] = React.useMemo(() => {
    if (!board) {
      return []
    }
    const hasOwner = board.members.some((member) => member.id === board.owner_id)
    if (hasOwner || !session || session.userId !== board.owner_id) {
      return board.members
    }
    return [
      { id: session.userId, email: session.email, fullname: session.fullname },
      ...board.members,
    ]
  }, [board, session])

  function openCreateTask(status: TaskStatus) {
    setEditingTaskId(null)
    setNewTaskStatus(status)
    setIsTaskFormOpen(true)
  }

  function openEditTask(taskId: number) {
    setOpenTaskId(null)
    setEditingTaskId(taskId)
    setIsTaskFormOpen(true)
  }

  async function handleMoveTask(taskId: number, status: TaskStatus) {
    try {
      await moveTask.mutateAsync({ taskId, status })
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The task was not moved."
      )
    }
  }

  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask.mutateAsync(taskId)
      setOpenTaskId(null)
      toast.success("Task deleted.")
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The task was not deleted."
      )
    }
  }

  async function handleDeleteBoard() {
    try {
      await deleteBoard.mutateAsync(boardId)
      toast.success("Board deleted.")
      router.replace("/boards")
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The board was not deleted."
      )
    }
  }

  if (error) {
    return (
      <Card className="p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Loading the board failed."}
      </Card>
    )
  }

  if (isPending) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const archivedCount = board.tasks.filter((task) => task.status === "archive").length
  const trashedCount = board.tasks.filter((task) => task.status === "trash").length
  const basePath = boardHref(board)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="grid gap-4">
        <Link
          href="/boards"
          className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeftIcon className="size-3.5" />
          All boards
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-heading text-3xl font-bold">{board.title}</h1>
          <UserAvatarStack members={board.members} />

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              className="h-9"
              onClick={() => openCreateTask(boardColumns.visibleColumns[0]?.status ?? "to-do")}
            >
              <PlusIcon />
              New task
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="lg" className="h-9" aria-label="Lists" />
                }
              >
                <Columns3Icon />
                Lists
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {/* Base UI requires a Menu.Group around a group label. */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Visible lists</DropdownMenuLabel>
                  {boardColumns.columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.status}
                      checked={!column.isHidden}
                      disabled={column.status === "done"}
                      onCheckedChange={(checked) =>
                        boardColumns.setHidden(column.status, !checked)
                      }
                    >
                      {column.title}
                      {column.status === "done" ? (
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          always on
                        </span>
                      ) : null}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={`${basePath}/archive`} />}>
                  <ArchiveIcon className="size-4" />
                  Archive
                  <span className="ml-auto text-xs text-muted-foreground">
                    {archivedCount}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={`${basePath}/trash`} />}>
                  <Trash2Icon className="size-4" />
                  Trash
                  <span className="ml-auto text-xs text-muted-foreground">
                    {trashedCount}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={boardColumns.reset}>
                  <RotateCcwIcon className="size-4" />
                  Reset titles and order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="size-9"
                    aria-label="Board settings"
                    onClick={() => setIsSettingsOpen(true)}
                  />
                }
              >
                <SettingsIcon />
              </TooltipTrigger>
              <TooltipContent>Board settings</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-9"
                    aria-label="More board actions"
                  />
                }
              >
                <EllipsisVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <SettingsIcon className="size-4" />
                  Board settings
                </DropdownMenuItem>
                {isOwner ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setIsDeletePromptOpen(true)}
                    >
                      <Trash2Icon className="size-4" />
                      Delete board
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <KanbanBoard
        columns={boardColumns.visibleColumns}
        tasks={board.tasks}
        onOpenTask={setOpenTaskId}
        onEditTask={openEditTask}
        onCreateTask={openCreateTask}
        onMoveTask={(taskId, status) => void handleMoveTask(taskId, status)}
        onRenameColumn={boardColumns.rename}
        onReorderColumns={boardColumns.reorder}
      />

      <TaskDetailDialog
        task={openTask}
        boardId={boardId}
        open={openTaskId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenTaskId(null)
          }
        }}
        onEdit={() => {
          if (openTaskId !== null) {
            openEditTask(openTaskId)
          }
        }}
        onDelete={() => {
          if (openTaskId !== null) {
            void handleDeleteTask(openTaskId)
          }
        }}
        isDeleting={deleteTask.isPending}
      />

      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={(open) => {
          setIsTaskFormOpen(open)
          if (!open) {
            setEditingTaskId(null)
          }
        }}
        task={editingTask}
        defaultStatus={newTaskStatus}
        candidates={candidates}
        isSubmitting={createTask.isPending || updateTask.isPending}
        onSubmit={async (payload) => {
          if (editingTaskId !== null) {
            await updateTask.mutateAsync({ taskId: editingTaskId, payload })
            toast.success("Task updated.")
            return
          }
          await createTask.mutateAsync(payload)
          toast.success("Task created.")
        }}
      />

      <BoardFormDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        mode="edit"
        initialTitle={board.title}
        initialMembers={board.members}
        isSubmitting={updateBoard.isPending}
        onSubmit={async (values) => {
          await updateBoard.mutateAsync(values)
          toast.success("Board updated.")
        }}
      />

      <AlertDialog open={isDeletePromptOpen} onOpenChange={setIsDeletePromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this board?</AlertDialogTitle>
            <AlertDialogDescription>
              All tasks and comments on &quot;{board.title}&quot; are removed with
              it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteBoard.isPending}
              onClick={() => void handleDeleteBoard()}
            >
              {deleteBoard.isPending ? "Deleting…" : "Delete board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
