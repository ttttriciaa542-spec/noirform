import { Link, type LinkProps } from "@tanstack/react-router";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { Wordmark } from "./Header";
import { Newsletter } from "@/components/common/Newsletter";

type FooterLink = {
  label: string;
  to: NonNullable<LinkProps["to"]>;
  params?: Record<string, string>;
};

const shop: FooterLink[] = [
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Bikinis", to: "/shop/$category", params: { category: "bikinis" } },
  { label: "Swimwear", to: "/shop/$category", params: { category: "swimwear" } },
  { label: "Dresses", to: "/shop/$category", params: { category: "dresses" } },
  { label: "Tops", to: "/shop/$category", params: { category: "tops" } },
  { label: "Bottoms", to: "/shop/$category", params: { category: "bottoms" } },
  { label: "Sets", to: "/shop/$category", params: { category: "sets" } },
  { label: "Sale", to: "/sale" },
];

const help: FooterLink[] = [
  { label: "Contact Us", to: "/contact" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Returns & Exchanges", to: "/returns" },
  { label: "FAQs", to: "/faq" },
];

const about: FooterLink[] = [
  { label: "About BigDotCollections", to: "/about" },
  { label: "Our Story", to: "/about" },
  { label: "Collections", to: "/collections" },
];

const account: FooterLink[] = [
  { label: "My Account", to: "/account" },
  { label: "Orders", to: "/account/orders" },
  { label: "Wishlist", to: "/wishlist" },
];

const social = [
  { label: "Instagram", icon: Instagram },
  { label: "TikTok", icon: Music2 },
  { label: "Facebook", icon: Facebook },
];

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="label-caps text-muted-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              to={link.to}
              {...(link.params ? { params: link.params } : {})}
              className="text-sm hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <Newsletter />
      <div className="edge grid gap-10 border-t border-border py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Swimwear, essentials and statement pieces. Designed to be worn, and noticed.
          </p>
          <ul className="mt-6 flex gap-2">
            {social.map(({ label, icon: Icon }) => (
              <li key={label}>
                {/* Replace href with the brand's real social profile URLs. */}
                <a
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center border border-border transition-colors hover:bg-background"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Column title="Shop" links={shop} />
        <Column title="Help" links={help} />
        <Column title="About" links={about} />
        <Column title="Account" links={account} />
      </div>
      <div className="edge flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} BigDotCollections. All rights reserved.</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link to="/returns" className="hover:underline">
              Refund Policy
            </Link>
          </li>
          <li>
            <Link to="/shipping" className="hover:underline">
              Shipping Policy
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:underline">
              Terms & Conditions
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
