import React from 'react';
import { Info, Wine } from 'lucide-react';
import { Product } from '../../types';
import type { Wine as WineType } from '../../types/wine';

interface ProductCardProps {
  product: Product;
  wine?: WineType | null;
  onAdd: (product: Product) => void;
  onViewDetail?: (product: Product, wine?: WineType | null) => void;
}

const getCategory = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('whiskey')) return 'Whiskey';
  if (normalized.includes('sparkling') || normalized.includes('champagne')) return 'Sparkling';
  if (normalized.includes('white')) return 'White Wine';
  if (normalized.includes('snack') || normalized.includes('cheese')) return 'Snacks';
  return 'Red Wine';
};

const getDisplayImage = (product: Product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].image_url;
  }
  return product.image_url;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, wine, onAdd, onViewDetail }) => {
  const price = product.selling_price || product.price || 0;
  const isLowStock = product.stock <= 5;
  const displayImage = getDisplayImage(product);
  const showSommelier = !!wine || product.name.toLowerCase().includes('wine');

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm bg-transparent transition-all duration-500">
      <div
        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-[#0A0A0A]"
        onClick={() => onAdd(product)}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#D4AF37]/20">
            <Wine size={80} strokeWidth={0.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        {showSommelier && onViewDetail && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product, wine);
            }}
            className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-[#D4AF37]/30 bg-black/50 text-[#D4AF37] opacity-0 backdrop-blur transition-all hover:bg-[#D4AF37]/20 group-hover:opacity-100"
            aria-label="View wine details"
          >
            <Info size={16} />
          </button>
        )}

        <div
          className={`absolute right-3 top-3 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
            isLowStock ? 'bg-[#4A0E0E] text-white' : 'bg-black/40 text-white/60'
          }`}
        >
          {product.stock} IN STOCK
        </div>

        {wine?.vintage && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            <span className="rounded-sm bg-black/60 px-2 py-0.5 text-[9px] font-black tracking-wider text-[#D4AF37]">
              {wine.vintage}
            </span>
            {wine.alcohol && (
              <span className="rounded-sm bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white/80">
                {wine.alcohol}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex cursor-pointer flex-col space-y-1 px-1" onClick={() => onAdd(product)}>
        <span className="font-luxury text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
          {wine?.wine_type || getCategory(product.name)}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium tracking-tight text-white/90 transition-colors group-hover:text-white">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-white">THB {price.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wider text-white/30 opacity-0 transition-opacity group-hover:opacity-100">
            Add to Order
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#D4AF37] transition-all duration-500 group-hover:w-full" />
    </div>
  );
};

export default ProductCard;
