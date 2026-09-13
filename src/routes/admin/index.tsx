import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownRight, Package, ShoppingCart, Users, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/pricing";
import { fetchAdminDashboardStats, fetchAdminOrders, fetchAdminProducts } from "@/lib/admin-store";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["/admin/dashboard/stats"],
    queryFn: fetchAdminDashboardStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/admin/orders"],
    queryFn: fetchAdminOrders,
    initialData: [],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/admin/products"],
    queryFn: fetchAdminProducts,
    initialData: [],
  });

  const isLoading = statsLoading || ordersLoading || productsLoading;
  const error = statsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="display-xl text-3xl sm:text-4xl">Dashboard</h1></div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div><h1 className="display-xl text-3xl sm:text-4xl">Dashboard</h1></div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="size-8 text-red-500" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          <Button variant="outline" onClick={() => refetchStats()}>
            <RefreshCw className="size-4 mr-2" />Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-xl text-3xl sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} change={stats.revenueGrowthMoM} icon={CreditCard} />
        <StatCard title="Orders" value={String(stats.totalOrders)} change={stats.ordersGrowthMoM} icon={ShoppingCart} />
        <StatCard title="Customers" value={String(stats.totalCustomers)} change={12.5} icon={Users} />
        <StatCard title="Avg Order Value" value={formatPrice(stats.averageOrderValue)} change={8.3} icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.revenueByDay.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No revenue data yet
              </div>
            ) : (
              <div className="space-y-3">
                {stats.revenueByDay.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span>{formatPrice(day.revenue)}</span>
                      <Badge variant="secondary" className="text-xs">{day.orders} orders</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-secondary transition-colors">
              <Package className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Add Product</span>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-secondary transition-colors">
              <ShoppingCart className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">View Orders</span>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-secondary transition-colors">
              <CreditCard className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Create Discount</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <span className="label-caps text-muted-foreground">View all</span>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.slice(0, 5).map((order) => {
                    const customerName = order.customerSnapshot?.fullName ?? order.customer?.name ?? order.shipping?.fullName ?? "Customer";
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.reference}</TableCell>
                        <TableCell>{customerName}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <span className="label-caps text-muted-foreground">Manage</span>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                All products in stock
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.map((p) => (
                  <div key={p.productId} className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm font-medium">{p.productName}</span>
                    <Badge variant="destructive">{p.stock} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon }: { title: string; value: string; change: number; icon: typeof CreditCard }) {
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
          {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(change)}%
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardContent,
});
