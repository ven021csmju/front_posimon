import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Boxes, History, LogOut, ShoppingCart, UserRound, Users, Wine } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../ui/Button';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const navItems = [
  { label: 'POS', to: '/pos', icon: ShoppingCart },
  { label: 'Orders', to: '/orders', icon: History },
  { label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Inventory', to: '/inventory', icon: Boxes },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Shift', to: '/shift', icon: UserRound },
];

export const AppShell: React.FC<AppShellProps> = ({ title, subtitle, children, actions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const filteredNavItems = navItems.filter(item => {
    if (item.to === '/admin/dashboard') return user?.role === 'admin';
    return user?.role === 'admin' || user?.role === 'cashier';
  });

  const showBackButton = location.pathname.startsWith('/admin') && user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#070606] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#100c0c]/95 p-4 shadow-[20px_0_80px_rgba(0,0,0,0.28)] backdrop-blur xl:block">
        <Link to="/pos" className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#4a0715] text-[#d6b66b]">
            <Wine size={26} />
          </div>
          <div>
            <p className="font-black text-white">PoSimon Cellar</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d6b66b]">Premium POS</p>
          </div>
        </Link>

        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to.includes('/admin') && location.pathname.startsWith('/admin'));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex h-14 items-center gap-3 rounded-2xl px-4 text-sm font-black transition-all ${
                  active
                    ? 'bg-gradient-to-br from-[#7a1026] to-[#2a050d] text-white shadow-lg shadow-[#5a0b1b]/20'
                    : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'text-[#d6b66b]' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Signed in</p>
          <p className="mt-1 truncate font-black text-white">{user?.first_name || 'Staff'} {user?.last_name || ''}</p>
          <Button variant="danger" size="sm" fullWidth className="mt-4" onClick={logout} icon={<LogOut size={16} />}>
            Logout
          </Button>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#100c0c]/90 px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/pos')}
                  icon={<ArrowLeft size={18} />}
                >
                  Back to POS
                </Button>
              )}
              <div>
                <h1 className="font-sans text-2xl font-black tracking-tight text-white">{title}</h1>
                {subtitle && <p className="mt-1 text-sm font-semibold text-zinc-500">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default AppShell;
