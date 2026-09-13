import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Collections", to: "/collections" },
  { label: "About", to: "/about" },
] as const;

const MOBILE_EXTRA = [
  { label: "Sale", to: "/sale" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "My Account", to: "/account" },
  { label: "Contact", to: "/contact" },
] as const;

export function Header() {
  const { cartCount, setCartOpen, setSearchOpen, wishlist } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !overHero || menuOpen;

  return (
    <>
      <a
        href="#main"
        className="label-caps sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "border-b border-border/70 bg-background/95 text-foreground backdrop-blur-md"
            : "border-b border-transparent bg-transparent text-background",
        )}
      >
        <div className="edge grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 md:h-16 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="-ml-2 grid size-10 place-items-center lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
            <Link to="/" className="hidden lg:block">
              <Wordmark />
            </Link>
          </div>

          {/* Center */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    className="label-caps relative py-2 text-[0.6875rem] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 data-[status=active]:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link to="/" className="justify-self-center lg:hidden">
            <Wordmark compact />
          </Link>

          {/* Right */}
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center"
            >
              <Search className="size-[1.05rem]" aria-hidden="true" />
            </button>
            <Link
              to="/account"
              aria-label="Account"
              className="hidden size-10 place-items-center lg:grid"
            >
              <User className="size-[1.05rem]" aria-hidden="true" />
            </Link>
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} saved`}
              className="relative hidden size-10 place-items-center lg:grid"
            >
              <Heart className="size-[1.05rem]" aria-hidden="true" />
              {wishlist.length > 0 ? <Dot /> : null}
            </Link>
            <button
              type="button"
              aria-label={`Bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              onClick={() => setCartOpen(true)}
              className="relative -mr-2 grid size-10 place-items-center"
            >
              <ShoppingBag className="size-[1.05rem]" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute top-1.5 right-1 min-w-4 rounded-full bg-accent px-1 text-[0.625rem] leading-4 font-medium text-accent-foreground tabular-nums">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background transition-opacity duration-300 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile" className="edge flex h-full flex-col pt-20 pb-24">
          <ul className="space-y-1">
            {NAV.map((item, index) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-lg font-medium block py-2"
                  style={menuOpen ? { animationDelay: `${index * 40}ms` } : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-3 border-t border-border pt-8">
            {MOBILE_EXTRA.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="label-caps block text-muted-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-auto text-muted-foreground">@bigdotcollections</p>
        </nav>
      </div>
    </>
  );
}

function Dot() {
  return <span className="absolute top-2.5 right-2 size-1.5 rounded-full bg-accent" />;
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
      <span
        className={cn(
          "font-display leading-none tracking-[0.14em] uppercase",
          compact ? "text-[0.8rem]" : "text-sm",
        )}
      >
        BigDot<span className="opacity-60">Collections</span>
      </span>
    </span>
  );
}
