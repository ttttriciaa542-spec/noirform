import { useState, useCallback, useRef, useEffect } from "react";
import { AlertCircle, Loader2, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  { value: "bikinis", label: "Bikinis" },
  { value: "swimwear", label: "Swimwear" },
  { value: "dresses", label: "Dresses" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "sets", label: "Sets" },
  { value: "beachwear", label: "Beachwear" },
  { value: "accessories", label: "Accessories" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const COLLECTION_OPTIONS = [
  { value: "summer-edit", label: "The Summer Edit" },
  { value: "vacation-mode", label: "Vacation Mode" },
  { value: "beach-club", label: "Beach Club" },
  { value: "night-out", label: "Night Out" },
];

interface UploadedImage {
  id: string;
  url: string;
  alt: string;
  originalUrl?: string;
  removeBackground: boolean;
  file?: File;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  collections: string[];
  sizes: string[];
  sizeStock: Record<string, number>;
  stock: string;
  material: string;
  care: string;
  fit: string;
  images: UploadedImage[];
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
}

function emptyFormData(): ProductFormData {
  return {
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    collections: [],
    sizes: [],
    sizeStock: {},
    stock: "",
    material: "",
    care: "",
    fit: "",
    images: [],
    isNew: false,
    isFeatured: false,
    isBestSeller: false,
  };
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData> | null;
  submitLabel?: string;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function rgbDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function getDominantColor(pixels: Uint8ClampedArray, width: number, height: number): { r: number; g: number; b: number } | null {
  const bgColors: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  const addPixel = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
    const existing = bgColors.get(key);
    if (existing) {
      existing.count++;
    } else {
      bgColors.set(key, { r, g, b, count: 1 });
    }
  };

  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [0, Math.floor(height / 4)], [Math.floor(width / 4), 0],
    [width - 1, Math.floor(height / 4)], [Math.floor(width / 4), height - 1],
  ];
  for (const [cx, cy] of corners) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        addPixel(cx + dx, cy + dy);
      }
    }
  }

  const edgeSampleCount = 40;
  for (let i = 0; i < edgeSampleCount; i++) {
    const t = i / edgeSampleCount;
    addPixel(Math.floor(t * (width - 1)), 0);
    addPixel(Math.floor(t * (width - 1)), height - 1);
    addPixel(0, Math.floor(t * (height - 1)));
    addPixel(width - 1, Math.floor(t * (height - 1)));
  }

  if (bgColors.size === 0) return null;

  const sorted = Array.from(bgColors.values()).sort((a, b) => b.count - a.count);
  return sorted[0];
}

async function removeBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const bg = getDominantColor(pixels, canvas.width, canvas.height);
      if (!bg) { resolve(dataUrl); return; }

      const threshold = 70;

      const isBg = new Uint8Array(canvas.width * canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const dist = rgbDistance(r, g, b, bg.r, bg.g, bg.b);
          isBg[y * canvas.width + x] = dist < threshold ? 1 : 0;
        }
      }

      const dilated = new Uint8Array(isBg.length);
      const w = canvas.width;
      const h = canvas.height;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (isBg[idx]) {
            dilated[idx] = 1;
            continue;
          }
          let bgNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h && isBg[ny * w + nx]) {
                bgNeighbors++;
              }
            }
          }
          if (bgNeighbors >= 7) {
            dilated[idx] = 1;
          }
        }
      }

      const eroded = new Uint8Array(dilated.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (!dilated[idx]) continue;
          let allBg = true;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h && !dilated[ny * w + nx]) {
                allBg = false;
                break;
              }
            }
            if (!allBg) break;
          }
          eroded[idx] = allBg ? 1 : 0;
        }
      }

      for (let i = 0, p = 0; i < pixels.length; i += 4, p++) {
        if (eroded[p]) {
          pixels[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function ProductForm({ open, onOpenChange, onSubmit, initialData = null, submitLabel = "Add Product" }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    ...emptyFormData(),
    ...(initialData ?? {}),
    sizeStock: initialData?.sizeStock ?? {},
  });

  useEffect(() => {
    setForm({
      ...emptyFormData(),
      ...(initialData ?? {}),
      sizeStock: initialData?.sizeStock ?? {},
    });
  }, [initialData, open]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setSubmitError(null);
    try {
      const newImages: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const url = await readFileAsDataURL(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          url,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          removeBackground: false,
          file,
        });
      }
      update("images", [...form.images, ...newImages]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addImageFromUrl = (url: string) => {
    const value = url.trim();
    if (!value) return;

    update("images", [
      ...form.images,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: value,
        alt: "Remote product image",
        removeBackground: false,
      },
    ]);
  };

  const removeImage = (id: string) => {
    update("images", form.images.filter((img) => img.id !== id));
  };

  const toggleRemoveBackground = async (id: string) => {
    const img = form.images.find((i) => i.id === id);
    if (!img) return;
    const newRemoveBg = !img.removeBackground;
    if (newRemoveBg) {
      setProcessingIds((prev) => new Set(prev).add(id));
      setSubmitError(null);
      try {
        const processedUrl = await removeBackground(img.url);
        update("images", form.images.map((i) => (i.id === id ? { ...i, url: processedUrl, originalUrl: i.url, removeBackground: true } : i)));
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to remove background");
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } else {
      // Revert: restore original URL
      if (img.originalUrl) {
        update("images", form.images.map((i) => (i.id === id ? { ...i, url: i.originalUrl, originalUrl: undefined, removeBackground: false } : i)));
      } else if (img.file) {
        try {
          const originalUrl = await readFileAsDataURL(img.file);
          update("images", form.images.map((i) => (i.id === id ? { ...i, url: originalUrl, removeBackground: false } : i)));
        } catch {
          update("images", form.images.map((i) => (i.id === id ? { ...i, removeBackground: false } : i)));
        }
      } else {
        update("images", form.images.map((i) => (i.id === id ? { ...i, removeBackground: false } : i)));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
      if (!initialData) {
        toast.success("Product added", { description: `${form.name} has been added to your catalogue.` });
      }
      setForm(emptyFormData());
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSize = (size: string) => {
    const current = form.sizes;
    const nextSizes = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    const nextSizeStock = { ...form.sizeStock };

    if (current.includes(size)) {
      delete nextSizeStock[size];
    } else {
      nextSizeStock[size] = Number(form.stock) || 0;
    }

    update("sizes", nextSizes);
    update("sizeStock", nextSizeStock);
  };

  const updateSizeStock = (size: string, value: number) => {
    update("sizeStock", {
      ...form.sizeStock,
      [size]: Math.max(0, Number.isFinite(value) ? value : 0),
    });
  };

  const toggleCollection = (slug: string) => {
    const current = form.collections;
    update("collections", current.includes(slug) ? current.filter((c) => c !== slug) : [...current, slug]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>{initialData ? "Update this product and available stock by size." : "Add a new female bikini wear or fashion product to the store."}</DialogDescription>
        </DialogHeader>
        {submitError && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="size-4 shrink-0" />
            {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product Name *</Label>
              <Input
                required
                placeholder="e.g. Sunset Bikini Set"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                placeholder="sunset-bikini-set"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Description *</Label>
              <Textarea
                required
                placeholder="Describe the product..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price (GHS) *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Original Price (GHS)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select required value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleCollection(c.value)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                      form.collections.includes(c.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-secondary"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                      form.sizes.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.sizes.length > 0 && (
                <div className="grid gap-2 rounded-md border bg-secondary/30 p-3">
                  <div className="text-xs font-medium text-muted-foreground">Available pieces by size</div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {form.sizes.map((size) => (
                      <label key={size} className="grid gap-1 text-xs text-muted-foreground">
                        <span>{size}</span>
                        <Input
                          type="number"
                          min="0"
                          value={form.sizeStock[size] ?? 0}
                          onChange={(e) => updateSizeStock(size, Number(e.target.value))}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Product Images</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="size-4 mr-2" />
                  )}
                  {uploading ? "Uploading..." : "Upload from Device"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex flex-1 items-center gap-2 min-w-[220px]">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const target = e.currentTarget as HTMLInputElement;
                        addImageFromUrl(target.value);
                        target.value = "";
                      }
                    }}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null);
                      if (!input) return;
                      addImageFromUrl(input.value);
                      input.value = "";
                    }}
                  >
                    Add URL
                  </Button>
                </div>
                {form.images.length > 0 && (
                  <span className="text-sm text-muted-foreground">{form.images.length} image(s)</span>
                )}
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {form.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="size-full aspect-square object-cover rounded-md border"
                      />
                      {processingIds.has(img.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                          <Loader2 className="size-6 animate-spin text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-b-md flex items-center justify-between">
                        <span className="truncate">{img.alt}</span>
                        <Trash2
                          className="size-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(img.id)}
                        />
                      </div>
                      <label className="absolute bottom-7 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-black/80 transition-colors">
                        <Checkbox
                          checked={img.removeBackground}
                          onCheckedChange={() => toggleRemoveBackground(img.id)}
                          className="h-4 w-4 bg-white/90 rounded-sm"
                        />
                        Remove BG
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Material</Label>
                <Input
                  placeholder="e.g. Recycled nylon"
                  value={form.material}
                  onChange={(e) => update("material", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Care Instructions</Label>
              <Textarea
                placeholder="How to care for this product..."
                value={form.care}
                onChange={(e) => update("care", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Fit Guide</Label>
              <Textarea
                placeholder="How the product fits..."
                value={form.fit}
                onChange={(e) => update("fit", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label>Status Badges</Label>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.isNew} onCheckedChange={(v) => update("isNew", !!v)} />
                New
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.isFeatured} onCheckedChange={(v) => update("isFeatured", !!v)} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.isBestSeller} onCheckedChange={(v) => update("isBestSeller", !!v)} />
                Best Seller
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
