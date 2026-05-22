import { X, Wine, Grape, MapPin, Clock, UtensilsCrossed, Droplets, FlaskConical, Sparkles } from 'lucide-react';
import type { Product } from '../../../types';
import type { Wine as WineType } from '../../../types/wine';
import { buildSommelierView } from '../utils/wineInsights';
import SweetnessScale from './SweetnessScale';
import Button from '../../../components/ui/Button';

interface Props {
  wine: WineType;
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const agingTone: Record<string, string> = {
  young: 'border-sky-400/30 bg-sky-500/10 text-sky-200',
  ready: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  peak: 'border-[#d6b66b]/40 bg-[#d6b66b]/10 text-[#e5c98d]',
  mature: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
};

export default function WineDetailModal({ wine, product, isOpen, onClose, onAddToCart }: Props) {
  if (!isOpen) return null;

  const view = buildSommelierView(wine);
  const price = product.selling_price || product.price || 0;
  const image =
    product.images?.[0]?.image_url || product.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#d6b66b]/25 bg-[#070606]/95 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#4a0715] text-[#d6b66b]">
              <Wine size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d6b66b]">Sommelier profile</p>
              <h2 className="font-luxury text-xl font-black text-white">{product.name}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[280px] bg-[#0a0a0a] lg:min-h-0">
            {image ? (
              <img src={image} alt={product.name} className="h-full min-h-[280px] w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-[#d6b66b]/20">
                <Wine size={120} strokeWidth={0.5} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070606] via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-luxury text-3xl font-black text-white">THB {price.toLocaleString()}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                {view.bottleSize} · {wine.vintage ? `Vintage ${wine.vintage}` : 'NV'} · {wine.alcohol ? `${wine.alcohol}% ABV` : '—'}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              {wine.wine_type && (
                <span className="rounded-full border border-[#d6b66b]/25 bg-[#d6b66b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#d6b66b]">
                  {wine.wine_type}
                </span>
              )}
              {wine.winery?.name && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-zinc-300">
                  {wine.winery.name}
                </span>
              )}
              {wine.region?.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-zinc-300">
                  <MapPin size={10} />
                  {wine.region.name}
                </span>
              )}
            </div>

            <div className={`rounded-2xl border p-4 ${agingTone[view.aging.status]}`}>
              <div className="flex items-start gap-3">
                <Clock size={18} className="shrink-0 opacity-80" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em]">Aging recommendation</p>
                  <p className="mt-1 text-lg font-black">{view.aging.label}</p>
                  <p className="mt-1 text-sm font-semibold opacity-90">Window: {view.aging.window}</p>
                  <p className="mt-1 text-xs opacity-75">{view.aging.detail}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-[#d6b66b]">
                  <Droplets size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">Alcohol</span>
                </div>
                <p className="text-2xl font-black text-white">{wine.alcohol ? `${wine.alcohol}%` : '—'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-[#d6b66b]">
                  <FlaskConical size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">Bottle</span>
                </div>
                <p className="text-2xl font-black text-white">{view.bottleSize}</p>
              </div>
            </div>

            <SweetnessScale level={view.sweetness} label={view.sweetnessLabel} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-[#d6b66b]">
                <UtensilsCrossed size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">Food pairing</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {view.pairings.map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-zinc-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {wine.grapes && wine.grapes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Grape size={14} className="text-[#d6b66b]" />
                {wine.grapes.map((g) => (
                  <span key={g.id} className="text-xs font-bold text-zinc-400">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-[#d6b66b]/15 bg-[#d6b66b]/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#d6b66b]">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">Tasting notes</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{view.tastingNotes}</p>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={() => { onAddToCart(product); onClose(); }}>
              Add to order — THB {price.toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
