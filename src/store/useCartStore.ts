import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;
    const productId = product.id!; // Assume id exists from API
    const existingItem = items.find((item) => item.id === productId);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((item) => item.id !== id) });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + (item.selling_price || item.price || 0) * item.quantity,
      0
    );
  },
}));
