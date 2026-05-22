import { Printer, Download } from "lucide-react";
import Receipt from "./Receipt";
import { useReceipt } from "../hooks/useReceipt";

interface ReceiptActionsProps {
  order: any;
  onClose?: () => void;
}

export default function ReceiptActions({ order, onClose }: ReceiptActionsProps) {
  const { receiptRef, handlePrint, handleDownloadPdf } = useReceipt(order.id);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container for the receipt (hidden from screen if needed, or shown in modal) */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-inner overflow-auto max-h-[60vh]">
        <Receipt ref={receiptRef} order={order} />
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => handlePrint()}
          className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <Printer size={20} />
          <span>Print Receipt</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          className="flex-1 flex items-center justify-center gap-2 bg-[#4A0E0E] hover:bg-[#5E1212] text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <Download size={20} />
          <span>Save PDF</span>
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-[10px] font-bold tracking-[0.2em] uppercase"
        >
          Close & Return to POS
        </button>
      )}
    </div>
  );
}
