import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', interactive, ...props }) => (
  <div
    className={[
      'rounded-2xl border border-white/10 bg-[#151111]/90 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur',
      interactive ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d6b66b]/45 hover:bg-[#1b1514]' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </div>
);

export default Card;
