"use client"

import * as React from "react"
import { toast } from "sonner"

import { MemberPicker } from "@/components/boards/member-picker"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import type { UserShort } from "@/lib/api/types"

type BoardFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialTitle?: string
  initialMembers?: UserShort[]
  lockedUserId?: number
  isSubmitting: boolean
  onSubmit: (values: { title: string; members: number[] }) => Promise<unknown>
}

export function BoardFormDialog({
  open,
  onOpenChange,
  mode,
  initialTitle = "",
  initialMembers = [],
  lockedUserId,
  isSubmitting,
  onSubmit,
}: BoardFormDialogProps) {
  const [title, setTitle] = React.useState(initialTitle)
  const [members, setMembers] = React.useState<UserShort[]>(initialMembers)
  const [titleError, setTitleError] = React.useState<string>()
  const [wasOpen, setWasOpen] = React.useState(open)

  // Reopening the dialog has to show the current server state, not whatever
  // the previous editing session left behind. Adjusting during render instead
  // of in an effect keeps the first paint free of the stale values.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTitle(initialTitle)
      setMembers(initialMembers)
      setTitleError(undefined)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError("Please enter a board title.")
      return
    }

    try {
      await onSubmit({
        title: trimmed,
        members: members.map((member) => member.id),
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Saving the board failed."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            {mode === "create" ? "Create a board" : "Board settings"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Give the board a name and invite the people who work on it."
              : "Rename the board or change who can see it."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Field label="Title" htmlFor="board-title" error={titleError}>
            <Input
              id="board-title"
              value={title}
              placeholder="Sprint 14"
              className="h-9 text-sm"
              aria-invalid={Boolean(titleError)}
              onChange={(event) => {
                setTitle(event.target.value)
                setTitleError(undefined)
              }}
            />
          </Field>

          <MemberPicker
            members={members}
            onChange={setMembers}
            lockedUserId={lockedUserId}
          />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="h-9" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving…"
                : mode === "create"
                  ? "Create board"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
