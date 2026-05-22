export const CHART_COLORS = ['#d6b66b', '#7a1026', '#c9a84c', '#4a0715', '#e5c98d', '#10b981', '#38bdf8', '#f43f5e'];

export const chartTooltipStyle = {
  contentStyle: {
    background: '#100c0c',
    border: '1px solid rgba(214, 182, 107, 0.25)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  },
  labelStyle: { color: '#d6b66b', fontWeight: 700 },
  itemStyle: { color: '#e4e4e7' },
};

export const chartAxisStyle = {
  stroke: '#52525b',
  fontSize: 11,
  tickLine: false,
};

export const chartGridStyle = {
  stroke: 'rgba(255,255,255,0.06)',
  strokeDasharray: '4 4',
};

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(1)}K`;
  return `฿${Math.round(value).toLocaleString()}`;
}
