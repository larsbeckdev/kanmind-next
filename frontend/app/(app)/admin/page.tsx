import type { Metadata } from "next"

import { AdminGate } from "@/components/admin/admin-gate"
import { AdminUsersView } from "@/components/admin/admin-users-view"

export const metadata: Metadata = {
  title: "Administration",
}

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminUsersView />
    </AdminGate>
  )
}
