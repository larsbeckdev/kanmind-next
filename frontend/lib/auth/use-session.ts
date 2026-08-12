"use client"

import { useSyncExternalStore } from "react"

import { readSession, subscribeToSession } from "@/lib/auth/session"
import type { Session } from "@/lib/auth/session"

/**
 * The session lives in localStorage, which React cannot observe on its own.
 * useSyncExternalStore keeps a cached snapshot so the hook returns a stable
 * reference between renders and still reacts to logins in other tabs.
 */
let snapshot: Session | null = readSessionSafely()
let snapshotSource = JSON.stringify(snapshot)

function readSessionSafely(): Session | null {
  return typeof window === "undefined" ? null : readSession()
}

function getSnapshot(): Session | null {
  const next = readSessionSafely()
  const nextSource = JSON.stringify(next)
  if (nextSource !== snapshotSource) {
    snapshot = next
    snapshotSource = nextSource
  }
  return snapshot
}

function getServerSnapshot(): Session | null {
  return null
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribeToSession, getSnapshot, getServerSnapshot)
}

export function getInitials(fullname: string): string {
  const parts = fullname.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "?"
  }
  const [first, ...rest] = parts
  const last = rest.at(-1)
  return (first[0] + (last?.[0] ?? "")).toUpperCase()
}
