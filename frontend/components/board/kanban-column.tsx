"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArchiveIcon,
  ArrowRightIcon,
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"

import { TaskCard } from "@/components/board/task-card"
import type { QuickMove } from "@/components/board/task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { STATUS_META } from "@/lib/task-meta"
import type { BoardTask, TaskStatus, WorkflowStatus } from "@/lib/api/types"
import { cn } from "@/lib/utils"

type TaskHandlers = {
  onOpenTask: (taskId: number) => void
  onEditTask: (taskId: number) => void
  onQuickMove: (taskId: number, status: TaskStatus) => void
}

type ColumnShellProps = TaskHandlers & {
  tasks: BoardTask[]
  quickMoves: QuickMove[]
  emptyLabel: string
  className?: string
  children: React.ReactNode
  setNodeRef: (node: HTMLElement | null) => void
  style?: React.CSSProperties
  ariaLabel: string
}

function ColumnShell({
  tasks,
  quickMoves,
  emptyLabel,
  className,
  children,
  setNodeRef,
  style,
  ariaLabel,
  onOpenTask,
  onEditTask,
  onQuickMove,
}: ColumnShellProps) {
  return (
    <section
      ref={setNodeRef}
      style={style}
      aria-label={ariaLabel}
      className={cn(
        "flex h-full min-w-0 flex-col gap-3 rounded-xl bg-surface-sunken/60 p-3 transition-colors",
        className
      )}
    >
      {children}

      <div className="grid flex-1 content-start gap-3 rounded-lg p-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            quickMoves={quickMoves}
            onOpen={onOpenTask}
            onEdit={onEditTask}
            onQuickMove={onQuickMove}
          />
        ))}

        {tasks.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </p>
        ) : null}
      </div>
    </section>
  )
}

type KanbanColumnProps = TaskHandlers & {
  status: WorkflowStatus
  title: string
  tasks: BoardTask[]
  /** The column a card jumps to with the arrow button, if there is one. */
  nextColumn: { status: WorkflowStatus; title: string } | null
  onCreateTask: (status: TaskStatus) => void
  onRename: (status: WorkflowStatus, title: string) => void
}

/** A workflow column: renameable and reorderable. */
export function KanbanColumn({
  status,
  title,
  tasks,
  nextColumn,
  onOpenTask,
  onEditTask,
  onQuickMove,
  onCreateTask,
  onRename,
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `column:${status}`,
    data: { type: "column", status },
  })
  const [draftTitle, setDraftTitle] = React.useState<string | null>(null)
  const meta = STATUS_META[status]

  // Archiving is the step after a ticket is finished, so the shortcut only
  // appears where that is true. Everywhere else the card moves on instead.
  const quickMoves: QuickMove[] = [
    ...(nextColumn
      ? [
          {
            status: nextColumn.status,
            label: `Move to ${nextColumn.title}`,
            icon: ArrowRightIcon,
          },
        ]
      : []),
    ...(status === "done"
      ? [{ status: "archive" as const, label: "Archive", icon: ArchiveIcon }]
      : []),
  ]

  function commitRename() {
    if (draftTitle !== null) {
      onRename(status, draftTitle)
    }
    setDraftTitle(null)
  }

  return (
    <ColumnShell
      setNodeRef={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      ariaLabel={title}
      tasks={tasks}
      quickMoves={quickMoves}
      emptyLabel="Drop a task here."
      onOpenTask={onOpenTask}
      onEditTask={onEditTask}
      onQuickMove={onQuickMove}
      className={cn(
        isDragging && "z-40 opacity-60 ring-2 ring-primary/50",
        isOver && !isDragging && "bg-primary/10 ring-1 ring-primary/40"
      )}
    >
      <header className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Move column ${title}`}
          className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVerticalIcon className="size-4" />
        </button>

        <meta.icon className={cn("size-4 shrink-0", meta.accent)} />

        {draftTitle === null ? (
          <>
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tasks.length}
            </span>
            <div className="ml-auto flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename column ${title}`}
                onClick={() => setDraftTitle(title)}
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Add task to ${title}`}
                onClick={() => onCreateTask(status)}
              >
                <PlusIcon />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center gap-1">
            <Input
              autoFocus
              value={draftTitle}
              aria-label="Column title"
              className="h-7 text-sm"
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  commitRename()
                }
                if (event.key === "Escape") {
                  event.preventDefault()
                  setDraftTitle(null)
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Save column title"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitRename}
            >
              <CheckIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cancel renaming"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setDraftTitle(null)}
            >
              <XIcon />
            </Button>
          </div>
        )}
      </header>
    </ColumnShell>
  )
}

/**
 * Archive and trash live on their own pages. While a card is being dragged
 * they appear as two drop bars below the board, so a ticket can still be put
 * aside without leaving the board first.
 */
export function SystemDropZone({
  status,
  count,
}: {
  status: Extract<TaskStatus, "archive" | "trash">
  count: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { type: "column", status },
  })
  const meta = STATUS_META[status]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface-sunken/40 px-4 py-6 text-sm transition-colors",
        isOver
          ? "border-primary/60 bg-primary/10 text-primary"
          : "text-muted-foreground"
      )}
    >
      <meta.icon className={cn("size-4", isOver ? "text-primary" : meta.accent)} />
      Drop here to move to {meta.label.toLowerCase()}
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
    </div>
  )
}
