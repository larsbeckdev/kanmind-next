import { z } from "zod"

import { clearSession, getAuthToken } from "@/lib/auth/session"

const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000"
const FALLBACK_API_BASE_URL = `http://127.0.0.1:${DEFAULT_API_PORT}/api`

/**
 * NEXT_PUBLIC_API_BASE_URL wins when it is configured. Without it the API is
 * assumed to run on NEXT_PUBLIC_API_PORT (8000 in development) of the same
 * host the page was loaded from, so opening the app through the LAN address
 * or a server address does not send the browser to its own loopback
 * interface. Both values are inlined at build time.
 */
export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured) {
    return configured.replace(/\/+$/, "")
  }
  if (typeof window === "undefined") {
    return FALLBACK_API_BASE_URL
  }
  return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api`
}

type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function toFieldErrors(payload: unknown): FieldErrors {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {}
  }
  const result: FieldErrors = {}
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      result[key] = [value]
    } else if (Array.isArray(value)) {
      result[key] = value.map(String)
    }
  }
  return result
}

/** Turns a DRF error body into a single sentence that can go into a toast. */
function toMessage(status: number, fieldErrors: FieldErrors): string {
  const detail = fieldErrors.detail?.[0]
  if (detail) {
    return detail
  }
  const first = Object.entries(fieldErrors)[0]
  if (first) {
    const [field, messages] = first
    return field === "non_field_errors"
      ? messages[0]
      : `${field}: ${messages[0]}`
  }
  if (status === 401) {
    return "Your session has expired. Please sign in again."
  }
  return `Request failed with status ${status}.`
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  /** Endpoints reachable without a token (login, registration). */
  anonymous?: boolean
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function request<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  options: RequestOptions = {}
): Promise<z.output<S>> {
  const { method = "GET", body, anonymous = false } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }
  if (!anonymous) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Token ${token}`
    }
  }

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      0,
      `Could not reach the KanMind API at ${apiBaseUrl()}. Is the backend running?`
    )
  }

  const payload = await readBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }
    const fieldErrors = toFieldErrors(payload)
    throw new ApiError(response.status, toMessage(response.status, fieldErrors), fieldErrors)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      "The API returned a response that does not match the expected format."
    )
  }
  return parsed.data
}

/** DELETE endpoints answer with 204 and no body. */
export const emptyResponseSchema = z.unknown().transform((): void => undefined)
