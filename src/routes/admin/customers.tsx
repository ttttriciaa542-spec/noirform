import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Loader2, Mail, Phone, MapPin, Plus } from "lucide-react";
import { fetchAdminCustomers } from "@/lib/admin-store";
import { formatPrice } from "@/lib/pricing";

function AdminCustomersContent() {
  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/customers"],
    queryFn: fetchAdminCustomers,
    initialData: [],
  });

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display-xl text-3xl sm:text-4xl">Customers</h1>
            <p className="mt-2 text-sm text-muted-foreground">View and manage customer accounts</p>
          </div>
          <Button><Plus className="size-4 mr-2" />Add Customer</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load customers</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4 mr-2" />Retry
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-xl border bg-card">
            <p className="text-sm text-muted-foreground">No customers yet</p>
            <p className="text-xs text-muted-foreground">Customer accounts will appear here after registration</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-xl border bg-card p-5 shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{customer.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <Badge variant={customer.isActive ? "default" : "secondary"} className="capitalize">
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="size-3" /> {customer.email}
                  </div>
                  {customer.phone ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="size-3" /> {customer.phone}
                    </div>
                  ) : null}
                  {customer.defaultAddress ? (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3 mt-0.5" /> {customer.defaultAddress.city}, {customer.defaultAddress.region}
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                    <div className="font-semibold text-sm">{formatPrice(customer.totalSpent)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Orders</div>
                    <div className="font-semibold text-sm">{customer.totalOrders}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersContent,
});
