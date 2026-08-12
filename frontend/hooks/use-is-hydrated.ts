"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * True from the first client render on. useSyncExternalStore is used instead
 * of a state flag in an effect, because it reports the difference between the
 * server and the client snapshot without triggering a cascading render.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
