import { Link } from "react-router-dom";
import { BarChart3, History, ShoppingCart, Wine } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuthStore } from "../store/useAuthStore";

export default function Home() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";
  const isStaff = isAdmin || isCashier;

  const quickAccess = [
    { label: "POS Cashier", desc: "Fast touchscreen checkout and barcode search.", href: "/pos", icon: ShoppingCart, roles: ["admin", "cashier"] },
    { label: "Order History", desc: "Receipt review, printing, and transaction lookup.", href: "/orders", icon: History, roles: ["admin", "cashier"] },
    { label: "Dashboard", desc: "Sales analytics, inventory alerts, and staff overview.", href: "/admin/dashboard", icon: BarChart3, roles: ["admin"] },
  ].filter(item => item.roles.includes(user?.role || ""));

  return (
    <AppShell
      title="Command Center"
      subtitle="Choose a workspace for today's wine retail operation."
      actions={
        isStaff && (
          <Link to="/pos">
            <Button variant="primary" icon={<ShoppingCart size={18} />}>Open POS</Button>
          </Link>
        )
      }
    >
      <main className="p-5">
        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="overflow-hidden p-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#d6b66b]">Premium European wine shop</p>
              <h2 className="font-sans text-5xl font-black leading-tight text-white">A unified POS suite for cashier speed and boutique service.</h2>
              <p className="mt-5 text-lg font-medium leading-8 text-zinc-400">
                Product browsing, cart updates, payment collection, order history, and analytics now share the same dark glass design language.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#4a0715] text-[#d6b66b]">
              <Wine size={34} />
            </div>
            <p className="mt-6 text-3xl font-black text-white">PoSimon Cellar</p>
            <p className="mt-2 text-sm font-semibold text-zinc-500">Dark luxury cashier system</p>
          </Card>
        </section>

        {quickAccess.length > 0 && (
          <section className="mt-5 grid gap-5 md:grid-cols-3">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Card interactive className="h-full p-6">
                    <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl border border-[#d6b66b]/20 bg-[#d6b66b]/10 text-[#d6b66b]">
                      <Icon size={28} />
                    </div>
                    <h3 className="font-sans text-2xl font-black text-white">{item.label}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{item.desc}</p>
                  </Card>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
