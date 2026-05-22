import { useEffect, useRef, useState } from "react";
import { AlertCircle, Boxes, PackagePlus, RefreshCw, Search, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { productService } from "../services/posService";
import { Product } from "../types";
import { notify } from "../services/notification.service";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      if (selectedProduct) {
        const updated = data.find(p => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      }
    } catch (error) {
      console.error("Failed to load inventory", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct?.id) return;

    setLoading(true);
    try {
      await productService.uploadProductImage(selectedProduct.id, file);
      notify({
        type: 'success',
        title: 'Image Uploaded',
        message: `Successfully uploaded new image for ${selectedProduct.name}`,
      });
      await fetchProducts();
    } catch (error) {
      console.error("Upload failed", error);
      notify({
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not upload product image. Please try again.',
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    setLoading(true);
    try {
      await productService.deleteProductImage(imageId);
      await fetchProducts();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (productId: number) => {
    const amount = prompt("Enter quantity to add:");
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);
    try {
      await productService.refillStock(productId, Number(amount));
      const product = products.find(p => p.id === productId);
      notify({
        type: 'success',
        title: 'Stock Refilled',
        message: `Added ${amount} units to ${product?.name || 'product'}`,
      });
      await fetchProducts();
    } catch (error) {
      console.error("Refill failed", error);
      notify({
        type: 'error',
        title: 'Refill Failed',
        message: 'Could not update stock level. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => [product.name, product.sku, product.barcode].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase()));
  const lowStock = products.filter((product) => product.stock < 10).length;

  return (
    <AppShell
      title="Inventory"
      subtitle="Stock visibility, low-stock warnings, and product availability."
      actions={
        <>
          <Button variant="secondary" icon={<RefreshCw size={18} className={loading ? "animate-spin" : ""} />} onClick={fetchProducts}>Refresh</Button>
          <Button variant="primary" icon={<PackagePlus size={18} />}>New Product</Button>
        </>
      }
    >
      <main className="space-y-5 p-5">
        <section className="grid gap-5 md:grid-cols-3">
          <Card className="p-5">
            <Boxes className="mb-6 text-[#d6b66b]" size={32} />
            <p className="text-sm font-bold text-zinc-500">Total SKUs</p>
            <p className="mt-2 text-4xl font-black text-white">{products.length}</p>
          </Card>
          <Card className="p-5">
            <AlertCircle className="mb-6 text-rose-300" size={32} />
            <p className="text-sm font-bold text-zinc-500">Low Stock</p>
            <p className="mt-2 text-4xl font-black text-white">{lowStock}</p>
          </Card>
          <Card className="p-5">
            <PackagePlus className="mb-6 text-emerald-300" size={32} />
            <p className="text-sm font-bold text-zinc-500">Ready to Sell</p>
            <p className="mt-2 text-4xl font-black text-white">{products.filter((p) => p.stock > 0).length}</p>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <Input label="Search inventory" icon={<Search size={18} />} placeholder="Product, SKU, or barcode" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.map((product) => (
                  <tr key={product.id || product.sku} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-black text-white">{product.name}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-zinc-500">{product.sku || "No SKU"}</td>
                    <td className="px-5 py-4 font-black text-[#d6b66b]">THB {(product.selling_price || product.price || 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${product.stock < 10 ? "bg-rose-500/10 text-rose-200" : "bg-emerald-500/10 text-emerald-200"}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" icon={<ImageIcon size={14} />} onClick={() => setSelectedProduct(product)}>
                          Images
                        </Button>
                        <Button variant="primary" size="sm" icon={<PackagePlus size={14} />} onClick={() => product.id && handleRefill(product.id)}>
                          Refill
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedProduct && (
          <Modal
            isOpen={!!selectedProduct}
            title={selectedProduct.name}
            eyebrow="Manage Images"
            onClose={() => setSelectedProduct(null)}
          >
            <div className="p-5">
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedProduct.images?.map((image) => (
                  <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-2 right-2 rounded-lg bg-rose-500/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 text-zinc-500 transition-colors hover:border-[#d6b66b]/40 hover:bg-white/10 hover:text-[#d6b66b]"
                >
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-bold">Upload New</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadImage}
                accept="image/*"
                className="hidden"
              />

              <div className="flex justify-end border-t border-white/10 pt-5">
                <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </AppShell>
  );
}
