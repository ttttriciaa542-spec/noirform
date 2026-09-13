import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchAdminAppearanceSettings, saveAdminAppearanceSettings } from "@/lib/admin-store";
import { Palette, Loader2 } from "lucide-react";

const defaultAppearance = {
  primaryColor: "#3a3a38",
  secondaryColor: "#d8c3a5",
  accentColor: "#b8532c",
  backgroundColor: "#f5f0e8",
  surfaceColor: "#faf8f4",
  textColor: "#2c2c2a",
  mutedTextColor: "#6b6560",
  borderColor: "#e0d9ce",
  headingFont: "Bodoni Moda",
  bodyFont: "Jost",
  borderRadius: "md",
};

type AppearanceKey = keyof typeof defaultAppearance;

type AppearanceState = Record<AppearanceKey, string>;

const radiusMap: Record<string, string> = {
  none: "0px",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.75rem",
  full: "9999px",
};

const applyAppearanceTheme = (settings: AppearanceState) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--primary", settings.primaryColor);
  root.style.setProperty("--secondary", settings.secondaryColor);
  root.style.setProperty("--accent", settings.accentColor);
  root.style.setProperty("--background", settings.backgroundColor);
  root.style.setProperty("--card", settings.surfaceColor);
  root.style.setProperty("--foreground", settings.textColor);
  root.style.setProperty("--muted-foreground", settings.mutedTextColor);
  root.style.setProperty("--border", settings.borderColor);
  root.style.setProperty("--font-display", `'${settings.headingFont}', 'Times New Roman', serif`);
  root.style.setProperty("--font-sans", `'${settings.bodyFont}', ui-sans-serif, system-ui, sans-serif`);
  root.style.setProperty("--radius", radiusMap[settings.borderRadius] ?? radiusMap.md);
};

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearance,
});

function AdminAppearance() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["/admin/appearance"],
    queryFn: fetchAdminAppearanceSettings,
  });

  const [settings, setSettings] = useState<AppearanceState>(() => ({ ...defaultAppearance }));

  useEffect(() => {
    if (data) {
      const nextSettings = { ...defaultAppearance, ...data } as AppearanceState;
      setSettings(nextSettings);
      applyAppearanceTheme(nextSettings);
    }
  }, [data]);

  const updateSetting = <K extends AppearanceKey>(key: K, value: AppearanceState[K]) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      applyAppearanceTheme(next);
      return next;
    });
  };

  const handleSave = async () => {
    const payload = { ...defaultAppearance, ...settings };
    saveAdminAppearanceSettings(payload as any);
    applyAppearanceTheme(payload);
    await queryClient.invalidateQueries({ queryKey: ["/admin/appearance"] });
  };

  const colorFields: Array<{ label: string; key: AppearanceKey }> = [
    { label: "Primary", key: "primaryColor" },
    { label: "Secondary", key: "secondaryColor" },
    { label: "Accent", key: "accentColor" },
    { label: "Background", key: "backgroundColor" },
    { label: "Surface", key: "surfaceColor" },
    { label: "Text", key: "textColor" },
    { label: "Muted Text", key: "mutedTextColor" },
    { label: "Border", key: "borderColor" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="display-xl text-3xl sm:text-4xl">Appearance</h1></div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Appearance</h1>
          <p className="mt-2 text-sm text-muted-foreground">Customize your store&apos;s look and feel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="size-4" /> Brand Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {colorFields.map(({ label, key }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-20 text-sm">{label}</div>
                <Input
                  type="color"
                  value={settings[key]}
                  onChange={(event) => updateSetting(key, event.target.value)}
                  className="size-10 p-0"
                />
                <Input
                  value={settings[key]}
                  onChange={(event) => updateSetting(key, event.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <Label className="w-20 text-sm">Preview</Label>
              <div className="flex gap-2">
                {colorFields.map(({ key }) => (
                  <div key={key} className="w-8 h-8 rounded-md border" style={{ backgroundColor: settings[key] }} />
                ))}
              </div>
            </div>
            <Button onClick={handleSave}>Save Colors</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Typography</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="w-20 text-sm">Headings</Label>
              <Input value={settings.headingFont} onChange={(event) => updateSetting("headingFont", event.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 text-sm">Body</Label>
              <Input value={settings.bodyFont} onChange={(event) => updateSetting("bodyFont", event.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 text-sm">Radius</Label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={settings.borderRadius}
                onChange={(event) => updateSetting("borderRadius", event.target.value)}
              >
                <option value="none">none</option>
                <option value="sm">sm</option>
                <option value="md">md</option>
                <option value="lg">lg</option>
                <option value="full">full</option>
              </select>
            </div>
            <Button onClick={handleSave}>Save Typography</Button>
          </CardContent>
        </Card>
      </div>
  );
}
