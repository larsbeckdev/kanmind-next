import { SessionGate } from "@/components/auth/session-gate"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate expects="user" redirectTo="/login">
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </div>
    </SessionGate>
  )
}
