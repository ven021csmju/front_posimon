import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, eyebrow, onClose, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className={`relative w-full ${maxWidth} overflow-hidden rounded-3xl border border-white/10 bg-[#120e0e]/95 shadow-[0_30px_120px_rgba(0,0,0,0.65)]`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b66b] to-transparent" />
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            {eyebrow && <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6b66b]">{eyebrow}</p>}
            <h2 className="font-sans text-2xl font-black text-white">{title}</h2>
          </div>
          <Button type="button" variant="ghost" className="h-11 w-11 px-0" onClick={onClose}>
            <X size={22} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
