import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type LogoProps = {
  href?: string
  className?: string
  width?: number
}

const ASPECT_RATIO = 85 / 40

export function Logo({ href = "/dashboard", className, width = 106 }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="KanMind home"
      className={cn(
        "inline-flex shrink-0 rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        className
      )}
    >
      <Image
        src="/brand/logo.svg"
        alt="KanMind"
        width={width}
        height={Math.round(width / ASPECT_RATIO)}
        priority
      />
    </Link>
  )
}
