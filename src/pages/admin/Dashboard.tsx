import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, Boxes, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import api from '../../services/api';
import { productService } from '../../services/posService';
import { Product, User } from '../../types';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BusinessInsights from '../../features/analytics/components/BusinessInsights';
import type { AnalyticsOrder, AnalyticsUser } from '../../features/analytics/types';
import { computeAnalytics } from '../../features/analytics/utils/computeAnalytics';
import { formatCurrency } from '../../features/analytics/components/chartTheme';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<AnalyticsOrder[]>([]);
  const [users, setUsers] = useState<AnalyticsUser[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const analytics30d = useMemo(
    () => computeAnalytics(orders, users, '30d'),
    [orders, users]
  );

  const handleRefill = async (productId: number) => {
    const amount = prompt('Enter quantity to add:');
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);
    try {
      await productService.refillStock(productId, Number(amount));
      await fetchDashboardData();
    } catch (error) {
      console.error('Refill failed', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersResult, employeesResult, productsResult, customersResult] = await Promise.allSettled([
        api.get('/orders'),
        api.get('/employees'),
        api.get('/products'),
        api.get('/customers'),
      ]);

      const nextOrders: AnalyticsOrder[] =
        ordersResult.status === 'fulfilled' ? ordersResult.value.data : [];
      const products = productsResult.status === 'fulfilled' ? productsResult.value.data : [];
      let staffUsers: User[] = [];

      if (employeesResult.status === 'fulfilled') {
        staffUsers = employeesResult.value.data;
      } else {
        try {
          const meRes = await api.get<User>('/users/me');
          staffUsers = meRes.data.role !== 'customer' ? [meRes.data] : [];
        } catch (fallbackError) {
          console.warn('Failed to fetch employees for dashboard fallback', fallbackError);
        }
      }

      const customers: AnalyticsUser[] =
        customersResult.status === 'fulfilled' ? customersResult.value.data : [];

      const mergedUsers: AnalyticsUser[] = [
        ...staffUsers.map((u) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: u.role,
        })),
        ...customers,
      ];

      setOrders(nextOrders);
      setUsers(mergedUsers);
      setEmployees(staffUsers);
      setLowStockProducts(
        products.filter((product: Product) => product.stock < (product.low_stock_alert ?? 10))
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const growthDetail =
    analytics30d.summary.revenueGrowthPct === null
      ? 'vs prior week'
      : `${analytics30d.summary.revenueGrowthPct >= 0 ? '+' : ''}${analytics30d.summary.revenueGrowthPct.toFixed(1)}%`;

  const statCards = [
    {
      label: 'Revenue (30d)',
      value: formatCurrency(analytics30d.summary.totalRevenue),
      icon: TrendingUp,
      detail: growthDetail,
      tone: 'text-emerald-300',
    },
    {
      label: 'Orders (30d)',
      value: analytics30d.summary.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      detail: `${analytics30d.summary.paidOrderRate.toFixed(0)}% paid`,
      tone: 'text-[#d6b66b]',
    },
    {
      label: 'Avg. order value',
      value: formatCurrency(analytics30d.summary.averageOrderValue),
      icon: TrendingUp,
      detail: '30-day AOV',
      tone: 'text-sky-300',
    },
    {
      label: 'Low stock',
      value: lowStockProducts.length.toString(),
      icon: AlertCircle,
      detail: 'Needs review',
      tone: 'text-rose-300',
    },
  ];

  return (
    <AppShell
      title="Dashboard Analytics"
      subtitle="Business insights, inventory, and staff operations in one control room."
      actions={
        <Button
          variant="secondary"
          icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
      }
    >
      <main className="space-y-5 p-5">
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} interactive className="p-5">
                <div className="mb-8 flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#d6b66b]/20 bg-[#d6b66b]/10 text-[#d6b66b]">
                    <Icon size={26} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] ${stat.tone}`}>
                    <ArrowUpRight size={14} />
                    {stat.detail}
                  </div>
                </div>
                <p className="text-sm font-bold text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{stat.value}</p>
              </Card>
            );
          })}
        </section>

        <BusinessInsights orders={orders} users={users} />

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Staff</p>
                <h2 className="mt-1 font-sans text-xl font-black text-white">Employee management</h2>
              </div>
              <Users className="text-[#d6b66b]" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {employees.length ? (
                    employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-4">
                          <p className="font-black text-white">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs font-semibold text-zinc-500">{employee.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-[#d6b66b]/20 bg-[#d6b66b]/10 px-3 py-1 text-xs font-black uppercase text-[#d6b66b]">
                            {employee.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-300">Active</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-10 text-center font-bold text-zinc-500" colSpan={3}>
                        No staff data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Inventory</p>
                <h2 className="mt-1 font-sans text-xl font-black text-white">Low stock alerts</h2>
              </div>
              <Boxes className="text-[#d6b66b]" />
            </div>
            <div className="space-y-3 p-5">
              {lowStockProducts.length ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id || product.sku}
                    className="flex items-center justify-between rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4"
                  >
                    <div>
                      <p className="font-black text-white">{product.name}</p>
                      <p className="text-sm font-semibold text-rose-200">{product.stock} units remaining</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => product.id && handleRefill(product.id)}>
                      Restock
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <ShoppingBag size={54} className="mb-4 opacity-25" />
                  <p className="font-bold">All products are well stocked</p>
                </div>
              )}
            </div>
          </Card>
        </section>
      </main>
    </AppShell>
  );
};

export default AdminDashboard;
