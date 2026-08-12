import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckBigIcon,
  CircleDotIcon,
  EqualIcon,
  EyeIcon,
  ListTodoIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react"

import {
  SYSTEM_STATUSES,
  TASK_PRIORITIES,
  WORKFLOW_STATUSES,
} from "@/lib/api/types"
import type { TaskPriority, TaskStatus } from "@/lib/api/types"

type StatusMeta = {
  value: TaskStatus
  label: string
  icon: LucideIcon
  /** Tailwind classes for the column accent and the badge. */
  accent: string
}

type PriorityMeta = {
  value: TaskPriority
  label: string
  icon: LucideIcon
  className: string
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  "to-do": {
    value: "to-do",
    label: "To do",
    icon: ListTodoIcon,
    accent: "text-status-to-do",
  },
  "in-progress": {
    value: "in-progress",
    label: "In progress",
    icon: CircleDotIcon,
    accent: "text-status-in-progress",
  },
  review: {
    value: "review",
    label: "Review",
    icon: EyeIcon,
    accent: "text-status-review",
  },
  done: {
    value: "done",
    label: "Done",
    icon: CircleCheckBigIcon,
    accent: "text-status-done",
  },
  archive: {
    value: "archive",
    label: "Archive",
    icon: ArchiveIcon,
    accent: "text-muted-foreground",
  },
  trash: {
    value: "trash",
    label: "Trash",
    icon: Trash2Icon,
    accent: "text-destructive",
  },
}

export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  high: {
    value: "high",
    label: "High",
    icon: ChevronUpIcon,
    className: "text-priority-high",
  },
  medium: {
    value: "medium",
    label: "Medium",
    icon: EqualIcon,
    className: "text-priority-medium",
  },
  low: {
    value: "low",
    label: "Low",
    icon: ChevronDownIcon,
    className: "text-priority-low",
  },
}

export const STATUS_ORDER = WORKFLOW_STATUSES
export const SYSTEM_STATUS_ORDER = SYSTEM_STATUSES
export const PRIORITY_ORDER = TASK_PRIORITIES
