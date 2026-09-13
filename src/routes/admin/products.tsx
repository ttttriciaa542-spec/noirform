import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Plus, Search, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/pricing";
import { getDiscountPercentage } from "@/lib/pricing";
import { fetchAdminProducts, addAdminProduct, deleteAdminProduct, updateAdminProduct } from "@/lib/admin-store";
import type { AdminProduct } from "@/lib/admin-types";
import { ProductForm } from "@/components/admin/ProductForm";

function AdminProducts() {
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/products"],
    queryFn: fetchAdminProducts,
  });
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (formData: {
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
    isNew: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    material: string;
    care: string;
    fit: string;
    images: Array<{ id: string; url: string; alt: string; removeBackground: boolean }>;
  }) => {
    const stockTotal = Object.values(formData.sizeStock ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const newProduct: AdminProduct = {
      id: `p${Date.now()}`,
      sku: `BDC-${String(products.length + 1).padStart(4, "0")}`,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      price: Number.parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
      images: formData.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        originalUrl: img.url,
        backgroundRemoved: img.removeBackground,
        processingAvailable: false,
        width: 1024,
        height: 1280,
      })),
      category: formData.category,
      subcategory: formData.category,
      colors: [],
      sizes: formData.sizes,
      sizeStock: formData.sizeStock ?? {},
      stock: stockTotal || Number.parseInt(formData.stock, 10) || 0,
      lowStockThreshold: 3,
      status: "active",
      featured: formData.isFeatured,
      tags: [formData.category],
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAdminProduct(newProduct);
    queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
  };

  const handleDelete = (id: string) => {
    deleteAdminProduct(id);
    queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = (formData: {
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
    isNew: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    material: string;
    care: string;
    fit: string;
    images: Array<{ id: string; url: string; alt: string; removeBackground: boolean }>;
  }) => {
    if (!editingProduct) {
      handleAdd(formData);
      return;
    }

    const updatedProduct: AdminProduct = {
      ...editingProduct,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      price: Number.parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
      category: formData.category,
      subcategory: formData.category,
      sizes: formData.sizes,
      sizeStock: formData.sizeStock,
      stock: Object.values(formData.sizeStock).reduce((sum, value) => sum + (Number(value) || 0), 0) || Number.parseInt(formData.stock, 10) || 0,
      images: formData.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        originalUrl: img.url,
        backgroundRemoved: img.removeBackground,
        processingAvailable: false,
        width: 1024,
        height: 1280,
      })),
      featured: formData.isFeatured,
      updatedAt: new Date().toISOString(),
    };

    updateAdminProduct(updatedProduct);
    setEditingProduct(null);
    queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your catalogue</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4 mr-2" />Add Product
        </Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="secondary">{filtered.length} products</Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="size-8 text-red-500" />
          <p className="text-sm text-muted-foreground">Failed to load products</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">
            {search ? `No products match "${search}"` : "No products yet"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="size-4 mr-2" />Add your first product
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const discount = getDiscountPercentage(product.price, product.originalPrice);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md bg-secondary overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0].url} alt="" className="size-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          {discount && <div className="text-xs text-green-600">{discount}% off</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {product.stock <= 0 ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Out of stock</Badge>
                      ) : product.stock <= product.lowStockThreshold ? (
                        <Badge variant="secondary">Low</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">In stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"} className="capitalize">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" aria-label="Edit product" onClick={() => handleEdit(product)}>
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete product"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingProduct(null);
        }}
        initialData={editingProduct ? {
          name: editingProduct.name,
          slug: editingProduct.slug,
          description: editingProduct.description,
          price: String(editingProduct.price),
          originalPrice: editingProduct.originalPrice ? String(editingProduct.originalPrice) : "",
          category: editingProduct.category,
          collections: [],
          sizes: editingProduct.sizes,
          sizeStock: editingProduct.sizeStock ?? Object.fromEntries(editingProduct.sizes.map((size) => [size, editingProduct.stock || 0])),
          stock: String(editingProduct.stock),
          material: "",
          care: "",
          fit: "",
          images: editingProduct.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            removeBackground: img.backgroundRemoved ?? false,
          })),
          isNew: false,
          isFeatured: editingProduct.featured,
          isBestSeller: false,
        } : null}
        submitLabel={editingProduct ? "Save Changes" : "Add Product"}
        onSubmit={handleSave}
      />
    </div>
  );
}

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});
