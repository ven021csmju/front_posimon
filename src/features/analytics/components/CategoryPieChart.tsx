import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS, chartTooltipStyle, formatCurrency } from './chartTheme';

interface Props {
  data: { category: string; revenue: number; quantity: number }[];
}

export default function CategoryPieChart({ data }: Props) {
  const chartData = data.filter((d) => d.revenue > 0);

  if (!chartData.length) {
    return (
      <div className="flex h-72 items-center justify-center text-sm font-semibold text-zinc-500">
        No category sales yet
      </div>
    );
  }

  return (
    <div className="grid h-72 gap-4 lg:grid-cols-[1fr_1fr]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="revenue"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col justify-center gap-2 overflow-y-auto pr-1">
        {chartData.map((row, index) => (
          <div key={row.category} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate font-bold text-zinc-300">{row.category}</span>
            </div>
            <span className="shrink-0 font-black text-[#d6b66b]">{formatCurrency(row.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
