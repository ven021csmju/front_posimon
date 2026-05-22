import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartAxisStyle, chartGridStyle, chartTooltipStyle, formatCurrency } from './chartTheme';

interface Props {
  data: { name: string; revenue: number; quantity: number }[];
}

export default function BestSellersBarChart({ data }: Props) {
  const chartData = data.map((row) => ({
    ...row,
    shortName: row.name.length > 22 ? `${row.name.slice(0, 20)}…` : row.name,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-semibold text-zinc-500">
        No product sales in this period
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid {...chartGridStyle} horizontal={false} />
          <XAxis type="number" tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(Number(v))} />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={chartAxisStyle}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value: number, name: string) => [
              name === 'revenue' ? formatCurrency(value) : value,
              name === 'revenue' ? 'Revenue' : 'Units',
            ]}
          />
          <Bar dataKey="revenue" fill="#d6b66b" radius={[0, 6, 6, 0]} name="revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
