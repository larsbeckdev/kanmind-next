"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  ShieldCheckIcon,
  SquareKanbanIcon,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Logo } from "@/components/brand/logo"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsAdmin } from "@/hooks/use-admin"
import { clearSession } from "@/lib/auth/session"
import { useSession } from "@/lib/auth/use-session"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/boards", label: "Boards", icon: SquareKanbanIcon },
]

const ADMIN_NAV_ITEM = {
  href: "/admin",
  label: "Admin",
  icon: ShieldCheckIcon,
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = useSession()
  const isAdmin = useIsAdmin()
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS

  function handleLogout() {
    clearSession()
    queryClient.clear()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface-sunken/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-card text-primary"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="ml-auto rounded-full focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <UserAvatar fullname={session.fullname} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-semibold">{session.fullname}</p>
                <p className="truncate text-xs text-muted-foreground">{session.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  )
}
