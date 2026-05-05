import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Orders() {
  const API_BASE = "/api";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);

      // ตรวจสอบ query parameter "print"
      const urlParams = new URLSearchParams(window.location.search);
      const printId = urlParams.get("print");
      if (printId) {
        const orderToPrint = res.data.find(o => String(o.id) === printId);
        if (orderToPrint) {
          setSelectedOrder(orderToPrint);
          // รอให้ UI render รายละเอียดก่อนแล้วค่อยพิมพ์
          setTimeout(() => {
            window.print();
            // ล้าง query string เพื่อไม่ให้พิมพ์ซ้ำเมื่อ refresh
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 500);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="p-6 bg-white shadow-sm flex justify-between items-center no-print">
        <h1 className="text-3xl font-extrabold text-blue-600">📜 ประวัติการขาย (Bills)</h1>
        <Link to="/" className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-xl font-bold transition-all text-gray-600">
          ← กลับหน้า POS
        </Link>
      </div>

      <div className="flex-1 p-6 flex gap-6">
        {/* Orders List */}
        <div className="w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col no-print">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">รายการบิลทั้งหมด</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center text-gray-400">กำลังโหลด...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-gray-400">ยังไม่มีรายการขาย</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-bold">บิลเลขที่</th>
                    <th className="px-6 py-4 font-bold">วันที่</th>
                    <th className="px-6 py-4 font-bold text-right">ยอดรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 font-bold text-blue-600">#ORD-{order.id}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-800">
                        {order.total_price.toLocaleString()} บาท
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="w-1/2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col printable-content">
          {selectedOrder ? (
            <>
              <div className="p-8 border-b bg-blue-600 text-white print:bg-white print:text-black print:border-b-2 print:border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black">รายละเอียดบิล</h2>
                    <p className="opacity-80 mt-1">#ORD-{selectedOrder.id}</p>
                    <p className="text-sm mt-1 hidden print:block">วันที่: {new Date(selectedOrder.created_at).toLocaleString('th-TH')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-80 uppercase tracking-widest">ยอดสุทธิ</p>
                    <p className="text-4xl font-black">{selectedOrder.total_price.toLocaleString()} ฿</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 print:text-black">รายการสินค้า (Items)</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white print:border-b print:rounded-none">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold print:border print:border-black print:text-black">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 print:text-black">{item.product_name || `สินค้า #${item.product_id}`}</p>
                          <p className="text-sm text-gray-400 print:text-black">ราคาต่อชิ้น: {item.price.toLocaleString()} ฿</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-800 print:text-black">
                        {(item.price * item.quantity).toLocaleString()} ฿
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t flex gap-4 no-print">
                <button 
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
                  onClick={() => window.print()}
                >
                  🖨️ พิมพ์ใบเสร็จ
                </button>
                <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                  📧 ส่งอีเมล
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <span className="text-8xl mb-6">📄</span>
              <p className="text-xl">เลือกรายการบิลเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}