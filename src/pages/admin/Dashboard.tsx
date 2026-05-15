import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, Boxes, PackageSearch, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import api from '../../services/api';
import { Product, User } from '../../types';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const fallbackTrend = [42, 55, 48, 68, 61, 79, 92];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalEmployees: 0,
    growth: 15.8,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersResult, usersResult, productsResult] = await Promise.allSettled([
        api.get('/orders'),
        api.get('/users'),
        api.get('/products'),
      ]);

      const nextOrders = ordersResult.status === 'fulfilled' ? ordersResult.value.data : [];
      const products = productsResult.status === 'fulfilled' ? productsResult.value.data : [];
      let staffUsers: User[] = [];

      if (usersResult.status === 'fulfilled') {
        staffUsers = usersResult.value.data.filter((u: User) => u.role !== 'customer');
      } else {
        try {
          const meRes = await api.get<User>('/users/me');
          staffUsers = meRes.data.role !== 'customer' ? [meRes.data] : [];
        } catch (fallbackError) {
          console.warn('Failed to fetch current user for dashboard fallback', fallbackError);
        }
      }

      const totalSales = nextOrders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0);

      setOrders(nextOrders);
      setStats({
        totalSales,
        totalOrders: nextOrders.length,
        totalEmployees: staffUsers.length,
        growth: 15.8,
      });
      setEmployees(staffUsers);
      setLowStockProducts(products.filter((product: Product) => product.stock < 10));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const bestSellers = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const key = item.product_name || `Product #${item.product_id}`;
        const current = totals.get(key) || { name: key, quantity: 0, revenue: 0 };
        current.quantity += item.quantity || 0;
        current.revenue += (item.price || 0) * (item.quantity || 0);
        totals.set(key, current);
      });
    });

    return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const statCards = [
    { label: 'Total Revenue', value: `THB ${stats.totalSales.toLocaleString()}`, icon: TrendingUp, detail: `+${stats.growth}%`, tone: 'text-emerald-300' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, detail: '+8.2%', tone: 'text-[#d6b66b]' },
    { label: 'Active Staff', value: stats.totalEmployees.toLocaleString(), icon: Users, detail: 'Shift ready', tone: 'text-sky-300' },
    { label: 'Low Stock', value: lowStockProducts.length.toString(), icon: AlertCircle, detail: 'Needs review', tone: 'text-rose-300' },
  ];

  return (
    <AppShell
      title="Dashboard Analytics"
      subtitle="Sales, inventory, staff, and operations in one premium control room."
      actions={
        <Button variant="secondary" icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />} onClick={fetchDashboardData}>
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

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Sales analytics</p>
                <h2 className="mt-2 font-sans text-2xl font-black text-white">Weekly Revenue Flow</h2>
              </div>
              <Button variant="secondary" size="sm">7 days</Button>
            </div>

            <div className="flex h-72 items-end gap-4 border-b border-white/10 px-2 pb-4">
              {fallbackTrend.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex w-full items-end rounded-t-2xl bg-white/[0.04]" style={{ height: `${value}%` }}>
                    <div className="h-full w-full rounded-t-2xl bg-gradient-to-t from-[#7a1026] to-[#d6b66b] shadow-[0_0_30px_rgba(214,182,107,0.12)]" />
                  </div>
                  <span className="text-xs font-black text-zinc-600">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Best sellers</p>
                <h2 className="mt-2 font-sans text-2xl font-black text-white">Top Products</h2>
              </div>
              <PackageSearch className="text-[#d6b66b]" />
            </div>

            <div className="space-y-3">
              {(bestSellers.length ? bestSellers : [
                { name: 'Bordeaux Reserve Red Wine', quantity: 12, revenue: 15480 },
                { name: 'Rose Champagne Cuvee', quantity: 5, revenue: 16250 },
                { name: 'Highland Single Malt Whiskey', quantity: 7, revenue: 15330 },
              ]).map((product, index) => (
                <div key={product.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6b66b]/10 text-sm font-black text-[#d6b66b]">{index + 1}</div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-white">{product.name}</p>
                      <p className="text-xs font-semibold text-zinc-500">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <p className="font-black text-[#d6b66b]">THB {product.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">Staff</p>
                <h2 className="mt-1 font-sans text-xl font-black text-white">Employee Management</h2>
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
                  {employees.length ? employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-black text-white">{employee.first_name} {employee.last_name}</p>
                        <p className="text-xs font-semibold text-zinc-500">{employee.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-[#d6b66b]/20 bg-[#d6b66b]/10 px-3 py-1 text-xs font-black uppercase text-[#d6b66b]">{employee.role}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-emerald-300">Active</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-5 py-10 text-center font-bold text-zinc-500" colSpan={3}>No staff data available</td>
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
                <h2 className="mt-1 font-sans text-xl font-black text-white">Low Stock Alerts</h2>
              </div>
              <Boxes className="text-[#d6b66b]" />
            </div>
            <div className="space-y-3 p-5">
              {lowStockProducts.length ? lowStockProducts.map((product) => (
                <div key={product.id || product.sku} className="flex items-center justify-between rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4">
                  <div>
                    <p className="font-black text-white">{product.name}</p>
                    <p className="text-sm font-semibold text-rose-200">{product.stock} units remaining</p>
                  </div>
                  <Button variant="secondary" size="sm">Restock</Button>
                </div>
              )) : (
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
