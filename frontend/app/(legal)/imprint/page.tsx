import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Imprint",
}

export default function ImprintPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">Imprint</h1>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Legal notice</h2>
        <address className="grid gap-1 text-sm not-italic text-muted-foreground">
          <p>
            <strong className="text-foreground">Name:</strong> Max Mustermann
          </p>
          <p>
            <strong className="text-foreground">Address:</strong> Sample Street 1,
            12345 Sample City
          </p>
          <p>
            <strong className="text-foreground">Phone:</strong>{" "}
            <a href="tel:+44123456789" className="text-primary hover:underline">
              +44 123 456 789
            </a>
          </p>
          <p>
            <strong className="text-foreground">E-Mail:</strong>{" "}
            <a href="mailto:info@example.com" className="text-primary hover:underline">
              info@example.com
            </a>
          </p>
        </address>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Disclaimer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Despite careful content control, we assume no liability for the content
          of external links. The operators of the linked pages are solely
          responsible for their content.
        </p>
      </section>
    </article>
  )
}
