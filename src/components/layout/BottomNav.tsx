import { Link } from "@tanstack/react-router";
import { Heart, Home, MapPin, Shirt, User } from "lucide-react";

export function BottomNav() {
  const item = "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.625rem] tracking-[0.1em] uppercase";

  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        <Link to="/" activeOptions={{ exact: true }} className={item}>
          <Home className="size-[1.05rem]" aria-hidden="true" />
          Home
        </Link>
        <Link to="/shop" className={item}>
          <Shirt className="size-[1.05rem]" aria-hidden="true" />
          Shop
        </Link>
        <Link to="/track-order" className={item}>
          <MapPin className="size-[1.05rem]" aria-hidden="true" />
          Track
        </Link>
        <Link to="/wishlist" className={item}>
          <Heart className="size-[1.05rem]" aria-hidden="true" />
          Saved
        </Link>
        <Link to="/account" className={item}>
          <User className="size-[1.05rem]" aria-hidden="true" />
          Account
        </Link>
      </div>
    </nav>
  );
}
