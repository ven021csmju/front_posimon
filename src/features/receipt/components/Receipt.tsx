import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface ReceiptProps {
  order: any;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ order }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 w-[320px] font-mono"
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest">PoSimon</h1>
          <p className="text-xs text-gray-600">Premium Wine & POS System</p>
        </div>

        <div className="border-t border-b border-dashed py-2 mb-4 text-xs">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-bold">#{order.id.toString().slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.createdAt || Date.now()).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.cashier || "System"}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-bold border-b pb-1">
            <span>Item</span>
            <span>Total</span>
          </div>
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className="text-xs text-gray-500">
                  {item.qty} x ฿{item.price.toLocaleString()}
                </span>
              </div>
              <span className="self-center">
                ฿{(item.price * item.qty).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-2 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>฿{order.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>VAT (7%)</span>
            <span>฿{order.tax.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-1 mt-1">
            <span>Total</span>
            <span>฿{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center mt-6 space-y-3">
          <QRCodeSVG
            value={`https://posimon.com/order/${order.id}`}
            size={100}
            level="H"
          />
          <div className="text-center">
            <p className="text-xs font-bold">Thank you for your visit!</p>
            <p className="text-[10px] text-gray-500">Scan to view e-Receipt</p>
          </div>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";

export default Receipt;
