"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { BoardSummary } from "@/lib/api/types"

const MAX_BOARDS = 6

export function BoardWorkloadChart({ boards }: { boards: BoardSummary[] }) {
  const data = [...boards]
    .sort((a, b) => b.ticket_count - a.ticket_count)
    .slice(0, MAX_BOARDS)
    .map((board) => ({
      name: board.title,
      Tickets: board.ticket_count,
      "To do": board.tasks_to_do_count,
      "High prio": board.tasks_high_prio_count,
    }))

  if (data.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-xs text-muted-foreground">
        No boards yet.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          tickFormatter={(value: string) =>
            value.length > 12 ? `${value.slice(0, 11)}…` : value
          }
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--accent)", fillOpacity: 0.25 }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
              {value}
            </span>
          )}
        />
        <Bar dataKey="Tickets" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="To do" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="High prio" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
