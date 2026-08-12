import { request } from "@/lib/api/client"
import { authResponseSchema, userShortSchema } from "@/lib/api/types"
import type { AuthResponse, UserShort } from "@/lib/api/types"

export type LoginPayload = {
  email: string
  password: string
}

export type RegistrationPayload = {
  fullname: string
  email: string
  password: string
  repeated_password: string
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request("/login/", authResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}

export function register(payload: RegistrationPayload): Promise<AuthResponse> {
  return request("/registration/", authResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}

/** Resolves the user behind an e-mail address, or null when it is unknown. */
export function checkEmail(email: string): Promise<UserShort> {
  return request(
    `/email-check/?email=${encodeURIComponent(email)}`,
    userShortSchema
  )
}
