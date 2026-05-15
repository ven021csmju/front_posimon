import { useEffect, useState } from "react";
import { AlertCircle, Boxes, PackagePlus, RefreshCw, Search } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { productService } from "../services/posService";
import { Product } from "../types";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts(await productService.getProducts());
    } catch (error) {
      console.error("Failed to load inventory", error);
      setProducts([]);
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
