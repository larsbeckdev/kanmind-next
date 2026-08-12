"use client"

import * as React from "react"
import { PlusIcon, SearchIcon, SquareKanbanIcon } from "lucide-react"
import { toast } from "sonner"

import { BoardCard } from "@/components/boards/board-card"
import { BoardFormDialog } from "@/components/boards/board-form-dialog"
import { RenameBoardDialog } from "@/components/boards/rename-board-dialog"
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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useRenameBoard,
} from "@/hooks/use-boards"
import { ApiError } from "@/lib/api/client"
import type { BoardSummary } from "@/lib/api/types"
import { useSession } from "@/lib/auth/use-session"

export function BoardsView() {
  const session = useSession()
  const { data: boards, isPending, error } = useBoards()
  const createBoard = useCreateBoard()
  const renameBoard = useRenameBoard()
  const deleteBoard = useDeleteBoard()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [boardToRename, setBoardToRename] = React.useState<BoardSummary | null>(null)
  const [boardToDelete, setBoardToDelete] = React.useState<BoardSummary | null>(null)

  async function handleDeleteBoard() {
    if (!boardToDelete) {
      return
    }
    try {
      await deleteBoard.mutateAsync(boardToDelete.id)
      toast.success(`Board "${boardToDelete.title}" deleted.`)
      setBoardToDelete(null)
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The board was not deleted."
      )
    }
  }

  const visibleBoards = (boards ?? []).filter((board) =>
    board.title.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-bold">Boards</h1>
          <p className="text-sm text-muted-foreground">
            Every board you own or have been invited to.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search boards"
              aria-label="Search boards"
              className="h-9 pl-9 text-sm"
            />
          </div>
          <Button size="lg" className="h-9" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
            New board
          </Button>
        </div>
      </header>

      {error ? (
        <Card className="p-6 text-sm text-destructive">
          {error instanceof ApiError ? error.message : "Loading the boards failed."}
        </Card>
      ) : isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : visibleBoards.length === 0 ? (
        <Card className="items-center gap-3 px-6 py-16 text-center">
          <SquareKanbanIcon className="size-10 text-muted-foreground" />
          <p className="font-heading text-lg font-semibold">
            {boards?.length ? "No board matches your search." : "No boards yet."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {boards?.length
              ? "Try a different title."
              : "Create your first board and invite the people you work with."}
          </p>
          {boards?.length ? null : (
            <Button size="lg" className="h-9" onClick={() => setIsDialogOpen(true)}>
              <PlusIcon />
              Create a board
            </Button>
          )}
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBoards.map((board) => (
            <li key={board.id}>
              <BoardCard
                board={board}
                isOwner={board.owner_id === session?.userId}
                onRename={setBoardToRename}
                onDelete={setBoardToDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <BoardFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="create"
        isSubmitting={createBoard.isPending}
        onSubmit={async (values) => {
          const board = await createBoard.mutateAsync(values)
          toast.success(`Board "${board.title}" created.`)
        }}
      />

      <RenameBoardDialog
        open={boardToRename !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBoardToRename(null)
          }
        }}
        initialTitle={boardToRename?.title ?? ""}
        isSubmitting={renameBoard.isPending}
        onSubmit={async (title) => {
          if (boardToRename) {
            await renameBoard.mutateAsync({ boardId: boardToRename.id, title })
            toast.success("Board renamed.")
          }
        }}
      />

      <AlertDialog
        open={boardToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBoardToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this board?</AlertDialogTitle>
            <AlertDialogDescription>
              All tasks and comments on &quot;{boardToDelete?.title}&quot; are removed
              with it. This cannot be undone.
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
