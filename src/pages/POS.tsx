import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Bell,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Split,
  UserRound,
  Wine,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { productService, orderService } from '../services/posService';
import { Product, PaymentMethod } from '../types';
import SearchBar from '../components/pos/SearchBar';
import ProductCard from '../components/pos/ProductCard';
import CartItem from '../components/pos/CartItem';
import CheckoutModal from '../components/pos/CheckoutModal';
import ReceiptModal from '../features/receipt/components/ReceiptModal';

const categories = ['Red Wine', 'White Wine', 'Sparkling', 'Whiskey', 'Snacks'];

const fallbackProducts: Product[] = [
  { id: 101, sku: 'RW-BO-2019', barcode: '885100001019', name: 'Bordeaux Reserve Red Wine 2019', price: 1290, selling_price: 1290, stock: 18 },
  { id: 102, sku: 'RW-CH-2020', barcode: '885100001020', name: 'Chianti Classico Red Wine 2020', price: 980, selling_price: 980, stock: 26 },
  { id: 103, sku: 'WW-SA-2022', barcode: '885100002022', name: 'Sancerre White Wine 2022', price: 1450, selling_price: 1450, stock: 12 },
  { id: 104, sku: 'WW-CH-2021', barcode: '885100002021', name: 'Burgundy Chardonnay White Wine', price: 1680, selling_price: 1680, stock: 7 },
  { id: 105, sku: 'SP-PR-BR', barcode: '885100003001', name: 'Prosecco Brut Sparkling Wine', price: 890, selling_price: 890, stock: 34 },
  { id: 106, sku: 'SP-CH-RS', barcode: '885100003002', name: 'Rose Champagne Sparkling Cuvee', price: 3250, selling_price: 3250, stock: 5 },
  { id: 107, sku: 'WS-SC-12', barcode: '885100004012', name: 'Highland Single Malt Whiskey 12Y', price: 2190, selling_price: 2190, stock: 9 },
  { id: 108, sku: 'SN-CH-01', barcode: '885100005001', name: 'Artisan Cheese Snack Board', price: 420, selling_price: 420, stock: 22 },
];

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user, logout } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Red Wine');
  const [orderNote, setOrderNote] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data.length ? data : fallbackProducts);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const productCategory = (product: Product) => {
    const name = product.name.toLowerCase();
    if (name.includes('whiskey')) return 'Whiskey';
    if (name.includes('sparkling') || name.includes('champagne') || name.includes('prosecco')) return 'Sparkling';
    if (name.includes('white') || name.includes('chardonnay') || name.includes('sancerre')) return 'White Wine';
    if (name.includes('snack') || name.includes('cheese')) return 'Snacks';
    return 'Red Wine';
  };

  const displayedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = productCategory(product) === activeCategory;
      const searchable = [product.name, product.sku, product.barcode].filter(Boolean).join(' ').toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [activeCategory, products, searchQuery]);

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      fetchProducts();
      return;
    }

    const barcodeMatch = products.find((product) => product.barcode === trimmed || product.sku === trimmed);
    if (barcodeMatch) {
      addItem(barcodeMatch);
      setSearchQuery('');
      return;
    }

    setLoading(true);
    try {
      const data = await productService.searchProducts(trimmed);
      setProducts(data.length ? data : products);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotal();
  const discountAmount = Math.min(Math.max(discount, 0), subtotal);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const tax = taxableBase * 0.07;
  const total = taxableBase + tax;

  const handleCheckout = React.useCallback(async (method: PaymentMethod, received?: number, change?: number) => {
    try {
      if (!user) {
        alert('Authentication error: User session not found');
        return;
      }

      setLoading(true);
      const orderData = {
        user_id: user.id,
        order_type: 'pos' as const,
        payment_method: method,
        items: items.map((item) => {
          const itemObj: any = {
            product_id: parseInt(String(item.id)),
            quantity: parseInt(String(item.quantity)),
            price: parseFloat(String(item.selling_price || item.price || 0)),
          };
          if (item.sku) itemObj.sku = item.sku;
          return itemObj;
        }),
        total_price: total,
      };

      if (received !== undefined) (orderData as any).received_amount = parseFloat(String(received));
      if (change !== undefined) (orderData as any).change_amount = parseFloat(String(change));

      const response = await orderService.createOrder(orderData);
      
      // Prepare receipt data
      const receiptData = {
        id: response?.id || Date.now(),
        createdAt: response?.created_at || new Date().toISOString(),
        cashier: user.first_name || 'Staff',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.selling_price || item.price || 0
        })),
        subtotal,
        tax,
        total,
        received_amount: received,
        change_amount: change
      };

      setLastOrder(receiptData);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      
      clearCart();
      setOrderNote('');
      setDiscount(0);
      fetchProducts();
    } catch (error: any) {
      console.error('Checkout failed', error);
      const detail = error.response?.data?.detail || error.response?.data?.message || 'Unknown error';
      
      if (error.response?.status === 401) {
        alert(`Session Error (401): ${detail}\n\nThis usually means the token was rejected by the server. Please check the console for JWT diagnostics.`);
      } else {
        alert('Failed to complete order: ' + detail);
      }
    } finally {
      setLoading(false);
    }
  }, [clearCart, items, subtotal, tax, total, user, fetchProducts]); // Added fetchProducts to deps

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const openCheckout = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setIsCheckoutOpen(true);
  };

  const paymentActions = [
    { label: 'CASH', method: 'cash' as PaymentMethod, icon: Banknote, primary: true },
    { label: 'QR CODE', method: 'promptpay' as PaymentMethod, icon: QrCode },
    { label: 'CREDIT CARD', method: 'credit_card' as PaymentMethod, icon: CreditCard },
    { label: 'SPLIT BILL', method: 'transfer' as PaymentMethod, icon: Split },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black text-white selection:bg-[#D4AF37]/30">
      {/* Premium Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-black/80 px-8 py-5 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#4A0E0E] text-[#D4AF37]">
              <Wine size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-luxury text-lg leading-tight tracking-[0.1em] text-white">THE BOTTLE CLUB</h1>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37]/80 uppercase">Exclusive POS</span>
            </div>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Local Time</span>
            <span className="text-sm font-medium tracking-widest">{clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 border border-[#D4AF37]/20 bg-[#4A0E0E]/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10 uppercase"
              >
                <LayoutDashboard size={14} strokeWidth={1.5} />
                Management
              </button>
            )}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Operator</span>
              <span className="text-sm font-medium">{user?.first_name || 'Staff Member'}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/20 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Main Product Area */}
        <main className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar">
          {/* Category Bar */}
          <div className="sticky top-0 z-10 border-b border-white/5 bg-[#050505]/90 px-8 py-4 backdrop-blur">
            <div className="flex gap-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative py-1 text-[11px] font-bold tracking-[0.25em] uppercase transition-colors ${
                    activeCategory === category
                      ? 'text-white'
                      : 'text-white/20 hover:text-white/50'
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <div className="absolute -bottom-4 left-0 h-[1px] w-full bg-[#D4AF37]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 pb-40">
            {loading && products.length === 0 ? (
              <div className="flex h-[50vh] flex-col items-center justify-center text-white/10">
                <RefreshCw size={40} className="mb-4 animate-spin" />
                <p className="text-xs tracking-[0.2em] uppercase">Inventory Loading</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id || product.sku} product={product} onAdd={addItem} />
                ))}
              </div>
            )}
            
            {displayedProducts.length === 0 && !loading && (
              <div className="flex h-[50vh] flex-col items-center justify-center text-white/10">
                <Wine size={60} strokeWidth={0.5} className="mb-6" />
                <p className="text-xs tracking-[0.2em] uppercase">No Selections Available</p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Cart */}
        <aside className="flex w-[400px] shrink-0 flex-col border-l border-white/5 bg-black">
          <div className="flex items-center justify-between border-b border-white/5 p-6">
            <div className="flex flex-col">
              <h2 className="font-luxury text-sm tracking-[0.1em] text-white">CURRENT ORDER</h2>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                {itemCount} {itemCount === 1 ? 'Selection' : 'Selections'}
              </span>
            </div>
            <button
              onClick={clearCart}
              className="text-[10px] font-bold tracking-[0.2em] text-white/20 hover:text-[#4A0E0E] transition-colors uppercase"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            {items.length > 0 ? (
              <div className="divide-y divide-white/5">
                {items.map((item) => (
                  <CartItem key={item.id || item.sku} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Wine size={40} strokeWidth={0.5} className="mb-4 text-white/10" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/20">Empty Order</p>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-white/5 bg-black p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-medium tracking-widest text-white/40 uppercase">
                <span>Subtotal</span>
                <span className="text-white">THB {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-medium tracking-widest text-white/40 uppercase">
                <span>Discount</span>
                <span className="text-white">{(discount > 0 ? '- ' : '')}THB {discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-medium tracking-widest text-white/40 uppercase">
                <span>VAT (7%)</span>
                <span className="text-white">THB {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/5">
                <span className="font-luxury text-sm tracking-[0.2em] text-[#D4AF37]">TOTAL</span>
                <span className="font-luxury text-2xl tracking-tighter text-white">
                  THB {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                disabled={items.length === 0}
                onClick={() => openCheckout('cash')}
                className="h-16 w-full bg-[#4A0E0E] text-white text-[11px] font-bold tracking-[0.3em] uppercase transition-all hover:bg-[#5E1212] disabled:opacity-20 disabled:cursor-not-allowed"
              >
                PROCEED TO SETTLEMENT
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Payment Bar - Refined */}
      <div className="border-t border-white/5 bg-black/80 px-8 py-4 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-4">
          {paymentActions.map(({ label, method, icon: Icon, primary }) => (
            <button
              key={label}
              disabled={items.length === 0}
              onClick={() => openCheckout(method)}
              className={`flex h-14 items-center justify-center gap-3 border border-white/10 text-[10px] font-bold tracking-[0.3em] transition-all hover:border-[#D4AF37]/50 active:scale-[0.98] disabled:opacity-20 ${
                primary ? 'bg-white text-black border-white' : 'text-white/60'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        initialMethod={selectedPaymentMethod}
        onConfirm={handleCheckout}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={lastOrder}
      />
    </div>
  );
};

export default POS;
