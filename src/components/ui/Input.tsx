import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, icon, className = '', ...props }, ref) => (
  <label className="block space-y-2">
    {label && <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>}
    <span className="relative block">
      {icon && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#d6b66b]">{icon}</span>}
      <input
        ref={ref}
        className={[
          'h-14 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#d6b66b]/70 focus:ring-4 focus:ring-[#d6b66b]/10',
          icon ? 'pl-11' : '',
          className,
        ].join(' ')}
        {...props}
      />
    </span>
  </label>
));

Input.displayName = 'Input';

export default Input;
