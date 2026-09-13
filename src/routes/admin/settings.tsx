import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { fetchAdminAppearanceSettings, saveAdminAppearanceSettings } from "@/lib/admin-store";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const defaultGeneral = {
  storeName: "BigDotCollections",
  storeEmail: "hello@bigdotcollections.com",
  storePhone: "+233 30 220 1234",
  storeAddress: "12 Coastal Road, Accra, Greater Accra, Ghana",
  maintenanceMode: false,
};

const defaultEmail = {
  fromEmail: "hello@bigdotcollections.com",
  fromName: "BigDotCollections",
  replyToEmail: "support@bigdotcollections.com",
  enableOrderConfirmation: true,
  enableShippingNotification: true,
  enableDeliveryConfirmation: true,
  enableAbandonedCart: true,
  enableWelcome: true,
  enableMarketing: false,
};

const defaultPayment = {
  enableCod: false,
  enableMobileMoney: false,
  enableCard: true,
  enableBankTransfer: false,
};

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data: appearance, isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/appearance"],
    queryFn: fetchAdminAppearanceSettings,
  });

  const [general, setGeneral] = useState(defaultGeneral);
  const [email, setEmail] = useState(defaultEmail);
  const [payment, setPayment] = useState(defaultPayment);

  useEffect(() => {
    if (!appearance) return;
    setGeneral((current) => ({
      ...current,
      storeName: appearance.storeName || current.storeName,
      storeEmail: appearance.storeName ? current.storeEmail : current.storeEmail,
      storePhone: current.storePhone,
      storeAddress: current.storeAddress,
      maintenanceMode: current.maintenanceMode,
    }));
  }, [appearance]);

  const handleGeneralSave = () => {
    saveAdminAppearanceSettings({
      ...appearance,
      storeName: general.storeName,
      description: appearance?.description ?? "",
    });
  };

  const handleEmailSave = () => {
    saveAdminAppearanceSettings({
      ...appearance,
      storeName: appearance?.storeName ?? "BigDotCollections",
    });
  };

  const handlePaymentSave = () => {
    saveAdminAppearanceSettings({
      ...appearance,
      storeName: appearance?.storeName ?? "BigDotCollections",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-xl text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">General storefront configuration</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="size-8 text-red-500" />
          <p className="text-sm text-muted-foreground">Failed to load settings</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />Retry
          </Button>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">General</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Store name</label>
                  <Input value={general.storeName} onChange={(event) => setGeneral((current) => ({ ...current, storeName: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Phone</label>
                  <Input value={general.storePhone} onChange={(event) => setGeneral((current) => ({ ...current, storePhone: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Address</label>
                <Input value={general.storeAddress} onChange={(event) => setGeneral((current) => ({ ...current, storeAddress: event.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Maintenance mode</p>
                  <p className="text-xs text-muted-foreground">Show a maintenance page to customers</p>
                </div>
                <Switch checked={general.maintenanceMode} onCheckedChange={(value) => setGeneral((current) => ({ ...current, maintenanceMode: value }))} />
              </div>
              <Button onClick={handleGeneralSave}>Save general</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="size-4" /> Email settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">From email</label>
                  <Input type="email" value={email.fromEmail} onChange={(event) => setEmail((current) => ({ ...current, fromEmail: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">From name</label>
                  <Input value={email.fromName} onChange={(event) => setEmail((current) => ({ ...current, fromName: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Reply-to</label>
                <Input type="email" value={email.replyToEmail} onChange={(event) => setEmail((current) => ({ ...current, replyToEmail: event.target.value }))} />
              </div>

              {Object.entries({
                enableOrderConfirmation: "Order confirmations",
                enableShippingNotification: "Shipping notifications",
                enableDeliveryConfirmation: "Delivery confirmations",
                enableAbandonedCart: "Abandoned cart",
                enableWelcome: "Welcome emails",
                enableMarketing: "Marketing",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm">{label}</span>
                  <Switch checked={Boolean(email[key as keyof typeof email])} onCheckedChange={(value) => setEmail((current) => ({ ...current, [key]: value }))} />
                </div>
              ))}

              <Button onClick={handleEmailSave}>Save email</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Payment settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                enableCod: "Cash on delivery",
                enableMobileMoney: "Mobile money",
                enableCard: "Paystack",
                enableBankTransfer: "Bank transfer",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm">{label}</span>
                  <Switch checked={Boolean(payment[key as keyof typeof payment])} onCheckedChange={(value) => setPayment((current) => ({ ...current, [key]: value }))} />
                </div>
              ))}
              <Button onClick={handlePaymentSave}>Save payments</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
