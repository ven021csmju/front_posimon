import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Printer, RefreshCw, ReceiptText, Search, Send, ShoppingCart } from "lucide-react";
import { orderService } from "../services/posService";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [query, setQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      const normalized = Array.isArray(data) ? data : [];
      setOrders(normalized);

      const printId = new URLSearchParams(window.location.search).get("print");
      if (printId) {
        const orderToPrint = normalized.find((order: any) => String(order.id) === printId);
        if (orderToPrint) {
          setSelectedOrder(orderToPrint);
          window.setTimeout(() => {
            window.print();
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 500);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch orders", err);
      setError("Unable to load order history from the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const searchable = [`ORD-${order.id}`, order.payment_method, order.total_price, order.created_at].join(" ").toLowerCase();
    return searchable.includes(query.toLowerCase());
  });

  return (
    <AppShell
      title="Order History"
      subtitle="Review receipts, inspect line items, and reprint completed sales."
      actions={
        <>
          <Button variant="secondary" icon={<RefreshCw size={18} className={loading ? "animate-spin" : ""} />} onClick={fetchOrders}>
            Refresh
          </Button>
          <Link to="/pos">
            <Button variant="primary" icon={<ShoppingCart size={18} />}>POS</Button>
          </Link>
        </>
      }
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; color: #000 !important; }
          .printable-content { position: absolute; inset: 0 auto auto 0; width: 100%; background: white !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="grid min-h-[calc(100vh-81px)] gap-5 p-5 lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
        <Card className="no-print flex min-h-0 flex-col overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <Input label="Search orders" icon={<Search size={18} />} placeholder="Order ID, payment method, amount" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center font-bold text-zinc-500">Loading orders...</div>
            ) : error ? (
              <div className="p-10 text-center font-bold text-rose-300">{error}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-10 text-center text-zinc-500">
                <ReceiptText size={58} className="mb-4 opacity-30" />
                <p className="font-bold">No orders found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`grid w-full grid-cols-[1fr_auto] gap-4 p-5 text-left transition ${
                      selectedOrder?.id === order.id ? "bg-[#7a1026]/20" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <p className="text-lg font-black text-white">#ORD-{order.id}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        <CalendarClock size={15} />
                        {order.created_at ? new Date(order.created_at).toLocaleString("en-GB") : "No timestamp"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#d6b66b]">THB {(order.total_price || 0).toLocaleString()}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-600">{order.payment_method || "paid"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="printable-content flex min-h-0 flex-col overflow-hidden">
          {selectedOrder ? (
            <>
              <div className="border-b border-white/10 bg-gradient-to-br from-[#7a1026] to-[#2a050d] p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6b66b]">Receipt</p>
                    <h2 className="mt-2 font-sans text-4xl font-black text-white">#ORD-{selectedOrder.id}</h2>
                    <p className="mt-2 text-sm font-semibold text-zinc-300">
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("en-GB") : "No timestamp"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Net total</p>
                    <p className="mt-2 text-5xl font-black text-white">THB {(selectedOrder.total_price || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-7">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6b66b]/10 text-sm font-black text-[#d6b66b]">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="font-black text-white">{item.product_name || `Product #${item.product_id}`}</p>
                          <p className="text-sm font-semibold text-zinc-500">Unit price THB {(item.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-white">THB {((item.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="no-print grid grid-cols-2 gap-3 border-t border-white/10 bg-black/20 p-5">
                <Button variant="secondary" size="lg" icon={<Printer size={18} />} onClick={() => window.print()}>
                  Print receipt
                </Button>
                <Button variant="primary" size="lg" icon={<Send size={18} />}>
                  Send email
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-10 text-center text-zinc-500">
              <ReceiptText size={80} className="mb-5 opacity-20" />
              <p className="text-xl font-black text-zinc-300">Select an order</p>
              <p className="mt-2 text-sm font-semibold">Receipt details will appear here.</p>
            </div>
          )}
        </Card>
      </main>
    </AppShell>
  );
}
