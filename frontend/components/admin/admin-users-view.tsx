"use client"

import * as React from "react"
import {
  SearchIcon,
  ShieldCheckIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/user-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminUsers, useDeleteUser, useUpdateUser } from "@/hooks/use-admin"
import { ApiError } from "@/lib/api/client"
import { ROLE_LABELS, USER_ROLES, userRoleSchema } from "@/lib/api/admin"
import type { AdminUser } from "@/lib/api/admin"
import { useSession } from "@/lib/auth/use-session"
import { formatDateTime } from "@/lib/format"

const ROLE_ITEMS = USER_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

const ROLE_ICONS = {
  admin: ShieldCheckIcon,
  staff: ShieldIcon,
  user: UserIcon,
} as const

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export function AdminUsersView() {
  const session = useSession()
  const [search, setSearch] = React.useState("")
  const { data: users, isPending, error } = useAdminUsers(search)
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [userToDelete, setUserToDelete] = React.useState<AdminUser | null>(null)

  async function changeRole(user: AdminUser, value: string) {
    const role = userRoleSchema.safeParse(value)
    if (!role.success || role.data === user.role) {
      return
    }
    try {
      await updateUser.mutateAsync({ userId: user.id, payload: { role: role.data } })
      toast.success(`${user.fullname} is now ${ROLE_LABELS[role.data]}.`)
    } catch (caught) {
      reportError(caught, "The role was not changed.")
    }
  }

  async function toggleActive(user: AdminUser, isActive: boolean) {
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        payload: { is_active: isActive },
      })
      toast.success(
        `${user.fullname} was ${isActive ? "activated" : "deactivated"}.`
      )
    } catch (caught) {
      reportError(caught, "The account was not changed.")
    }
  }

  async function confirmDelete() {
    if (!userToDelete) {
      return
    }
    try {
      await deleteUser.mutateAsync(userToDelete.id)
      toast.success(`${userToDelete.fullname} was deleted.`)
      setUserToDelete(null)
    } catch (caught) {
      reportError(caught, "The account was not deleted.")
    }
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-bold">User management</h1>
          <p className="text-sm text-muted-foreground">
            Roles, activation and accounts across the whole installation.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or e-mail"
            aria-label="Search users"
            className="h-9 pl-9 text-sm"
          />
        </div>
      </header>

      {error ? (
        <Card className="p-6 text-sm text-destructive">
          {error instanceof ApiError ? error.message : "Loading the users failed."}
        </Card>
      ) : isPending ? (
        <Skeleton className="h-72 rounded-lg" />
      ) : users.length === 0 ? (
        <Card className="px-6 py-16 text-center text-sm text-muted-foreground">
          No account matches this search.
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Boards</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === session?.userId
                const RoleIcon = ROLE_ICONS[user.role]

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <UserAvatar fullname={user.fullname} size="sm" />
                        <span className="grid leading-tight">
                          <span className="flex items-center gap-2 font-medium">
                            {user.fullname}
                            {isSelf ? (
                              <Badge variant="secondary" className="shrink-0">
                                You
                              </Badge>
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <Select
                        items={ROLE_ITEMS}
                        value={user.role}
                        disabled={isSelf || updateUser.isPending}
                        onValueChange={(value) => void changeRole(user, String(value))}
                      >
                        <SelectTrigger
                          className="h-8 w-40 text-sm"
                          aria-label={`Role of ${user.fullname}`}
                        >
                          <RoleIcon className="size-3.5 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-center">
                      <Checkbox
                        checked={user.is_active}
                        disabled={isSelf || updateUser.isPending}
                        aria-label={`${user.fullname} is active`}
                        onCheckedChange={(checked) => void toggleActive(user, checked)}
                      />
                    </TableCell>

                    <TableCell className="text-center text-muted-foreground">
                      {user.board_count}
                      {user.owned_board_count > 0 ? (
                        <span className="ml-1 text-xs">
                          ({user.owned_board_count} owned)
                        </span>
                      ) : null}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {user.last_login ? formatDateTime(user.last_login) : "never"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${user.fullname}`}
                        disabled={isSelf}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2Icon />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog
        open={userToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.fullname} owns {userToDelete?.owned_board_count ?? 0}{" "}
              board(s). Those boards and every task and comment on them are
              deleted together with the account. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteUser.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteUser.isPending ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
