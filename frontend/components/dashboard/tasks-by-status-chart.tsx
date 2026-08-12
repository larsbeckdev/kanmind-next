"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { STATUS_META, STATUS_ORDER } from "@/lib/task-meta"
import type { Task } from "@/lib/api/types"

/** The four status colours as raw CSS variables, so recharts can use them. */
const STATUS_FILL: Record<string, string> = {
  "to-do": "var(--status-to-do)",
  "in-progress": "var(--status-in-progress)",
  review: "var(--status-review)",
  done: "var(--status-done)",
}

export function TasksByStatusChart({ tasks }: { tasks: Task[] }) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    name: STATUS_META[status].label,
    value: tasks.filter((task) => task.status === status).length,
  })).filter((entry) => entry.value > 0)

  if (data.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-xs text-muted-foreground">
        Nothing assigned to you yet.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={84}
          paddingAngle={2}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_FILL[entry.status]} />
          ))}
        </Pie>
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={24}
          formatter={(value) => (
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
