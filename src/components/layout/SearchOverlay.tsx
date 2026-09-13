import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { fetchProducts, suggestedSearches } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { useShop } from "@/store/shop";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    setTerm("");
    setResults([]);
    return undefined;
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const query = useMemo(() => term.trim(), [term]);

  useEffect(() => {
    let cancelled = false;
    if (query.length < 2) {
      setResults([]);
      return () => {
        cancelled = true;
      };
    }
    const id = window.setTimeout(() => {
      void fetchProducts({ search: query, limit: 6 }).then((items) => {
        if (!cancelled) setResults(items);
      });
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-sm">
      <div className="edge flex h-16 items-center justify-between border-b border-border">
        <span className="label-caps text-xs">Search</span>
        <button
          type="button"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
          className="p-2"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="edge max-h-[calc(100svh-4rem)] overflow-y-auto py-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!query) return;
            setSearchOpen(false);
            void navigate({ to: "/search", search: { q: query } });
          }}
          className="flex items-center gap-3 border-b border-foreground pb-3"
          role="search"
        >
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            type="search"
            aria-label="Search products"
            placeholder="Search for bikinis, dresses, sets…"
            className="display-xl w-full bg-transparent text-2xl outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
          />
        </form>

        {query.length < 2 ? (
          <div className="mt-8">
            <p className="label-caps text-xs text-muted-foreground">Popular searches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setTerm(suggestion)}
                  className="border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No matches for “{query}”. Try another word.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-border">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-secondary"
                >
                  <img
                    src={product.images[0]?.url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="size-16 shrink-0 object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
