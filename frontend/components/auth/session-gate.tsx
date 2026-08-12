"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { useIsHydrated } from "@/hooks/use-is-hydrated"
import { useSession } from "@/lib/auth/use-session"

type SessionGateProps = {
  /** "user" keeps signed-in visitors, "guest" keeps signed-out visitors. */
  expects: "user" | "guest"
  redirectTo: string
  children: React.ReactNode
}

/**
 * The session only exists in the browser, so the first client render is the
 * earliest point at which the route can be gated. Until then a spinner stands
 * in for the protected content to avoid flashing it at signed-out visitors.
 */
export function SessionGate({ expects, redirectTo, children }: SessionGateProps) {
  const router = useRouter()
  const session = useSession()
  const isHydrated = useIsHydrated()
  const isAllowed = expects === "user" ? session !== null : session === null

  React.useEffect(() => {
    if (isHydrated && !isAllowed) {
      router.replace(redirectTo)
    }
  }, [isHydrated, isAllowed, redirectTo, router])

  if (!isHydrated || !isAllowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  return <>{children}</>
}
