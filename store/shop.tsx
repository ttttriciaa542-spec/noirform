/**
 * Client-side storefront state: cart, wishlist and UI overlays.
 *
 * Persistence is intentionally isolated in `persist()` / `hydrate()` below.
 * When the backend arrives, swap those two for API calls (or sync on login)
 * without touching any component.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Product } from "@/lib/types";

const CART_KEY = "bdc.cart.v1";
const WISHLIST_KEY = "bdc.wishlist.v1";

interface State {
  cart: CartLine[];
  wishlist: string[];
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; cart: CartLine[]; wishlist: string[] }
  | { type: "add"; line: CartLine }
  | { type: "remove"; key: string }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "clearCart" }
  | { type: "toggleWishlist"; productId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, cart: action.cart, wishlist: action.wishlist, hydrated: true };
    case "add": {
      const existing = state.cart.find((l) => l.key === action.line.key);
      const cart = existing
        ? state.cart.map((l) =>
            l.key === action.line.key ? { ...l, quantity: l.quantity + action.line.quantity } : l,
          )
        : [...state.cart, action.line];
      return { ...state, cart };
    }
    case "remove":
      return { ...state, cart: state.cart.filter((l) => l.key !== action.key) };
    case "setQty":
      return {
        ...state,
        cart: state.cart
          .map((l) => (l.key === action.key ? { ...l, quantity: Math.max(1, action.quantity) } : l))
          .filter((l) => l.quantity > 0),
      };
    case "clearCart":
      return { ...state, cart: [] };
    case "toggleWishlist":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    default:
      return state;
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const SHIPPING_FLAT_RATE = 35;
export const FREE_SHIPPING_THRESHOLD = 800;

interface ShopContextValue extends State {
  addToCart: (
    product: Product,
    options: { size: string; color: string; quantity?: number },
  ) => void;
  removeFromCart: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { cart: [], wishlist: [], hydrated: false });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    dispatch({
      type: "hydrate",
      cart: read<CartLine[]>(CART_KEY, []),
      wishlist: read<string[]>(WISHLIST_KEY, []),
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlist));
  }, [state.cart, state.wishlist, state.hydrated]);

  const addToCart: ShopContextValue["addToCart"] = useCallback((product, options) => {
    const quantity = options.quantity ?? 1;
    dispatch({
      type: "add",
      line: {
        key: `${product.id}::${options.size}::${options.color}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price: product.price,
        ...(product.originalPrice != null ? { originalPrice: product.originalPrice } : {}),
        size: options.size,
        color: options.color,
        quantity,
      },
    });
  }, []);

  const value = useMemo<ShopContextValue>(() => {
    const subtotal = state.cart.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
    return {
      ...state,
      addToCart,
      removeFromCart: (key) => dispatch({ type: "remove", key }),
      setQuantity: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
      clearCart: () => dispatch({ type: "clearCart" }),
      toggleWishlist: (productId) => dispatch({ type: "toggleWishlist", productId }),
      isWishlisted: (productId) => state.wishlist.includes(productId),
      cartCount: state.cart.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
    };
  }, [state, addToCart, cartOpen, searchOpen]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
