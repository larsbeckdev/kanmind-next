"use client"

import * as React from "react"
import { UserPlusIcon, XIcon } from "lucide-react"

import { Field } from "@/components/forms/field"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkEmail } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { UserShort } from "@/lib/api/types"

type MemberPickerProps = {
  members: UserShort[]
  onChange: (members: UserShort[]) => void
  /** The board owner cannot be removed from the member list. */
  lockedUserId?: number
}

export function MemberPicker({
  members,
  onChange,
  lockedUserId,
}: MemberPickerProps) {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [isChecking, setIsChecking] = React.useState(false)

  async function addMember() {
    const candidate = email.trim()
    if (!candidate) {
      return
    }
    if (members.some((member) => member.email.toLowerCase() === candidate.toLowerCase())) {
      setError("This member is already on the board.")
      return
    }

    setIsChecking(true)
    setError(undefined)
    try {
      const user = await checkEmail(candidate)
      onChange([...members, user])
      setEmail("")
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 404
          ? "No KanMind account uses this e-mail address."
          : caught instanceof ApiError
            ? caught.message
            : "The lookup failed. Please try again."
      )
    } finally {
      setIsChecking(false)
    }
  }

  function removeMember(userId: number) {
    onChange(members.filter((member) => member.id !== userId))
  }

  return (
    <div className="grid gap-3">
      <Field
        label="Add member by e-mail"
        htmlFor="member-email"
        error={error}
        hint="The address has to belong to an existing KanMind account."
      >
        <div className="flex gap-2">
          <Input
            id="member-email"
            type="email"
            value={email}
            placeholder="teammate@example.com"
            className="h-9 text-sm"
            aria-invalid={Boolean(error)}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void addMember()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-9"
            disabled={isChecking}
            onClick={() => void addMember()}
          >
            <UserPlusIcon />
            Add
          </Button>
        </div>
      </Field>

      {members.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {members.map((member) => {
            const isLocked = member.id === lockedUserId
            return (
              <li
                key={member.id}
                className="flex items-center gap-2 rounded-full bg-muted py-1 pr-1 pl-1.5 text-xs"
              >
                <UserAvatar fullname={member.fullname} size="sm" />
                <span className="max-w-40 truncate font-medium">{member.fullname}</span>
                {isLocked ? (
                  <span className="px-2 text-[10px] text-muted-foreground uppercase">
                    Owner
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${member.fullname}`}
                    onClick={() => removeMember(member.id)}
                    className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No members added yet.</p>
      )}
    </div>
  )
}
