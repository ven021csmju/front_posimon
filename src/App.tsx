import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { AuthSuccess } from "./pages/AuthSuccess";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import ShiftManagement from "./pages/ShiftManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import { useAuthStore } from "./store/useAuthStore";
import { Role } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070606]">
        <div className="text-2xl font-sans font-black text-[#d6b66b] animate-pulse">Loading PoSimon...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#070606] p-6 text-center">
    <div className="max-w-2xl border-4 border-[#d6b66b] p-10 bg-black shadow-[0_0_50px_rgba(214,182,107,0.2)]">
      <h1 className="text-8xl font-black text-[#d6b66b] mb-6 tracking-tighter animate-bounce">🚨 STOP!</h1>
      <h2 className="text-4xl font-bold text-white mb-4 uppercase">หยุดอยู่ตรงนั้นแหละเจ้าหนู!</h2>
      <p className="text-xl text-gray-400 mb-8 leading-relaxed">
        พื้นที่ตรงนี้มัน "ระดับตำนาน" เฉพาะ <span className="text-[#d6b66b] font-bold">Admin</span> และ <span className="text-[#d6b66b] font-bold">Cashier</span> เท่านั้นที่มีสิทธิ์ย่างกรายเข้ามา <br/>
        คนธรรมดาอย่างคุณน่ะ... กลับไปกินนมแล้วนอนซะไป๊! <br/>
        <span className="text-sm mt-4 block italic">"ที่นี่ PoSimon... ไม่ใช่สนามเด็กเล่น"</span>
      </p>
      <button 
        onClick={() => window.location.href = "/"}
        className="px-10 py-4 bg-[#d6b66b] text-black font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(214,182,107,0.5)]"
      >
        ถอยไปตั้งหลักก่อน
      </button>
    </div>
  </div>
);

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <POS />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/newpos" 
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <POS />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <Orders />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shift"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <ShiftManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
