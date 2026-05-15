import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusScannerInput = () => inputRef.current?.focus();
    focusScannerInput();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName)) {
        focusScannerInput();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-[#D4AF37]/40" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full border-b border-white/5 bg-transparent py-2.5 pl-10 pr-4 text-sm font-light tracking-wide text-white outline-none transition-all placeholder:text-white/10 focus:border-[#D4AF37]/30"
          placeholder="Search by name, barcode, or SKU..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </form>
      <div className="flex items-center gap-1.5 pl-10 opacity-40">
        <div className="h-1 w-1 rounded-full bg-[#D4AF37] animate-pulse" />
        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#D4AF37]">
          Scanner Link Active
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
