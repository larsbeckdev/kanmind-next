import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { AppProviders } from "@/components/app-providers"
import { cn } from "@/lib/utils"

const mulish = localFont({
  variable: "--font-mulish",
  display: "swap",
  src: [
    { path: "./fonts/mulish-v13-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/mulish-v13-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/mulish-v13-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/mulish-v13-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/mulish-v13-latin-800.woff2", weight: "800", style: "normal" },
  ],
})

export const metadata: Metadata = {
  title: {
    default: "KanMind",
    template: "%s · KanMind",
  },
  description:
    "KanMind is a kanban board for small teams: shared boards, tasks with reviewers and a comment thread per ticket.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark antialiased font-sans", mulish.variable)}
    >
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
