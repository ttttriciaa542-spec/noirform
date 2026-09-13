import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAdminDashboardStats } from "@/lib/admin-store";
import { formatPrice } from "@/lib/pricing";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

function AdminSalesContent() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/dashboard/stats"],
    queryFn: fetchAdminDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="display-xl text-3xl sm:text-4xl">Sales</h1></div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div><h1 className="display-xl text-3xl sm:text-4xl">Sales</h1></div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="size-8 text-red-500" />
          <p className="text-sm text-muted-foreground">Failed to load sales data</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />Retry
          </Button>
        </div>
      </div>
    );
  }

  const chartData = stats.revenueByDay.slice(-14);
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
      <div className="space-y-6">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Sales</h1>
          <p className="mt-2 text-sm text-muted-foreground">Revenue analytics and performance</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} change={stats.revenueGrowthMoM} icon={DollarSign} />
          <StatCard title="Orders" value={String(stats.totalOrders)} change={stats.ordersGrowthMoM} icon={ShoppingBag} />
          <StatCard title="Customers" value={String(stats.totalCustomers)} change={12.5} icon={Users} />
          <StatCard title="Avg Order Value" value={formatPrice(stats.averageOrderValue)} change={8.3} icon={DollarSign} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No revenue data yet
              </div>
            ) : (
              <div className="space-y-2">
                {chartData.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-muted-foreground shrink-0">{day.date.slice(5)}</span>
                    <div className="flex-1 h-6 bg-secondary rounded-sm relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-clay rounded-sm transition-all"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs font-medium">{formatPrice(day.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
              ) : (
                stats.topProducts.map((p) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <span className="text-sm">{p.productName}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPrice(p.revenue)}</div>
                      <div className="text-xs text-muted-foreground">{p.unitsSold} sold</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Top Categories</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {stats.topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
              ) : (
                stats.topCategories.map((c) => (
                  <div key={c.categoryId} className="flex items-center justify-between">
                    <span className="text-sm">{c.categoryName}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPrice(c.revenue)}</div>
                      <div className="text-xs text-muted-foreground">{c.orders} orders</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

function StatCard({ title, value, change, icon: Icon }: { title: string; value: string; change: number; icon: typeof TrendingUp }) {
  const positive = change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center gap-1 text-xs mt-1 ${positive ? `text-green-600` : `text-red-600`}`}>
          {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(change)}%
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/admin/sales")({
  component: AdminSalesContent,
});
