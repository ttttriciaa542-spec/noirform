import { Link } from "@tanstack/react-router";
import { Heart, Home, Search, ShoppingBag, Shirt } from "lucide-react";
import { useShop } from "@/store/shop";

export function BottomNav() {
  const { cartCount, setCartOpen, setSearchOpen } = useShop();
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
        <button type="button" onClick={() => setSearchOpen(true)} className={item}>
          <Search className="size-[1.05rem]" aria-hidden="true" />
          Search
        </button>
        <Link to="/wishlist" className={item}>
          <Heart className="size-[1.05rem]" aria-hidden="true" />
          Saved
        </Link>
        <button type="button" onClick={() => setCartOpen(true)} className={`${item} relative`}>
          <ShoppingBag className="size-[1.05rem]" aria-hidden="true" />
          Bag
          {cartCount > 0 ? (
            <span className="absolute top-1.5 right-[22%] min-w-4 rounded-full bg-accent px-1 text-[0.625rem] leading-4 text-accent-foreground tabular-nums">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}
