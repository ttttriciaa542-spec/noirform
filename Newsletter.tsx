import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Frontend only for now: connect this to the newsletter/email backend later.
    toast("Almost there", {
      description: "Newsletter sign-up will be live once the backend is connected.",
    });
    setEmail("");
  }

  return (
    <section aria-labelledby="newsletter-title" className="edge py-16 md:py-20">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="eyebrow text-muted-foreground">Newsletter</p>
        <h2 id="newsletter-title" className="display-xl mt-3 text-3xl sm:text-4xl">
          Join the BigDot list
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Be the first to know about new drops, exclusive pieces and special offers.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-12 flex-1 border border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="label-caps h-12 bg-primary px-8 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Join us
          </button>
        </form>
      </Reveal>
    </section>
  );
}
