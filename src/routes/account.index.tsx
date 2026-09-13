import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Account — BigDotCollections" },
      { name: "description", content: "Sign in or create your BigDotCollections account." },
      { property: "og:title", content: "Account — BigDotCollections" },
      { property: "og:description", content: "Sign in or create an account." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Accounts are not wired to a backend yet.
    toast("Accounts aren't live yet", {
      description: "Sign-in will work once the backend is connected.",
    });
  };

  return (
    <>
      <PageHeader eyebrow="Members" title="Your account" />
      <div className="edge pb-24">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-2 border border-border">
            {(["signin", "register"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                className={cn(
                  "label-caps py-3 text-[0.625rem] transition-colors",
                  mode === option ? "bg-foreground text-background" : "hover:bg-secondary",
                )}
              >
                {option === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="text-xs text-muted-foreground">Full name</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs text-muted-foreground">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="mt-1.5 h-12 w-full border border-border bg-background px-3 text-sm outline-none focus-visible:border-foreground"
              />
            </label>
            <button
              type="submit"
              className="label-caps h-12 w-full bg-foreground text-background transition-opacity hover:opacity-90"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Accounts and order history aren't live yet.{" "}
            <Link to="/account/orders" className="underline">
              Preview orders
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
