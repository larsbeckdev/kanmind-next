"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteUser,
  getSessionRole,
  listUsers,
  updateUser,
} from "@/lib/api/admin"
import type { UserRole } from "@/lib/api/admin"
import { queryKeys } from "@/lib/api/query-keys"
import { useSession } from "@/lib/auth/use-session"

/** The login payload carries no permission flags, so the role is fetched. */
export function useSessionRole() {
  const session = useSession()

  return useQuery({
    queryKey: queryKeys.sessionRole,
    queryFn: getSessionRole,
    enabled: session !== null,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIsAdmin(): boolean {
  const { data } = useSessionRole()
  return data?.is_staff === true
}

export function useAdminUsers(search: string) {
  return useQuery({
    queryKey: queryKeys.adminUsers(search),
    queryFn: () => listUsers(search),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: { role?: UserRole; is_active?: boolean }
    }) => updateUser(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersAll })
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessionRole })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersAll })
      // Deleting an account removes the boards they own.
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
  })
}
