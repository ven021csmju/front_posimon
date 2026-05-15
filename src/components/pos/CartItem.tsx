import React from 'react';
import { CartItem as CartItemType } from '../../types';
import { Minus, Plus, X } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const displayPrice = item.selling_price || item.price || 0;

  return (
    <div className="group flex flex-col gap-2 py-4 border-b border-white/5 last:border-0">
      <div className="flex justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-semibold uppercase tracking-wider text-white/90">{item.name}</h4>
          <p className="mt-0.5 text-[10px] text-white/40 tracking-widest uppercase">
            Unit: THB {displayPrice.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => onRemove(item.id!)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-white/10 rounded-sm">
            <button
              onClick={() => onUpdateQuantity(item.id!, item.quantity - 1)}
              className="px-2 py-1 text-white/40 hover:text-white transition-colors border-r border-white/10"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-xs font-medium text-white">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id!, item.quantity + 1)}
              className="px-2 py-1 text-white/40 hover:text-white transition-colors border-l border-white/10"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <p className="text-sm font-bold text-white tracking-tight">
          THB {(displayPrice * item.quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
