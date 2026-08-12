"use client"

import Link from "next/link"
import { Loader2Icon, SearchXIcon } from "lucide-react"

import { BoardView } from "@/components/board/board-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useBoards } from "@/hooks/use-boards"
import { ApiError } from "@/lib/api/client"
import { findBoardBySlug } from "@/lib/slug"

/**
 * The URL carries the board title, not its id. Since the API has no lookup by
 * slug, the board list resolves it - the same query the overview uses, so it
 * usually comes straight out of the cache.
 */
export function BoardPage({ slug }: { slug: string }) {
  const { data: boards, isPending, error } = useBoards()

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" aria-busy="true">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading board</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Loading the boards failed."}
      </Card>
    )
  }

  const board = findBoardBySlug(boards, decodeURIComponent(slug))

  if (!board) {
    return (
      <Card className="items-center gap-3 px-6 py-16 text-center">
        <SearchXIcon className="size-10 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">Board not found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          There is no board with this name, or it is not shared with you.
        </p>
        <Button size="lg" className="h-9" render={<Link href="/boards" />}>
          Back to your boards
        </Button>
      </Card>
    )
  }

  return <BoardView boardId={board.id} />
}
