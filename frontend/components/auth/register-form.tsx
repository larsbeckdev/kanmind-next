"use client"

import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register as registerUser } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { writeSession } from "@/lib/auth/session"

const MIN_PASSWORD_LENGTH = 8

const registerSchema = z
  .object({
    fullname: z.string().min(2, "Please enter your full name."),
    email: z.string().min(1, "Please enter your e-mail address.").email("Enter a valid e-mail address."),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`),
    repeated_password: z.string(),
    privacy: z
      .boolean()
      .refine((accepted) => accepted, "Please accept the privacy policy."),
  })
  .refine((values) => values.password === values.repeated_password, {
    path: ["repeated_password"],
    message: "The passwords do not match.",
  })

type RegisterValues = z.infer<typeof registerSchema>

/** Maps the DRF field names of the registration endpoint onto the form. */
const API_FIELD_MAP: Record<string, keyof RegisterValues> = {
  fullname: "fullname",
  email: "email",
  password: "password",
  repeated_password: "repeated_password",
}

export function RegisterForm() {
  const router = useRouter()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      repeated_password: "",
      privacy: false,
    },
  })

  const isPrivacyAccepted = useWatch({ control: form.control, name: "privacy" })

  async function onSubmit(values: RegisterValues) {
    try {
      const auth = await registerUser({
        fullname: values.fullname,
        email: values.email,
        password: values.password,
        repeated_password: values.repeated_password,
      })
      writeSession({
        token: auth.token,
        userId: auth.user_id,
        email: auth.email,
        fullname: auth.fullname,
      })
      router.replace("/dashboard")
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("Sign up failed. Please try again.")
        return
      }
      const entries = Object.entries(error.fieldErrors)
      if (entries.length === 0) {
        toast.error(error.message)
        return
      }
      for (const [field, messages] of entries) {
        const target = API_FIELD_MAP[field]
        if (target) {
          form.setError(target, { message: messages[0] })
        } else {
          toast.error(messages[0])
        }
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      <Field label="Full name" htmlFor="fullname" error={form.formState.errors.fullname?.message}>
        <Input
          id="fullname"
          autoComplete="name"
          placeholder="Ada Lovelace"
          className="h-9 text-sm"
          aria-invalid={Boolean(form.formState.errors.fullname)}
          {...form.register("fullname")}
        />
      </Field>

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

      <Field
        label="Password"
        htmlFor="password"
        error={form.formState.errors.password?.message}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
      </Field>

      <Field
        label="Confirm password"
        htmlFor="repeated_password"
        error={form.formState.errors.repeated_password?.message}
      >
        <PasswordInput
          id="repeated_password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(form.formState.errors.repeated_password)}
          {...form.register("repeated_password")}
        />
      </Field>

      <div className="grid gap-1.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="privacy"
            checked={isPrivacyAccepted}
            onCheckedChange={(checked) =>
              form.setValue("privacy", checked, { shouldValidate: true })
            }
          />
          <Label htmlFor="privacy" className="text-sm text-muted-foreground">
            I accept the privacy policy.
          </Label>
        </div>
        {form.formState.errors.privacy ? (
          <p role="alert" className="text-xs text-destructive">
            {form.formState.errors.privacy.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        className="h-10 w-full text-sm"
      >
        <UserPlusIcon data-icon="inline-start" />
        {form.formState.isSubmitting ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  )
}
