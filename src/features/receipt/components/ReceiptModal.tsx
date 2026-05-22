import React from 'react';
import { X } from 'lucide-react';
import ReceiptActions from './ReceiptActions';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-white/10 bg-black shadow-[0_40px_150px_rgba(0,0,0,0.8)]">
        
        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Success</span>
            <h2 className="font-luxury text-xl tracking-[0.1em] text-white">ORDER RECEIPT</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <ReceiptActions order={order} onClose={onClose} />
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
