import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="space-y-4 py-4">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-11 w-full" />
      </div>
    </div>
  );
}

export function LineSkeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}
