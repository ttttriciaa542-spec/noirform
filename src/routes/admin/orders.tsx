import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, RefreshCw, Loader2, Eye, ImageIcon } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/pricing";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/admin-store";
import type { AdminOrder } from "@/lib/admin-types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-500/10 text-blue-700 border-blue-200",
  processing: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  shipped: "bg-purple-500/10 text-purple-700 border-purple-200",
  delivered: "bg-green-500/10 text-green-700 border-green-200",
  cancelled: "bg-red-500/10 text-red-700 border-red-200",
  refunded: "bg-gray-500/10 text-gray-700 border-gray-200",
};

const ORDER_ACTIONS: AdminOrder["status"][] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for delivery",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

function AdminOrdersContent() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/orders"],
    queryFn: fetchAdminOrders,
    initialData: [],
  });

  const handleStatusUpdate = (orderId: string, nextStatus: AdminOrder["status"]) => {
    updateAdminOrderStatus(orderId, nextStatus);
    queryClient.invalidateQueries({ queryKey: ["/admin/orders"] });
    setSelectedOrder((current) =>
      current && current.id === orderId
        ? {
            ...current,
            status: nextStatus,
            paymentStatus: nextStatus === "Refunded" ? "Refunded" : nextStatus === "Cancelled" ? "Failed" : "Paid",
          }
        : current,
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display-xl text-3xl sm:text-4xl">Orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage and track customer orders</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load orders</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4 mr-2" />Retry
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                        <p className="text-xs text-muted-foreground">Orders will appear here when customers place them</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const customerName = order.customerSnapshot?.fullName ?? order.customer?.name ?? order.shipping?.fullName ?? "Customer";
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.reference}</TableCell>
                        <TableCell>{customerName}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_STYLES[order.status.toLowerCase()] ?? ""} capitalize`}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.reference}`}>
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order {selectedOrder.reference}</DialogTitle>
              <DialogDescription>
                {selectedOrder.customerSnapshot?.fullName ?? selectedOrder.customer?.name ?? selectedOrder.shipping?.fullName ?? "Customer"} • {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Customer</p>
                  <p className="mt-2 font-medium">{selectedOrder.customerSnapshot?.fullName ?? selectedOrder.customer?.name ?? selectedOrder.shipping?.fullName ?? "Customer"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerSnapshot?.email ?? selectedOrder.customer?.email ?? ""}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerSnapshot?.phone ?? selectedOrder.customer?.phone ?? selectedOrder.shipping?.phone ?? ""}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Delivery</p>
                  <p className="mt-2 text-sm">{selectedOrder.deliveryMethod}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping?.region || "Region not set"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping?.city || "City not set"}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Payment</p>
                  <p className="mt-2 text-sm">{selectedOrder.payment?.method ?? "Card"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.paymentStatus}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.payment?.transactionId ?? selectedOrder.reference}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Totals</p>
                  <p className="mt-2 text-sm">Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
                  <p className="text-sm">Shipping: {formatPrice(selectedOrder.shippingFee)}</p>
                  <p className="text-sm font-medium">Total: {formatPrice(selectedOrder.total)}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Items ordered</p>
                  <div className="mt-3 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={`${selectedOrder.id}-${item.productId}-${item.size}-${item.color}`} className="flex gap-3 rounded-md border border-border p-2">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="size-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.size} • {item.color || "Standard"} • Qty {item.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.sku ?? item.productId}</p>
                        </div>
                        <div className="text-right text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Shipping address</p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{selectedOrder.shipping?.fullName ?? selectedOrder.customer?.name ?? "Customer"}</p>
                      <p>{selectedOrder.shipping?.street ?? "Street not set"}</p>
                      <p>{selectedOrder.shipping?.city ?? "City not set"}</p>
                      <p>{selectedOrder.shipping?.region ?? "Region not set"}</p>
                      <p>{selectedOrder.shipping?.phone ?? selectedOrder.customer?.phone ?? "Phone not set"}</p>
                      {selectedOrder.shipping?.instructions ? <p>Notes: {selectedOrder.shipping.instructions}</p> : null}
                    </div>
                  </div>

                  {selectedOrder.notes ? (
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Notes</p>
                      <p className="mt-2 text-sm text-muted-foreground">{selectedOrder.notes}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {ORDER_ACTIONS.map((status) => (
                  <Button
                    key={status}
                    variant={selectedOrder.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersContent,
});
