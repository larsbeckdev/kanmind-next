import Link from "next/link"

import { cn } from "@/lib/utils"

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border/60 bg-surface-sunken", className)}>
      <nav
        aria-label="Legal"
        className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-xs text-muted-foreground sm:px-6"
      >
        <Link href="/privacy" className="transition-colors hover:text-primary">
          Privacy Policy
        </Link>
        <Link href="/imprint" className="transition-colors hover:text-primary">
          Imprint
        </Link>
      </nav>
    </footer>
  )
}
