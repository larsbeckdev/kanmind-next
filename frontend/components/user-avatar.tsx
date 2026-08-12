import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/auth/use-session"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  fullname: string
  size?: "default" | "sm" | "lg"
  className?: string
  title?: string
}

/**
 * The API has no avatar images, so the old frontend coloured the initials
 * circle per user. The hue is derived from the name to keep a person
 * recognisable across boards without storing anything.
 */
function hueFor(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360
  }
  return hash
}

export function UserAvatar({
  fullname,
  size = "default",
  className,
  title,
}: UserAvatarProps) {
  const hue = hueFor(fullname)

  return (
    <Avatar size={size} className={className} title={title ?? fullname}>
      <AvatarFallback
        className="font-semibold text-background"
        style={{ backgroundColor: `oklch(0.82 0.11 ${hue})` }}
      >
        {getInitials(fullname)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserAvatarStack({
  members,
  max = 4,
  className,
}: {
  members: { id: number; fullname: string }[]
  max?: number
  className?: string
}) {
  const visible = members.slice(0, max)
  const overflow = members.length - visible.length

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((member) => (
        <UserAvatar
          key={member.id}
          fullname={member.fullname}
          size="sm"
          className="ring-2 ring-card"
        />
      ))}
      {overflow > 0 ? (
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}
