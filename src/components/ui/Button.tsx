import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-gradient-to-br from-[#7a1026] via-[#5a0b1b] to-[#2a050d] text-white shadow-[0_16px_42px_rgba(90,11,27,0.32)] hover:from-[#8e1830] hover:to-[#3a0712]',
  secondary:
    'border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_14px_40px_rgba(0,0,0,0.22)] hover:border-[#d6b66b]/40 hover:bg-white/[0.09]',
  ghost:
    'border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white',
  danger:
    'border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-xs',
  md: 'h-12 px-4 text-sm',
  lg: 'h-14 px-5 text-base',
  xl: 'h-16 px-6 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  fullWidth,
  icon,
  ...props
}) => (
  <button
    className={[
      'inline-flex items-center justify-center gap-2 rounded-xl border font-black transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {icon}
    {children}
  </button>
);

export default Button;
