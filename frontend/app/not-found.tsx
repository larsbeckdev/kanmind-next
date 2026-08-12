import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="surface-grid flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href="/" width={128} />
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page does not exist, or the board behind it is not shared with you.
      </p>
      <Button size="lg" className="h-9" render={<Link href="/boards" />}>
        Back to your boards
      </Button>
    </div>
  )
}
