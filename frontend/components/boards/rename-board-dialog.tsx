"use client"

import * as React from "react"
import { toast } from "sonner"

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

type RenameBoardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTitle: string
  isSubmitting: boolean
  onSubmit: (title: string) => Promise<unknown>
}

/**
 * PATCH /api/boards/{id}/ leaves the member list untouched when the payload
 * carries no members, so the overview can rename a board without knowing who
 * is on it.
 */
export function RenameBoardDialog({
  open,
  onOpenChange,
  initialTitle,
  isSubmitting,
  onSubmit,
}: RenameBoardDialogProps) {
  const [title, setTitle] = React.useState(initialTitle)
  const [error, setError] = React.useState<string>()
  const [wasOpen, setWasOpen] = React.useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTitle(initialTitle)
      setError(undefined)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Please enter a board title.")
      return
    }
    try {
      await onSubmit(trimmed)
      onOpenChange(false)
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "Renaming the board failed."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base">Rename board</DialogTitle>
          <DialogDescription>
            Members and tasks stay exactly as they are.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Field label="Title" htmlFor="rename-board-title" error={error}>
            <Input
              id="rename-board-title"
              autoFocus
              value={title}
              className="h-9 text-sm"
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setTitle(event.target.value)
                setError(undefined)
              }}
            />
          </Field>

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
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
