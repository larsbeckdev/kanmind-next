"use client"

import { Loader2Icon, ShieldAlertIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { useSessionRole } from "@/hooks/use-admin"

/**
 * The route is a convenience gate only. Every admin endpoint is guarded by
 * IsAdminUser on the server, so hiding the page here is about not showing a
 * dead end, not about access control.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSessionRole()

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" aria-busy="true">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!data?.is_staff) {
    return (
      <Card className="items-center gap-3 px-6 py-16 text-center">
        <ShieldAlertIcon className="size-10 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">Administrators only</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account does not have the permissions for this area.
        </p>
      </Card>
    )
  }

  return <>{children}</>
}
