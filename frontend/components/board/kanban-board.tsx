"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"

import { KanbanColumn, SystemDropZone } from "@/components/board/kanban-column"
import { TaskCard } from "@/components/board/task-card"
import { taskStatusSchema, workflowStatusSchema } from "@/lib/api/types"
import type { BoardTask, TaskStatus, WorkflowStatus } from "@/lib/api/types"
import type { ColumnPreference } from "@/lib/board-columns"

type KanbanBoardProps = {
  columns: ColumnPreference[]
  tasks: BoardTask[]
  onOpenTask: (taskId: number) => void
  onEditTask: (taskId: number) => void
  onCreateTask: (status: TaskStatus) => void
  onMoveTask: (taskId: number, status: TaskStatus) => void
  onRenameColumn: (status: WorkflowStatus, title: string) => void
  onReorderColumns: (fromStatus: WorkflowStatus, toStatus: WorkflowStatus) => void
}

const DRAG_ACTIVATION_DISTANCE_PX = 6

type DragPayload =
  | { type: "task"; taskId: number; status: TaskStatus }
  | { type: "column"; status: TaskStatus }

function readPayload(data: unknown): DragPayload | null {
  if (typeof data !== "object" || data === null) {
    return null
  }
  const candidate = data as Record<string, unknown>
  const status = taskStatusSchema.safeParse(candidate.status)
  if (!status.success) {
    return null
  }
  if (candidate.type === "column") {
    return { type: "column", status: status.data }
  }
  if (candidate.type === "task" && typeof candidate.taskId === "number") {
    return { type: "task", taskId: candidate.taskId, status: status.data }
  }
  return null
}

export function KanbanBoard({
  columns,
  tasks,
  onOpenTask,
  onEditTask,
  onCreateTask,
  onMoveTask,
  onRenameColumn,
  onReorderColumns,
}: KanbanBoardProps) {
  const [dragged, setDragged] = React.useState<DragPayload | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor)
  )

  const sortableIds = columns.map((column) => `column:${column.status}`)
  const draggedTask =
    dragged?.type === "task"
      ? (tasks.find((task) => task.id === dragged.taskId) ?? null)
      : null
  const draggedColumn =
    dragged?.type === "column"
      ? (columns.find((column) => column.status === dragged.status) ?? null)
      : null

  function handleDragStart(event: DragStartEvent) {
    setDragged(readPayload(event.active.data.current))
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = readPayload(event.active.data.current)
    const over = readPayload(event.over?.data.current)
    setDragged(null)

    if (!active || !over) {
      return
    }

    if (active.type === "column") {
      // Archive and trash keep their place, so only workflow columns reorder.
      const from = workflowStatusSchema.safeParse(active.status)
      const to = workflowStatusSchema.safeParse(over.status)
      if (from.success && to.success) {
        onReorderColumns(from.data, to.data)
      }
      return
    }

    // Only columns are droppable, so `over` always carries the target status.
    if (active.status !== over.status) {
      onMoveTask(active.taskId, over.status)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragged(null)}
    >
      {/* Stretches so the columns reach the footer on a desktop viewport. */}
      <div className="flex min-h-0 flex-1 flex-col">
      <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
        <div
          className="grid flex-1 auto-rows-fr gap-4 lg:auto-rows-auto lg:[grid-template-columns:repeat(var(--kanban-columns),minmax(0,1fr))]"
          style={{ "--kanban-columns": columns.length } as React.CSSProperties}
        >
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.status)}
              nextColumn={columns[index + 1] ?? null}
              onOpenTask={onOpenTask}
              onEditTask={onEditTask}
              onQuickMove={onMoveTask}
              onCreateTask={onCreateTask}
              onRename={onRenameColumn}
            />
          ))}
        </div>
      </SortableContext>

      {dragged?.type === "task" ? (
        <div className="mt-4 grid shrink-0 gap-4 sm:grid-cols-2">
          <SystemDropZone
            status="archive"
            count={tasks.filter((task) => task.status === "archive").length}
          />
          <SystemDropZone
            status="trash"
            count={tasks.filter((task) => task.status === "trash").length}
          />
        </div>
      ) : null}
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedTask ? (
          <div className="w-72 rotate-2">
            <TaskCard task={draggedTask} onOpen={onOpenTask} />
          </div>
        ) : draggedColumn ? (
          <div className="w-72 rounded-xl bg-surface-sunken px-3 py-2 text-sm font-semibold ring-2 ring-primary/50">
            {draggedColumn.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
