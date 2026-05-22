import type {
  AnalyticsOrder,
  AnalyticsPeriod,
  AnalyticsUser,
  DashboardAnalytics,
} from '../types';

const WINE_CATEGORIES = [
  'Red Wine',
  'White Wine',
  'Sparkling',
  'Whiskey',
  'Snacks',
  'Other',
] as const;

export function inferWineCategory(productName: string, productType?: string): string {
  const name = productName.toLowerCase();
  if (name.includes('red wine') || name.includes('bordeaux') || name.includes('chianti') || name.includes('pinot noir')) {
    return 'Red Wine';
  }
  if (name.includes('white wine') || name.includes('chardonnay') || name.includes('sancerre') || name.includes('sauvignon')) {
    return 'White Wine';
  }
  if (name.includes('sparkling') || name.includes('prosecco') || name.includes('champagne') || name.includes('rose')) {
    return 'Sparkling';
  }
  if (name.includes('whiskey') || name.includes('whisky') || name.includes('malt')) {
    return 'Whiskey';
  }
  if (name.includes('snack') || name.includes('cheese') || name.includes('board')) {
    return 'Snacks';
  }
  if (productType === 'wine') return 'Red Wine';
  return 'Other';
}

function isPaidOrder(order: AnalyticsOrder): boolean {
  const status = (order.status ?? '').toLowerCase();
  return !status || status === 'paid' || status === 'completed' || status === 'success';
}

function periodStart(period: AnalyticsPeriod): Date | null {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function filterByPeriod(orders: AnalyticsOrder[], period: AnalyticsPeriod): AnalyticsOrder[] {
  const start = periodStart(period);
  if (!start) return orders;
  return orders.filter((o) => new Date(o.created_at) >= start);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

function userDisplayName(user?: AnalyticsUser): string {
  if (!user) return 'Unknown';
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.email || `User #${user.id}`;
}

export function computeAnalytics(
  orders: AnalyticsOrder[],
  users: AnalyticsUser[],
  period: AnalyticsPeriod
): DashboardAnalytics {
  const filtered = filterByPeriod(orders, period);
  const paidOrders = filtered.filter(isPaidOrder);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalOrders = paidOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidOrderRate = filtered.length > 0 ? (paidOrders.length / filtered.length) * 100 : 0;

  let revenueGrowthPct: number | null = null;
  if (period === '7d' && orders.length > 0) {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 6);
    thisWeekStart.setHours(0, 0, 0, 0);
    const prevWeekStart = new Date(thisWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(thisWeekStart);
    prevWeekEnd.setMilliseconds(-1);

    const thisWeek = paidOrders
      .filter((o) => new Date(o.created_at) >= thisWeekStart)
      .reduce((s, o) => s + o.total_price, 0);
    const prevWeek = orders
      .filter(isPaidOrder)
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= prevWeekStart && d <= prevWeekEnd;
      })
      .reduce((s, o) => s + o.total_price, 0);

    if (prevWeek > 0) {
      revenueGrowthPct = ((thisWeek - prevWeek) / prevWeek) * 100;
    }
  }

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  paidOrders.forEach((order) => {
    const d = new Date(order.created_at);
    const key = d.toISOString().slice(0, 10);
    const current = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue += order.total_price || 0;
    current.orders += 1;
    dailyMap.set(key, current);
  });

  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: formatDayLabel(new Date(key)),
      revenue: value.revenue,
      orders: value.orders,
    }));

  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  paidOrders.forEach((order) => {
    const key = order.created_at.slice(0, 7);
    const current = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue += order.total_price || 0;
    current.orders += 1;
    monthlyMap.set(key, current);
  });

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: formatMonthLabel(key),
      revenue: value.revenue,
      orders: value.orders,
    }));

  const hourlyMap = new Map<number, { revenue: number; orders: number }>();
  for (let h = 0; h < 24; h += 1) {
    hourlyMap.set(h, { revenue: 0, orders: 0 });
  }
  paidOrders.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    const current = hourlyMap.get(hour)!;
    current.revenue += order.total_price || 0;
    current.orders += 1;
  });

  const hourlySales = Array.from(hourlyMap.entries()).map(([hour, value]) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    orders: value.orders,
    revenue: value.revenue,
  }));

  const productTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
  const categoryTotals = new Map<string, { revenue: number; quantity: number }>();
  WINE_CATEGORIES.forEach((c) => categoryTotals.set(c, { revenue: 0, quantity: 0 }));

  paidOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const name = item.product?.name ?? `Product #${item.product_id}`;
      const lineRevenue = (item.price || 0) * (item.quantity || 0);
      const productEntry = productTotals.get(name) ?? { name, quantity: 0, revenue: 0 };
      productEntry.quantity += item.quantity || 0;
      productEntry.revenue += lineRevenue;
      productTotals.set(name, productEntry);

      const category = inferWineCategory(name, item.product?.type);
      const catEntry = categoryTotals.get(category) ?? { revenue: 0, quantity: 0 };
      catEntry.revenue += lineRevenue;
      catEntry.quantity += item.quantity || 0;
      categoryTotals.set(category, catEntry);
    });
  });

  const bestSellers = Array.from(productTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const categoryPerformance = Array.from(categoryTotals.entries())
    .map(([category, value]) => ({ category, ...value }))
    .filter((c) => c.revenue > 0 || c.quantity > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const buyerTotals = new Map<number, { orders: number; revenue: number }>();
  paidOrders.forEach((order) => {
    const current = buyerTotals.get(order.user_id) ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.total_price || 0;
    buyerTotals.set(order.user_id, current);
  });

  const rankedBuyers = Array.from(buyerTotals.entries())
    .map(([id, stats]) => ({ id, stats, user: userMap.get(id) }))
    .sort((a, b) => b.stats.revenue - a.stats.revenue);

  const topCustomers = rankedBuyers
    .filter((row) => row.user?.role === 'customer')
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      name: userDisplayName(row.user),
      orders: row.stats.orders,
      revenue: row.stats.revenue,
    }));

  const topStaff = rankedBuyers
    .filter((row) => row.user && row.user.role !== 'customer')
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      name: userDisplayName(row.user),
      orders: row.stats.orders,
      revenue: row.stats.revenue,
    }));

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowthPct,
      paidOrderRate,
    },
    dailyRevenue,
    monthlyRevenue,
    hourlySales,
    bestSellers,
    categoryPerformance,
    topCustomers,
    topStaff,
  };
}
