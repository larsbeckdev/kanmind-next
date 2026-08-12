"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  CircleAlertIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BoardSummary } from "@/lib/api/types"
import { boardHref } from "@/lib/slug"

type BoardCardProps = {
  board: BoardSummary
  isOwner: boolean
  onRename: (board: BoardSummary) => void
  onDelete: (board: BoardSummary) => void
}

export function BoardCard({ board, isOwner, onRename, onDelete }: BoardCardProps) {
  const startedCount = board.ticket_count - board.tasks_to_do_count
  const startedPercent =
    board.ticket_count === 0
      ? 0
      : Math.round((startedCount / board.ticket_count) * 100)

  return (
    <Card className="group/board relative gap-4 transition-colors hover:ring-primary/40 focus-within:ring-primary/60">
      <div className="flex items-start gap-2 px-(--card-spacing)">
        <h3 className="min-w-0 flex-1 font-heading text-lg leading-tight font-bold">
          <Link
            href={boardHref(board)}
            className="block truncate transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:text-primary focus-visible:outline-none"
          >
            {board.title}
          </Link>
        </h3>

        {isOwner ? (
          <Badge variant="secondary" className="relative mt-0.5 shrink-0">
            Owner
          </Badge>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${board.title}`}
                className="relative -mt-0.5 shrink-0"
              />
            }
          >
            <EllipsisVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href={boardHref(board)} />}>
              <ArrowRightIcon className="size-4" />
              Open board
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(board)}>
              <PencilIcon className="size-4" />
              Rename
            </DropdownMenuItem>
            {isOwner ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(board)}>
                  <Trash2Icon className="size-4" />
                  Delete board
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-2 px-(--card-spacing)">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={board.ticket_count}
          aria-valuenow={startedCount}
          aria-label="Tickets already started"
          className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${startedPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {board.ticket_count === 0 ? (
            "No tickets yet"
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {board.tasks_to_do_count}
              </span>{" "}
              of {board.ticket_count} still to do
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-(--card-spacing) text-xs">
        {board.tasks_high_prio_count > 0 ? (
          <span className="flex items-center gap-1.5 font-semibold text-priority-high">
            <CircleAlertIcon className="size-3.5" />
            {board.tasks_high_prio_count} high priority
          </span>
        ) : null}

        <span className="flex items-center gap-1.5 text-muted-foreground">
          <UsersIcon className="size-3.5" />
          {board.member_count} {board.member_count === 1 ? "member" : "members"}
        </span>

        <ArrowRightIcon className="ml-auto size-4 text-muted-foreground transition-all group-hover/board:translate-x-0.5 group-hover/board:text-primary" />
      </div>
    </Card>
  )
}
