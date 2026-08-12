"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogInIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { writeSession } from "@/lib/auth/session"

const loginSchema = z.object({
  email: z.string().min(1, "Please enter your e-mail address.").email("Enter a valid e-mail address."),
  password: z.string().min(1, "Please enter your password."),
})

type LoginValues = z.infer<typeof loginSchema>

const GUEST_EMAIL = process.env.NEXT_PUBLIC_GUEST_EMAIL
const GUEST_PASSWORD = process.env.NEXT_PUBLIC_GUEST_PASSWORD

export function LoginForm() {
  const router = useRouter()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    try {
      const auth = await login(values)
      writeSession({
        token: auth.token,
        userId: auth.user_id,
        email: auth.email,
        fullname: auth.fullname,
      })
      router.replace("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        form.setError("password", { message: error.message })
        return
      }
      toast.error("Login failed. Please try again.")
    }
  }

  function fillGuestCredentials() {
    if (!GUEST_EMAIL || !GUEST_PASSWORD) {
      return
    }
    form.setValue("email", GUEST_EMAIL)
    form.setValue("password", GUEST_PASSWORD)
    void form.handleSubmit(onSubmit)()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      <Field label="E-Mail" htmlFor="email" error={form.formState.errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-9 text-sm"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
      </Field>

      <div className="grid gap-2">
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-10 w-full text-sm"
        >
          <LogInIcon data-icon="inline-start" />
          {form.formState.isSubmitting ? "Signing in…" : "Log in"}
        </Button>

        {GUEST_EMAIL && GUEST_PASSWORD ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={fillGuestCredentials}
            disabled={form.formState.isSubmitting}
            className="h-10 w-full text-sm"
          >
            Continue as guest
          </Button>
        ) : null}
      </div>
    </form>
  )
}
