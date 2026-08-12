import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "critical"
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="gap-3">
      <div className="flex items-center gap-3 px-(--card-spacing)">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone === "critical"
              ? "bg-priority-high/15 text-priority-high"
              : "bg-primary/15 text-primary"
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="grid leading-tight">
          <span className="font-heading text-2xl font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
      {hint ? (
        <p className="px-(--card-spacing) text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  )
}
