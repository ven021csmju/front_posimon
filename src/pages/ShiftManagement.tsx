import { Banknote, Clock, LockKeyhole, ReceiptText, UserRound } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function ShiftManagement() {
  const currentTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <AppShell
      title="Shift Management"
      subtitle="Cash drawer control, staff handoff, and end-of-day readiness."
      actions={<Button variant="primary" icon={<LockKeyhole size={18} />}>Close Shift</Button>}
    >
      <main className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d6b66b]/10 text-[#d6b66b]">
            <UserRound size={34} />
          </div>
          <h2 className="mt-8 font-sans text-3xl font-black text-white">Shift A</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-500">Terminal 01 is open and ready for cashier workflow.</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex items-center gap-3 font-bold text-zinc-300"><Clock size={18} className="text-[#d6b66b]" /> Current time</span>
              <span className="font-mono text-xl font-black text-white">{currentTime}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex items-center gap-3 font-bold text-zinc-300"><ReceiptText size={18} className="text-[#d6b66b]" /> Orders</span>
              <span className="text-xl font-black text-white">Ready</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Cash drawer</p>
          <h2 className="mt-2 font-sans text-2xl font-black text-white">Opening and closing amounts</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input label="Opening cash" icon={<Banknote size={18} />} placeholder="0.00" inputMode="decimal" />
            <Input label="Expected closing cash" icon={<Banknote size={18} />} placeholder="0.00" inputMode="decimal" />
          </div>
          <textarea
            className="mt-4 h-32 w-full resize-none rounded-xl border border-white/10 bg-black/25 p-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#d6b66b]/70 focus:ring-4 focus:ring-[#d6b66b]/10"
            placeholder="Shift note"
          />
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary">Save Draft</Button>
            <Button variant="primary">Confirm Cash Count</Button>
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
