import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartAxisStyle, chartGridStyle, chartTooltipStyle, formatCurrency } from './chartTheme';

interface Props {
  data: { label: string; orders: number; revenue: number }[];
}

export default function PeakHoursChart({ data }: Props) {
  const peak = data.reduce(
    (best, row) => (row.orders > best.orders ? row : best),
    data[0] ?? { label: '—', orders: 0, revenue: 0 }
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value: number, name: string) => [
              name === 'revenue' ? formatCurrency(value) : value,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
          />
          <Bar dataKey="orders" fill="#7a1026" radius={[6, 6, 0, 0]} name="orders" />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs font-semibold text-zinc-500">
        Peak hour: <span className="text-[#d6b66b]">{peak.label}</span> ({peak.orders} orders)
      </p>
    </div>
  );
}
