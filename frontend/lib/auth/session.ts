/**
 * The KanMind backend authenticates with a DRF token that the client has to
 * send on every request, so the token lives in localStorage. That makes it
 * readable by any script on the page - acceptable for this project, but not a
 * pattern to copy into an app that can use httpOnly cookies instead.
 */

const STORAGE_KEY = "kanmind.session"
const SESSION_CHANGED_EVENT = "kanmind:session-changed"

export type Session = {
  token: string
  userId: number
  email: string
  fullname: string
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.token === "string" &&
    typeof candidate.userId === "number" &&
    typeof candidate.email === "string" &&
    typeof candidate.fullname === "string"
  )
}

export function readSession(): Session | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeSession(session: Session): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export function getAuthToken(): string | null {
  return readSession()?.token ?? null
}

/** Subscribes to session changes from this tab and from other tabs. */
export function subscribeToSession(onChange: () => void): () => void {
  window.addEventListener(SESSION_CHANGED_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}
