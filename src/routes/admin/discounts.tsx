import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, RefreshCw, Loader2, Plus, Trash2, Edit3, Percent } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addAdminDiscount, deleteAdminDiscount, fetchAdminDiscounts, updateAdminDiscount } from "@/lib/admin-store";
import type { Discount } from "@/lib/admin-types";

const emptyDraft = (): Omit<Discount, "id" | "createdAt" | "usageCount"> & { id?: string } => ({
  name: "",
  code: "",
  type: "Percentage",
  amount: 10,
  scope: "Store-wide",
  minimumAmount: 0,
  usageLimit: 100,
  customerUsageLimit: 1,
  active: true,
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
});

function AdminDiscountsContent() {
  const queryClient = useQueryClient();
  const { data: discounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/discounts"],
    queryFn: fetchAdminDiscounts,
  });
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (discounts.length === 0) return "0 active";
    return `${discounts.filter((item) => item.active).length} active`;
  }, [discounts]);

  const resetDraft = () => {
    setDraft(emptyDraft());
    setEditingId(null);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.code.trim()) return;

    const payload: Discount = {
      id: editingId ?? `disc-${Date.now()}`,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      type: draft.type,
      amount: Number(draft.amount) || 0,
      scope: draft.scope,
      minimumAmount: Number(draft.minimumAmount) || 0,
      usageLimit: Number(draft.usageLimit) || undefined,
      customerUsageLimit: Number(draft.customerUsageLimit) || 1,
      usageCount: editingId ? discounts.find((item) => item.id === editingId)?.usageCount ?? 0 : 0,
      active: draft.active,
      createdAt: editingId ? discounts.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
      startsAt: draft.startsAt,
      endsAt: draft.endsAt,
    };

    if (editingId) {
      updateAdminDiscount(payload);
    } else {
      addAdminDiscount(payload);
    }

    queryClient.invalidateQueries({ queryKey: ["/admin/discounts"] });
    resetDraft();
  };

  const handleEdit = (discount: Discount) => {
    setEditingId(discount.id);
    setDraft({
      ...discount,
      amount: discount.amount,
      minimumAmount: discount.minimumAmount,
      usageLimit: discount.usageLimit ?? 100,
      customerUsageLimit: discount.customerUsageLimit ?? 1,
    });
  };

  const handleDelete = (id: string) => {
    deleteAdminDiscount(id);
    queryClient.invalidateQueries({ queryKey: ["/admin/discounts"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Discounts</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create and manage store discounts and offers</p>
        </div>
        <Badge variant="secondary">{statusLabel}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Percent className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">{editingId ? "Edit discount" : "New discount"}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Name</label>
              <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Summer sale" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Code</label>
              <Input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} placeholder="SUMMER10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Type</label>
                <select
                  value={draft.type}
                  onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as Discount["type"] }))}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed amount">Fixed amount</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Amount</label>
                <Input type="number" value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Applies to</label>
                <select
                  value={draft.scope}
                  onChange={(event) => setDraft((current) => ({ ...current, scope: event.target.value as Discount["scope"] }))}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="Store-wide">Store-wide</option>
                  <option value="Product-specific">Product-specific</option>
                  <option value="Category">Category</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Minimum</label>
                <Input type="number" value={draft.minimumAmount} onChange={(event) => setDraft((current) => ({ ...current, minimumAmount: Number(event.target.value) }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Starts</label>
                <Input type="date" value={draft.startsAt ? draft.startsAt.slice(0, 10) : ""} onChange={(event) => setDraft((current) => ({ ...current, startsAt: new Date(`${event.target.value}T00:00:00`).toISOString() }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Ends</label>
                <Input type="date" value={draft.endsAt ? draft.endsAt.slice(0, 10) : ""} onChange={(event) => setDraft((current) => ({ ...current, endsAt: new Date(`${event.target.value}T00:00:00`).toISOString() }))} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <span className="text-sm">Enable this discount</span>
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} className="size-4" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={resetDraft}>Reset</Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <AlertCircle className="size-8 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load discounts</p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="size-4 mr-2" />Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No discounts yet</TableCell>
                  </TableRow>
                ) : (
                  discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">{discount.code}</TableCell>
                      <TableCell>{discount.name}</TableCell>
                      <TableCell>{discount.type}</TableCell>
                      <TableCell>{discount.type === "Percentage" ? `${discount.amount}%` : `GHS ${discount.amount}`}</TableCell>
                      <TableCell>
                        <Badge variant={discount.active ? "default" : "secondary"}>{discount.active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(discount)}>
                          <Edit3 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(discount.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/discounts")({
  component: AdminDiscountsContent,
});
