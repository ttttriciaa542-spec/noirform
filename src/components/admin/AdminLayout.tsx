import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Tag, Palette, Truck, Settings, HelpCircle, ScrollText,
  X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/sales", label: "Sales", icon: BarChart3 },
  { to: "/admin/discounts", label: "Discounts", icon: Tag },
  { to: "/admin/appearance", label: "Appearance", icon: Palette },
  { to: "/admin/delivery", label: "Delivery", icon: Truck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/help", label: "Help", icon: HelpCircle },
  { to: "/admin/activity-logs", label: "Activity Logs", icon: ScrollText },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const isSidebarVisible = !isMobile || sidebarOpen;

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar flex flex-col transition-transform duration-300",
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
          !isSidebarVisible && "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="font-display text-sm tracking-[0.14em] uppercase">
              BigDot<span className="opacity-60">Collections</span>
            </span>
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="grid size-8 place-items-center" aria-label="Close menu">
              <X className="size-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-0.5",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-[1.05rem]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="label-caps text-[0.55rem] text-muted-foreground">@bigdotcollections</p>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="grid size-10 place-items-center" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display text-sm tracking-[0.14em] uppercase">Admin</span>
        </div>
        <main className="px-5 md:px-8 lg:px-12 py-6 md:py-8 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
