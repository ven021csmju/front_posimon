import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartAxisStyle, chartGridStyle, chartTooltipStyle, formatCurrency } from './chartTheme';

interface Props {
  data: { label: string; revenue: number; orders: number }[];
  mode: 'daily' | 'monthly';
}

export default function RevenueTrendChart({ data, mode }: Props) {
  const empty = data.length === 0;

  return (
    <div className="h-72 w-full">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500">
          No revenue data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d6b66b" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#7a1026" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGridStyle} vertical={false} />
            <XAxis dataKey="label" tick={chartAxisStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={chartAxisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(Number(v))}
              width={56}
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value: number, name: string) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Revenue' : 'Orders',
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d6b66b"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
        {mode === 'daily' ? 'Daily revenue' : 'Monthly revenue'}
      </p>
    </div>
  );
}
