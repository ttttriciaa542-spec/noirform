import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
  variant?: "floating" | "inline";
}

export function WishlistButton({
  productId,
  productName,
  className,
  variant = "floating",
}: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useShop();
  const active = isWishlisted(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(productId);
        toast(active ? "Removed from wishlist" : "Saved to wishlist", {
          description: productName,
        });
      }}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        variant === "floating"
          ? "size-9 bg-background/80 backdrop-blur-sm hover:bg-background"
          : "size-10 border border-border hover:bg-secondary",
        className,
      )}
    >
      <Heart
        className={cn("size-4", active ? "fill-accent text-accent" : "text-foreground")}
        aria-hidden="true"
      />
    </button>
  );
}
