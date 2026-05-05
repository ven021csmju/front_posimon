import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Home() {
  const API_BASE = "/api";
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'cash' or 'qr'

  const [currentOrderId, setCurrentOrderId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const handlePaymentSuccess = useCallback(() => {
    const orderId = currentOrderId; 
    setIsConfirmed(true);
    
    setTimeout(() => {
      setCart([]);
      setShowPayment(false);
      setIsConfirmed(false);
      setPaymentMethod(null);
      setCurrentOrderId(null);
      fetchProducts();
      window.location.href = `/orders?print=${orderId}`;
    }, 1500);
  }, [currentOrderId, fetchProducts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "/login";
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("สินค้าหมดสต็อก");
      return;
    }
    const exist = cart.find(item => item.id === product.id);
    if (exist) {
      if (exist.qty >= product.stock) {
        alert("ขออภัย สินค้าในสต็อกไม่เพียงพอ");
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, type) => {
    const product = products.find(p => p.id === id);
    setCart(cart.map(item => {
      if (item.id === id) {
        let newQty = item.qty;
        if (type === "inc") {
          if (newQty < product.stock) newQty += 1;
          else alert("ขออภัย สินค้าในสต็อกไม่เพียงพอ");
        } else {
          newQty -= 1;
        }
        return newQty <= 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckoutClick = async (method) => {
    if (cart.length === 0) {
      alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
      return;
    }

    const token = localStorage.getItem("token");
    let userId = localStorage.getItem("user_id");
    
    if (!token) {
      alert("กรุณา login ใหม่");
      window.location.href = "/login";
      return;
    }

    // ถ้าไม่มี userId ให้ลองใช้ 1 เป็น default เพื่อให้สร้าง order ได้
    if (!userId) {
      console.warn("User ID not found, using default 1 for testing");
      userId = "1";
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/orders`, {
        user_id: Number(userId),
        address_id: 1, 
        payment_method: method || "cash",
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentOrderId(res.data.id);
      setPaymentMethod(method);
      setShowPayment(true);
    } catch (err) {
      console.error("Order Creation Failed:", err.response?.data);
      alert("ไม่สามารถสร้างออเดอร์ได้ (ลองเช็คสินค้าในสต็อก)");
    } finally {
      setLoading(false);
    }
  };

  const finalizeOrderManual = async () => {
    // ข้ามการเช็คหลังบ้าน (Skip API Call) ตามคำขอ
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handlePaymentSuccess();
    }, 800);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#fdfdfd]">
      {/* 💳 Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-none shadow-2xl max-w-sm w-full overflow-hidden border border-[#1a1a1a]">
            <div className="bg-[#1a1a1a] p-4 text-white text-center border-b border-black">
              <img src={logo} alt="Logo" className="w-10 h-10 mx-auto mb-2 rounded-full bg-white p-1" />
              <h3 className="text-xl font-serif italic">The Bottle Club</h3>
              <p className="text-[8px] tracking-[0.2em] uppercase mt-1 text-gray-400">Secure Payment Terminal</p>
            </div>
            
            <div className="p-6 flex flex-col items-center gap-4 min-h-[350px] justify-center">
              {isConfirmed ? (
                <div className="text-center animate-bounce">
                  <span className="text-5xl block mb-2">🥂</span>
                  <h2 className="text-3xl font-serif italic text-[#1a1a1a]">Thank You</h2>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mt-2 font-bold">Your order is being processed</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-gray-400 text-[9px] uppercase tracking-[0.3em] mb-1 font-bold">Total Amount</p>
                    <p className="text-4xl font-serif text-[#1a1a1a]">{total.toLocaleString()} <span className="text-lg">฿</span></p>
                    <p className="text-[8px] uppercase tracking-widest text-black font-bold mt-1">Method: {paymentMethod === 'qr' ? 'PromptPay Scan' : 'Cash Payment'}</p>
                  </div>

                  {paymentMethod === 'qr' ? (
                    <div className="bg-white p-3 border border-gray-100 shadow-sm">
                      <img 
                        src={`${API_BASE}/generate-qr?amount=${total}&phone=0970987745`} 
                        alt="Payment QR Code"
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8 opacity-40">
                      <span className="text-6xl mb-2">💵</span>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Collecting Cash</p>
                    </div>
                  )}

                  <div className="text-center animate-pulse">
                    <p className="text-black text-[9px] uppercase tracking-[0.2em] font-bold">
                      Awaiting Confirmation...
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    <button
                      onClick={finalizeOrderManual}
                      disabled={loading}
                      className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all"
                    >
                      {loading ? "Processing..." : paymentMethod === 'qr' ? "Confirm QR Received" : "Confirm Cash Received"}
                    </button>
                    <button
                      onClick={() => { setShowPayment(false); setPaymentMethod(null); }}
                      className="w-full text-[9px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors py-2"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🛍️ Product List */}
      <div className="w-2/3 flex flex-col h-full bg-[#fcf9f2]">
        <div className="p-8 bg-white border-b border-gray-100">
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-6">
              <img src={logo} alt="The Bottle Club" className="w-16 h-16 object-contain" />
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-black mb-1">Fine Selection</p>
                <h1 className="text-4xl font-serif italic text-[#1a1a1a]">The Bottle Club</h1>
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <Link to="/orders" className="text-[10px] uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all font-bold">
                History
              </Link>
              <button onClick={logout} className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all font-bold">
                Sign Out
              </button>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search our fine collection..."
              className="w-full px-0 py-4 bg-transparent border-b border-gray-200 focus:border-black transition-all outline-none font-serif italic text-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredProducts.map(p => (
                <div 
                  key={p.id} 
                  className={`group bg-white p-6 transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-gray-100 flex flex-col items-center text-center cursor-pointer ${p.stock <= 0 ? 'opacity-40 grayscale' : ''}`}
                  onClick={() => addToCart(p)}
                >
                  <div className="relative mb-6 bg-[#fcfcfc] w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
                    <p className="text-[8px] tracking-[0.5em] uppercase text-gray-300 transform -rotate-90 absolute left-2 font-bold">Established Quality</p>
                    <span className="text-6xl opacity-20">🍾</span>
                    {p.stock <= 5 && p.stock > 0 && (
                      <div className="absolute top-0 right-0 bg-[#1a1a1a] text-white text-[8px] px-2 py-1 uppercase tracking-widest font-bold">Limited</div>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-serif italic text-[#1a1a1a] mb-2 group-hover:text-gray-600 transition-colors">{p.name}</h4>
                  <p className="text-black font-bold text-xl mb-4">{p.price.toLocaleString()} ฿</p>
                  
                  <div className="w-12 h-[1px] bg-gray-200 mb-4 group-hover:w-full transition-all"></div>
                  
                  <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-bold">Inventory: {p.stock}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧾 Sidebar Cart */}
      <div className="w-1/3 bg-white flex flex-col h-full border-l border-gray-100 shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
        <div className="p-10 border-b border-gray-100 bg-[#fcf9f2]">
          <h2 className="text-2xl font-serif italic text-[#1a1a1a]">Your Selection</h2>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mt-1 font-bold">Premium Order Summary</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-40">
              <img src={logo} alt="Empty" className="w-16 h-16 opacity-10 mb-4 grayscale" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Selection Empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-6 group">
                <div className="w-20 h-24 bg-[#fcf9f2] flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all border border-transparent group-hover:border-gray-200">
                  🍾
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-serif italic text-lg text-[#1a1a1a] leading-tight">{item.name}</p>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-black transition-colors text-xs ml-2">✕</button>
                    </div>
                    <p className="text-black font-bold mt-1">{item.price.toLocaleString()} ฿</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center bg-[#f8f8f8] border border-gray-100">
                      <button onClick={() => updateQty(item.id, "dec")} className="w-8 h-8 flex items-center justify-center hover:bg-white transition-all">-</button>
                      <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, "inc")} className="w-8 h-8 flex items-center justify-center hover:bg-white transition-all">+</button>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total: {(item.price * item.qty).toLocaleString()} ฿</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💰 Summary */}
        <div className="p-12 bg-[#1a1a1a] text-white">
          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
              <span>Subtotal</span>
              <span>{(total * 0.93).toFixed(2)} ฿</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
              <span>Service & Tax</span>
              <span>{(total * 0.07).toFixed(2)} ฿</span>
            </div>
            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black pb-1">Grand Total</span>
              <span className="text-4xl font-serif italic">{total.toLocaleString()} <span className="text-sm">฿</span></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              className={`py-4 text-[10px] uppercase tracking-[0.3em] font-black transition-all ${
                cart.length > 0 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
              onClick={() => handleCheckoutClick("cash")}
              disabled={cart.length === 0}
            >
              Cash Payment
            </button>
            <button
              className={`py-4 text-[10px] uppercase tracking-[0.3em] font-black transition-all ${
                cart.length > 0 
                  ? 'bg-black text-white border border-white/20 hover:bg-gray-900' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
              onClick={() => handleCheckoutClick("qr")}
              disabled={cart.length === 0}
            >
              QR Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
