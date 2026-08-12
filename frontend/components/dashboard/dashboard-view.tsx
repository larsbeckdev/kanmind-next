"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CircleAlertIcon,
  EyeIcon,
  LayersIcon,
  TicketIcon,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { TaskTable } from "@/components/dashboard/task-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBoards } from "@/hooks/use-boards"
import { useAssignedTasks, useReviewingTasks } from "@/hooks/use-tasks"
import { useSession } from "@/lib/auth/use-session"
import { formatDueDate } from "@/lib/format"
import { boardHref } from "@/lib/slug"
import type { Task } from "@/lib/api/types"

const CHART_HEIGHT_PX = 224

/**
 * recharts is the heaviest dependency in the bundle and only the dashboard
 * needs it. Loading it on demand keeps it out of the initial chunk and off
 * every other route.
 */
const chartFallback = () => (
  <Skeleton className="rounded-lg" style={{ height: CHART_HEIGHT_PX }} />
)

const TasksByStatusChart = dynamic(
  () =>
    import("@/components/dashboard/tasks-by-status-chart").then(
      (mod) => mod.TasksByStatusChart
    ),
  { ssr: false, loading: chartFallback }
)

const BoardWorkloadChart = dynamic(
  () =>
    import("@/components/dashboard/board-workload-chart").then(
      (mod) => mod.BoardWorkloadChart
    ),
  { ssr: false, loading: chartFallback }
)

function nextDeadline(tasks: Task[]): string {
  const open = tasks
    .filter((task) => task.status !== "done")
    .map((task) => task.due_date)
    .sort()
  return open.length > 0 ? formatDueDate(open[0]) : "–"
}

export function DashboardView() {
  const session = useSession()
  const boards = useBoards()
  const assigned = useAssignedTasks()
  const reviewing = useReviewingTasks()

  const isPending = boards.isPending || assigned.isPending || reviewing.isPending
  const assignedTasks = assigned.data ?? []
  const reviewingTasks = reviewing.data ?? []
  const urgentTasks = assignedTasks.filter(
    (task) => task.priority === "high" && task.status !== "done"
  )

  if (isPending) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-3xl font-bold">
          Hello {session?.fullname.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything that is waiting for you, across all of your boards.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TicketIcon}
          label="Assigned to you"
          value={assignedTasks.length}
        />
        <StatCard
          icon={EyeIcon}
          label="Waiting for your review"
          value={reviewingTasks.length}
        />
        <StatCard
          icon={CircleAlertIcon}
          label="Urgent and still open"
          value={urgentTasks.length}
          tone={urgentTasks.length > 0 ? "critical" : "default"}
          hint={
            urgentTasks.length > 0
              ? `Next deadline: ${nextDeadline(urgentTasks)}`
              : "Nothing on fire."
          }
        />
        <StatCard
          icon={LayersIcon}
          label="Boards you are on"
          value={boards.data?.length ?? 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Your tasks by status</CardTitle>
          </CardHeader>
          <CardContent>
            <TasksByStatusChart tasks={assignedTasks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workload per board</CardTitle>
          </CardHeader>
          <CardContent>
            <BoardWorkloadChart boards={boards.data ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarClockIcon className="size-4 text-primary" />
            Task insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assigned" className="grid gap-4">
            <TabsList>
              <TabsTrigger value="assigned">
                Assigned to me ({assignedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="reviewing">
                Reviewing ({reviewingTasks.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assigned">
              <TaskTable
                tasks={assignedTasks}
                emptyLabel="No task is assigned to you right now."
              />
            </TabsContent>
            <TabsContent value="reviewing">
              <TaskTable
                tasks={reviewingTasks}
                emptyLabel="Nothing is waiting for your review."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your boards</CardTitle>
        </CardHeader>
        <CardContent>
          {boards.data && boards.data.length > 0 ? (
            <ul className="grid gap-1">
              {boards.data.map((board) => (
                <li key={board.id}>
                  <Link
                    href={boardHref(board)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-sunken hover:text-primary"
                  >
                    <ArrowRightIcon className="size-3.5 text-primary" />
                    <span className="truncate font-medium">{board.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {board.ticket_count} tickets · {board.member_count} members
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              You are not on any board yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
