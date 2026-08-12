import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in",
}

export default function LoginPage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to reach your boards.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
