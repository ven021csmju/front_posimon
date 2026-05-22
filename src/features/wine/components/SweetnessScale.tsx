interface Props {
  level: number;
  label: string;
}

export default function SweetnessScale({ level, label }: Props) {
  const clamped = Math.min(5, Math.max(1, level));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sweetness</span>
        <span className="text-xs font-bold text-[#d6b66b]">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-colors ${
              step <= clamped
                ? 'bg-gradient-to-r from-[#7a1026] to-[#d6b66b]'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-600">
        <span>Dry</span>
        <span>Sweet</span>
      </div>
    </div>
  );
}
