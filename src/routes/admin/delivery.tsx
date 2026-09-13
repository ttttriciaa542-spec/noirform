import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAdminDeliveryMethods, fetchAdminZones, saveAdminDeliveryMethods, saveAdminZones } from "@/lib/admin-store";
import { Truck, AlertCircle, RefreshCw, Loader2, Plus, Trash2 } from "lucide-react";

const emptyZone = () => ({
  id: `zone-${Date.now()}`,
  name: "",
  locations: "",
  fee: 0,
  freeThreshold: 0,
  estimatedMinDays: 3,
  estimatedMaxDays: 5,
  enabled: true,
});

const emptyMethod = (zoneId?: string) => ({
  id: `method-${Date.now()}`,
  name: "",
  description: "",
  zoneId: zoneId ?? "",
  rate: 0,
  estimatedDays: { min: 3, max: 5 },
  isActive: true,
});

export const Route = createFileRoute("/admin/delivery")({
  component: AdminDelivery,
});

function AdminDelivery() {
  const queryClient = useQueryClient();
  const { data: zones = [], isLoading: zonesLoading, error: zonesError, refetch: refetchZones } = useQuery({
    queryKey: ["/admin/zones"],
    queryFn: fetchAdminZones,
  });
  const { data: methods = [], isLoading: methodsLoading, error: methodsError } = useQuery({
    queryKey: ["/admin/delivery-methods"],
    queryFn: fetchAdminDeliveryMethods,
  });

  const [zoneDraft, setZoneDraft] = useState(emptyZone());
  const [methodDraft, setMethodDraft] = useState(emptyMethod(zones[0]?.id));

  const handleAddZone = () => {
    if (!zoneDraft.name.trim()) return;

    const nextZones = [
      ...zones,
      {
        ...zoneDraft,
        id: zoneDraft.id || `zone-${Date.now()}`,
        name: zoneDraft.name.trim(),
        locations: zoneDraft.locations.split(",").map((item) => item.trim()).filter(Boolean),
      },
    ];

    saveAdminZones(nextZones);
    queryClient.invalidateQueries({ queryKey: ["/admin/zones"] });
    setZoneDraft(emptyZone());
    setMethodDraft(emptyMethod(nextZones[0]?.id));
  };

  const handleAddMethod = () => {
    if (!methodDraft.name.trim()) return;

    const nextMethods = [
      ...methods,
      {
        ...methodDraft,
        id: methodDraft.id || `method-${Date.now()}`,
        name: methodDraft.name.trim(),
        description: methodDraft.description.trim() || "Delivery option",
        rate: Number(methodDraft.rate) || 0,
        estimatedDays: {
          min: Number(methodDraft.estimatedDays.min) || 3,
          max: Number(methodDraft.estimatedDays.max) || 5,
        },
      },
    ];

    saveAdminDeliveryMethods(nextMethods);
    queryClient.invalidateQueries({ queryKey: ["/admin/delivery-methods"] });
    setMethodDraft(emptyMethod(zones[0]?.id));
  };

  const handleDeleteZone = (id: string) => {
    const nextZones = zones.filter((zone) => zone.id !== id);
    saveAdminZones(nextZones);
    queryClient.invalidateQueries({ queryKey: ["/admin/zones"] });
  };

  const handleDeleteMethod = (id: string) => {
    const nextMethods = methods.filter((method) => method.id !== id);
    saveAdminDeliveryMethods(nextMethods);
    queryClient.invalidateQueries({ queryKey: ["/admin/delivery-methods"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-xl text-3xl sm:text-4xl">Delivery</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage shipping zones and methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="size-4" /> Shipping zones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Zone name</label>
              <Input value={zoneDraft.name} onChange={(event) => setZoneDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Greater Accra" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Locations</label>
              <Input value={zoneDraft.locations} onChange={(event) => setZoneDraft((current) => ({ ...current, locations: event.target.value }))} placeholder="Greater Accra, Ashanti" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Fee (GHS)</label>
              <Input type="number" value={zoneDraft.fee} onChange={(event) => setZoneDraft((current) => ({ ...current, fee: Number(event.target.value) }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Free over (GHS)</label>
              <Input type="number" value={zoneDraft.freeThreshold} onChange={(event) => setZoneDraft((current) => ({ ...current, freeThreshold: Number(event.target.value) }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddZone}>
              <Plus className="mr-2 size-4" /> Add zone
            </Button>
          </div>

          {zonesLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : zonesError ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3"><AlertCircle className="size-6 text-red-500" /><p className="text-xs text-muted-foreground">Failed to load zones</p><Button variant="outline" size="sm" onClick={() => refetchZones()}><RefreshCw className="size-3 mr-2" />Retry</Button></div>
          ) : zones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No zones configured yet.</p>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-xs text-muted-foreground">{zone.locations.join(", ") || "No regions"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{zone.fee} GHS • {zone.estimatedMinDays}-{zone.estimatedMaxDays} days</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Method name</label>
              <Input value={methodDraft.name} onChange={(event) => setMethodDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Express delivery" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Zone</label>
              <select
                value={methodDraft.zoneId || zones[0]?.id || ""}
                onChange={(event) => setMethodDraft((current) => ({ ...current, zoneId: event.target.value }))}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Rate (GHS)</label>
              <Input type="number" value={methodDraft.rate} onChange={(event) => setMethodDraft((current) => ({ ...current, rate: Number(event.target.value) }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Description</label>
              <Input value={methodDraft.description} onChange={(event) => setMethodDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Priority delivery" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Estimated min days</label>
              <Input type="number" value={methodDraft.estimatedDays.min} onChange={(event) => setMethodDraft((current) => ({ ...current, estimatedDays: { ...current.estimatedDays, min: Number(event.target.value) } }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Estimated max days</label>
              <Input type="number" value={methodDraft.estimatedDays.max} onChange={(event) => setMethodDraft((current) => ({ ...current, estimatedDays: { ...current.estimatedDays, max: Number(event.target.value) } }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddMethod}>
              <Plus className="mr-2 size-4" /> Add method
            </Button>
          </div>

          {methodsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : methodsError ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3"><AlertCircle className="size-6 text-red-500" /><p className="text-xs text-muted-foreground">Failed to load methods</p></div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No delivery methods configured yet.</p>
          ) : (
            <div className="space-y-3">
              {methods.map((method) => (
                <div key={method.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{method.rate} GHS • {method.estimatedDays.min}-{method.estimatedDays.max} days</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteMethod(method.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
