import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

export default function PrivacyPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Privacy Policy
      </h1>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">What we store</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          KanMind stores the name and e-mail address of your account, the boards
          you own or are a member of, and the tasks and comments you write. The
          authentication token is kept in the local storage of your browser and
          is removed when you log out.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Contact</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is a training project of the Developer Akademie backend module. No
          data is shared with third parties. For questions about your data, use
          the address in the imprint.
        </p>
      </section>
    </article>
  )
}
