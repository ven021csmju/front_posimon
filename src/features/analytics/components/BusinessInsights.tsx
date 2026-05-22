import { useMemo, useState } from 'react';
import { Clock3, Crown, LineChart, PieChart, Users, Wine } from 'lucide-react';
import Card from '../../../components/ui/Card';
import type { AnalyticsOrder, AnalyticsPeriod, AnalyticsUser } from '../types';
import { computeAnalytics } from '../utils/computeAnalytics';
import RevenueTrendChart from './RevenueTrendChart';
import PeakHoursChart from './PeakHoursChart';
import CategoryPieChart from './CategoryPieChart';
import BestSellersBarChart from './BestSellersBarChart';
import { formatCurrency } from './chartTheme';

const periodOptions: { id: AnalyticsPeriod; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

interface Props {
  orders: AnalyticsOrder[];
  users: AnalyticsUser[];
}

function RankList({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: { id: number; name: string; orders: number; revenue: number }[];
  emptyLabel: string;
}) {
  return (
    <div>
      <h3 className="mb-3 font-sans text-lg font-black text-white">{title}</h3>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#d6b66b]/10 text-xs font-black text-[#d6b66b]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{row.name}</p>
                  <p className="text-xs text-zinc-500">{row.orders} orders</p>
                </div>
              </div>
              <p className="shrink-0 font-black text-[#d6b66b]">{formatCurrency(row.revenue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessInsights({ orders, users }: Props) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [revenueMode, setRevenueMode] = useState<'daily' | 'monthly'>('daily');

  const analytics = useMemo(() => computeAnalytics(orders, users, period), [orders, users, period]);

  const revenueChartData =
    revenueMode === 'daily' ? analytics.dailyRevenue : analytics.monthlyRevenue;

  const growthLabel =
    analytics.summary.revenueGrowthPct === null
      ? '—'
      : `${analytics.summary.revenueGrowthPct >= 0 ? '+' : ''}${analytics.summary.revenueGrowthPct.toFixed(1)}%`;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Business insights</p>
          <h2 className="mt-1 font-sans text-2xl font-black text-white">Advanced Analytics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPeriod(opt.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition-colors ${
                period === opt.id
                  ? 'bg-[#d6b66b]/15 text-[#d6b66b]'
                  : 'bg-white/[0.04] text-zinc-500 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Average Order Value', value: formatCurrency(analytics.summary.averageOrderValue), icon: LineChart },
          { label: 'Paid order rate', value: `${analytics.summary.paidOrderRate.toFixed(0)}%`, icon: Crown },
          { label: 'Revenue growth (7d)', value: growthLabel, icon: LineChart },
          { label: 'Categories active', value: String(analytics.categoryPerformance.length), icon: Wine },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-zinc-500">{metric.label}</p>
                <Icon size={16} className="text-[#d6b66b]" />
              </div>
              <p className="text-2xl font-black text-white">{metric.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Revenue</p>
              <h3 className="mt-1 font-sans text-xl font-black text-white">Daily & Monthly Trend</h3>
            </div>
            <div className="flex gap-2">
              {(['daily', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRevenueMode(mode)}
                  className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${
                    revenueMode === mode ? 'bg-[#d6b66b]/15 text-[#d6b66b]' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <RevenueTrendChart data={revenueChartData} mode={revenueMode} />
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Clock3 className="text-[#d6b66b]" size={18} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Peak hours</p>
              <h3 className="font-sans text-xl font-black text-white">Best selling times</h3>
            </div>
          </div>
          <PeakHoursChart data={analytics.hourlySales} />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <PieChart className="text-[#d6b66b]" size={18} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Category mix</p>
              <h3 className="font-sans text-xl font-black text-white">Wine category performance</h3>
            </div>
          </div>
          <CategoryPieChart data={analytics.categoryPerformance} />
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Top products</p>
            <h3 className="mt-1 font-sans text-xl font-black text-white">Best sellers by revenue</h3>
          </div>
          <BestSellersBarChart data={analytics.bestSellers} />
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <RankList
            title="Top customers"
            rows={analytics.topCustomers}
            emptyLabel="No registered customer orders in this period (POS orders are usually tied to staff accounts)."
          />
          <RankList
            title="Top staff by sales"
            rows={analytics.topStaff}
            emptyLabel="No staff-attributed orders in this period."
          />
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
          <Users size={12} />
          Staff rankings use cashier/admin accounts from order history.
        </p>
      </Card>
    </section>
  );
}
