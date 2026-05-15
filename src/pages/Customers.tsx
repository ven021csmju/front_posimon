import { Crown, Mail, Plus, Search, UserRound } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

const customers = [
  { name: "Walk-in Guest", tier: "Standard", visits: 128, spend: 84200 },
  { name: "Maison Private Cellar", tier: "Collector", visits: 24, spend: 318900 },
  { name: "Chateau Member", tier: "VIP", visits: 37, spend: 192500 },
];

export default function Customers() {
  return (
    <AppShell
      title="Customers"
      subtitle="Quick customer selection and boutique loyalty context for cashier service."
      actions={<Button variant="primary" icon={<Plus size={18} />}>New Customer</Button>}
    >
      <main className="space-y-5 p-5">
        <Card className="p-5">
          <Input label="Find customer" icon={<Search size={18} />} placeholder="Name, phone, email, membership" />
        </Card>

        <section className="grid gap-5 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.name} interactive className="p-5">
              <div className="mb-8 flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d6b66b]/10 text-[#d6b66b]">
                  <UserRound size={28} />
                </div>
                <span className="rounded-full border border-[#d6b66b]/20 bg-[#d6b66b]/10 px-3 py-1 text-xs font-black uppercase text-[#d6b66b]">{customer.tier}</span>
              </div>
              <h2 className="font-sans text-2xl font-black text-white">{customer.name}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold text-zinc-500">Visits</p>
                  <p className="mt-1 text-2xl font-black text-white">{customer.visits}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold text-zinc-500">Spend</p>
                  <p className="mt-1 text-2xl font-black text-white">THB {customer.spend.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="secondary" icon={<Crown size={16} />}>Select</Button>
                <Button variant="ghost" icon={<Mail size={16} />}>Email</Button>
              </div>
            </Card>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
