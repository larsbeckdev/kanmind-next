"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { useSession } from "@/lib/auth/use-session"

export default function RootPage() {
  const router = useRouter()
  const session = useSession()

  React.useEffect(() => {
    router.replace(session ? "/dashboard" : "/login")
  }, [session, router])

  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <Loader2Icon className="size-6 animate-spin text-primary" />
      <span className="sr-only">Redirecting</span>
    </div>
  )
}
