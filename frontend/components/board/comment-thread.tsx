"use client"

import * as React from "react"
import { SendIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments"
import { ApiError } from "@/lib/api/client"
import { useSession } from "@/lib/auth/use-session"
import { formatDateTime } from "@/lib/format"

type CommentThreadProps = {
  taskId: number
  boardId: number
}

export function CommentThread({ taskId, boardId }: CommentThreadProps) {
  const session = useSession()
  const { data: comments, isPending, error } = useComments(taskId)
  const createComment = useCreateComment(taskId, boardId)
  const deleteComment = useDeleteComment(taskId, boardId)
  const [draft, setDraft] = React.useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content) {
      return
    }
    try {
      await createComment.mutateAsync(content)
      setDraft("")
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The comment was not saved."
      )
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteComment.mutateAsync(commentId)
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "The comment was not deleted."
      )
    }
  }

  return (
    <section className="grid gap-4">
      <h3 className="text-sm font-semibold">
        Comments
        {comments ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {comments.length}
          </span>
        ) : null}
      </h3>

      {error ? (
        <p className="text-xs text-destructive">
          {error instanceof ApiError ? error.message : "Loading the comments failed."}
        </p>
      ) : isPending ? (
        <div className="grid gap-3">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No comments yet. Start the discussion below.
        </p>
      ) : (
        <ul className="grid gap-3">
          {comments.map((comment) => {
            const isAuthor = comment.author === session?.fullname
            return (
              <li
                key={comment.id}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-lg bg-surface-sunken p-3"
              >
                <UserAvatar fullname={comment.author} size="sm" />
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-xs font-semibold">{comment.author}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateTime(comment.created_at)}
                    </span>
                    {isAuthor ? (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Delete comment"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        disabled={deleteComment.isPending}
                        onClick={() => void handleDelete(comment.id)}
                      >
                        <Trash2Icon />
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="grid gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          className="text-sm"
        />
        <Button
          type="submit"
          size="lg"
          className="h-9 justify-self-end"
          disabled={createComment.isPending || draft.trim().length === 0}
        >
          <SendIcon />
          {createComment.isPending ? "Sending…" : "Comment"}
        </Button>
      </form>
    </section>
  )
}
