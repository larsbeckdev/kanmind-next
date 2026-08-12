import Image from "next/image"

import { SessionGate } from "@/components/auth/session-gate"
import { Logo } from "@/components/brand/logo"
import { SiteFooter } from "@/components/layout/site-footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate expects="guest" redirectTo="/dashboard">
      <div className="flex min-h-dvh flex-col">
        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <section className="surface-grid relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
            <Image
              src="/brand/login-background.svg"
              alt=""
              aria-hidden
              fill
              priority
              className="pointer-events-none object-cover opacity-15"
            />
            <Logo href="/login" width={128} className="relative" />

            <div className="relative max-w-md">
              <h1 className="font-heading text-4xl leading-tight font-bold text-primary">
                Boards that stay
                <br />
                out of the way.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                KanMind keeps a small team on the same page: shared boards, a
                reviewer per ticket and a comment thread where the discussion
                actually belongs.
              </p>
              <Image
                src="/brand/shake-hands.png"
                alt=""
                aria-hidden
                width={260}
                height={160}
                className="mt-10 h-auto opacity-90"
              />
            </div>

            <p className="relative text-xs text-muted-foreground">
              Developer Akademie · Backend module
            </p>
          </section>

          <main className="flex flex-col justify-center px-4 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-sm">
              <Logo href="/login" className="mb-8 lg:hidden" />
              {children}
            </div>
          </main>
        </div>
        <SiteFooter />
      </div>
    </SessionGate>
  )
}
