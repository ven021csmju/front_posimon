export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface AnalyticsOrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name?: string;
    type?: string;
  };
}

export interface AnalyticsOrder {
  id: number;
  user_id: number;
  total_price: number;
  status?: string;
  created_at: string;
  items?: AnalyticsOrderItem[];
}

export interface AnalyticsUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface DashboardAnalytics {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowthPct: number | null;
    paidOrderRate: number;
  };
  dailyRevenue: { key: string; label: string; revenue: number; orders: number }[];
  monthlyRevenue: { key: string; label: string; revenue: number; orders: number }[];
  hourlySales: { hour: number; label: string; orders: number; revenue: number }[];
  bestSellers: { name: string; quantity: number; revenue: number }[];
  categoryPerformance: { category: string; revenue: number; quantity: number }[];
  topCustomers: { id: number; name: string; orders: number; revenue: number }[];
  topStaff: { id: number; name: string; orders: number; revenue: number }[];
}
