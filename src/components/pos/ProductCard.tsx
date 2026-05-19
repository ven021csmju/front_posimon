import React from 'react';
import { Product } from '../../types';
import { Wine } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
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

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const price = product.selling_price || product.price || 0;
  const isLowStock = product.stock <= 5;
  const displayImage = getDisplayImage(product);

  return (
    <div
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-sm bg-transparent transition-all duration-500"
      onClick={() => onAdd(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0A0A0A]">
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
        
        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
        
        {/* Stock Badge - Minimalist */}
        <div className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
          isLowStock ? 'bg-[#4A0E0E] text-white' : 'bg-black/40 text-white/60'
        }`}>
          {product.stock} IN STOCK
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-1 px-1">
        <span className="font-luxury text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
          {getCategory(product.name)}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-white">
            THB {price.toLocaleString()}
          </span>
          <span className="text-[10px] text-white/30 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Add to Order
          </span>
        </div>
      </div>
      
      {/* Subtle border at bottom that appears on hover */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#D4AF37] transition-all duration-500 group-hover:w-full" />
    </div>
  );
};

export default ProductCard;
