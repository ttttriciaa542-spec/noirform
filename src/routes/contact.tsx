import { createFileRoute } from "@tanstack/react-router"
import type { FormEvent } from "react";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — BigDotCollections" },
      {
        name: "description",
        content: "Questions about sizing, delivery or an order? Reach the BigDotCollections team.",
      },
      { property: "og:title", content: "Contact Us — BigDotCollections" },
      { property: "og:description", content: "Reach the BigDotCollections team." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Messages aren't sent anywhere yet — this needs a backend.
    toast("Message not sent yet", {
      description: "The contact form will deliver messages once the backend is connected.",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Contact us"
        description="Sizing, delivery, or a change to your order — we're here."
      />
      <div className="edge grid gap-12 pb-24 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="max-w-xl space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Your name</span>
            <input
              name="name"
              required
              className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Message</span>
            <textarea
              name="message"
              rows={6}
              required
              className="mt-1.5 w-full resize-none border border-border bg-background p-3 text-sm outline-none focus-visible:border-foreground"
            />
          </label>
          <button
            type="submit"
            className="label-caps h-12 w-full bg-foreground text-background transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
          >
            Send message
          </button>
        </form>

        <aside className="space-y-6 text-sm">
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="label-caps text-[0.625rem]">Email</p>
              {/* Replace with the real address once confirmed. */}
              <p className="mt-1 text-muted-foreground">Add your email address here</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="label-caps text-[0.625rem]">WhatsApp</p>
              <p className="mt-1 text-muted-foreground">Add your WhatsApp number here</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="label-caps text-[0.625rem]">Based in</p>
              <p className="mt-1 text-muted-foreground">Accra, Ghana</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
