import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Banknote, CheckCircle2, CreditCard, Printer, QrCode, RefreshCw, Split, X } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { paymentService } from '../../services/posService';
import { useAuthStore } from '../../store/useAuthStore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  initialMethod?: PaymentMethod;
  onConfirm: (method: PaymentMethod, received?: number, change?: number) => void;
}

const quickAmounts = [500, 1000, 2000, 5000];
const keypad = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0', '.'];

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, initialMethod = 'cash', onConfirm }) => {
  const { token } = useAuthStore();
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [received, setReceived] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod);
      setReceived('');
      setShowQR(false);
      setIsSuccess(false);
    }
  }, [initialMethod, isOpen]);

  const receivedAmount = Number(received || 0);
  const change = useMemo(() => Math.max(0, receivedAmount - total), [receivedAmount, total]);

  useEffect(() => {
    if (!showQR) return;

    paymentService.getQRBlob(total, '0970987745').then(setQrCodeUrl).catch((err) => {
      console.error('Failed to fetch QR', err);
    });

    if (!token) return;

    const wsUrl = `wss://possimon.onrender.com/api/ws?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'payment' && data.status === 'paid') {
          setIsSuccess(true);
          window.setTimeout(() => onConfirm('promptpay'), 650);
        }
      } catch (e) {
        console.error('WS parsing error', e);
      }
    };

    return () => {
      socket.close();
      if (qrCodeUrl) URL.revokeObjectURL(qrCodeUrl);
      setQrCodeUrl(null);
    };
  }, [showQR, total, onConfirm]);

  if (!isOpen) return null;

  const appendKey = (key: string) => {
    if (key === '.' && received.includes('.')) return;
    setReceived((current) => `${current}${key}`);
  };

  const handleConfirm = () => {
    if (method === 'cash') {
      if (!receivedAmount || receivedAmount < total) {
        alert('Insufficient received amount');
        return;
      }
      setIsSuccess(true);
      window.setTimeout(() => onConfirm('cash', receivedAmount, change), 450);
      return;
    }

    if (method === 'promptpay') {
      setShowQR(true);
      return;
    }

    setIsSuccess(true);
    window.setTimeout(() => onConfirm(method), 450);
  };

  const methods = [
    { id: 'cash' as PaymentMethod, label: 'CASH', icon: Banknote },
    { id: 'promptpay' as PaymentMethod, label: 'QR CODE', icon: QrCode },
    { id: 'credit_card' as PaymentMethod, label: 'CREDIT CARD', icon: CreditCard },
    { id: 'transfer' as PaymentMethod, label: 'SPLIT BILL', icon: Split },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md selection:bg-[#D4AF37]/30">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-sm border border-white/10 bg-black shadow-[0_40px_150px_rgba(0,0,0,0.8)]">
        
        {isSuccess && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-center">
            <div className="mb-6 h-20 w-20 flex items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
              <CheckCircle2 size={48} strokeWidth={1} />
            </div>
            <h3 className="font-luxury text-2xl tracking-[0.1em] text-white">SETTLEMENT COMPLETE</h3>
            <p className="mt-2 text-[10px] tracking-[0.2em] text-white/40 uppercase">The transaction has been finalized</p>
            <button className="mt-10 inline-flex items-center gap-3 border border-white/10 px-6 py-3 text-[10px] font-bold tracking-[0.3em] text-white/60 hover:text-white hover:border-white transition-all uppercase">
              <Printer size={16} />
              Issue Receipt
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Finalization</span>
            <h2 className="font-luxury text-xl tracking-[0.1em] text-white">ORDER SETTLEMENT</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_380px]">
          <div className="space-y-8 p-8 border-r border-white/5">
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Balance Due</span>
              <div className="text-5xl font-light tracking-tighter text-white">
                THB {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {methods.map((paymentMethod) => (
                <button
                  key={paymentMethod.id}
                  onClick={() => setMethod(paymentMethod.id)}
                  className={`flex h-20 flex-col items-center justify-center gap-2 border text-[9px] font-bold tracking-[0.2em] transition-all uppercase ${
                    method === paymentMethod.id
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <paymentMethod.icon size={18} strokeWidth={1.5} />
                  {paymentMethod.label}
                </button>
              ))}
            </div>

            {showQR ? (
              <div className="flex flex-col items-center space-y-6 py-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">Scan to Complete Payment</p>
                <div className="aspect-square w-64 border border-white/5 p-4 bg-white">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="PromptPay QR" className="h-full w-full grayscale" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/5">
                      <RefreshCw size={24} className="animate-spin text-black/10" />
                    </div>
                  )}
                </div>
                <button onClick={() => setShowQR(false)} className="text-[10px] font-bold tracking-[0.2em] text-white/20 hover:text-white uppercase transition-colors">
                  Return to Methods
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Amount Tendered</label>
                  <div className="relative">
                    <span className="absolute left-0 bottom-4 text-2xl font-light text-white/20">THB</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      value={received}
                      onChange={(e) => setReceived(e.target.value.replace(/[^\d.]/g, ''))}
                      className="w-full border-b border-white/10 bg-transparent py-4 pl-14 text-4xl font-light text-white outline-none transition-all placeholder:text-white/5 focus:border-[#D4AF37]/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setReceived(String(amount))}
                      className="h-10 border border-white/5 bg-white/[0.02] text-[10px] font-bold text-white/60 transition-all hover:border-white/20 hover:text-white"
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Balance Back</span>
                  <span className={`text-2xl font-light tracking-tight ${change > 0 ? 'text-[#D4AF37]' : 'text-white/20'}`}>
                    THB {change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#0A0A0A] p-8">
            <div className="grid grid-cols-3 gap-3">
              {keypad.map((key) => (
                <button
                  key={key}
                  onClick={() => appendKey(key)}
                  className="h-16 border border-white/5 bg-white/[0.02] text-xl font-light text-white transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  {key}
                </button>
              ))}
              <button
                onClick={() => setReceived((current) => current.slice(0, -1))}
                className="h-16 border border-white/5 bg-white/[0.02] text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-white transition-all uppercase"
              >
                DEL
              </button>
              <button
                onClick={() => setReceived('')}
                className="h-16 border border-white/5 bg-white/[0.02] text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-white transition-all uppercase"
              >
                CLR
              </button>
              <button
                onClick={handleConfirm}
                className="col-span-3 flex h-20 items-center justify-center gap-4 bg-[#4A0E0E] text-[11px] font-bold tracking-[0.4em] text-white transition-all hover:bg-[#5E1212] active:scale-[0.98]"
              >
                AUTHORIZE <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
