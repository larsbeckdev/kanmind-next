import type { Metadata } from "next"
import Link from "next/link"

import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Sign up",
}

export default function RegisterPage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          One account, every board you are invited to.
        </p>
      </header>

      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
