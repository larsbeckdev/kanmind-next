import { z } from "zod"

import { emptyResponseSchema, request } from "@/lib/api/client"

export const USER_ROLES = ["admin", "staff", "user"] as const

export const userRoleSchema = z.enum(USER_ROLES)

export const adminUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullname: z.string(),
  role: userRoleSchema,
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  date_joined: z.string(),
  last_login: z.string().nullable(),
  owned_board_count: z.number(),
  board_count: z.number(),
})

export const sessionRoleSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullname: z.string(),
  role: userRoleSchema,
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
})

export type UserRole = z.infer<typeof userRoleSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type SessionRole = z.infer<typeof sessionRoleSchema>

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Staff",
  user: "User",
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access, including the Django admin and this user management.",
  staff: "May open the Django admin, but not manage other administrators.",
  user: "Regular account with access to their own boards only.",
}

/** Available to every signed in account - it only reports about itself. */
export function getSessionRole(): Promise<SessionRole> {
  return request("/admin/me/", sessionRoleSchema)
}

export function listUsers(search: string): Promise<AdminUser[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""
  return request(`/admin/users/${query}`, z.array(adminUserSchema))
}

export function updateUser(
  userId: number,
  payload: { role?: UserRole; is_active?: boolean }
): Promise<AdminUser> {
  return request(`/admin/users/${userId}/`, adminUserSchema, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteUser(userId: number): Promise<void> {
  return request(`/admin/users/${userId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
