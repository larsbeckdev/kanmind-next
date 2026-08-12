import { Logo } from "@/components/brand/logo"
import { SiteFooter } from "@/components/layout/site-footer"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/60 bg-surface-sunken">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:px-6">
          <Logo href="/" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}
