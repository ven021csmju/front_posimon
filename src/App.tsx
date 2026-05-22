import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { AuthSuccess } from "./pages/AuthSuccess";
import { useAuthStore } from "./store/useAuthStore";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import RootRedirect from "./components/auth/RootRedirect";
import AuthenticatedShell from "./components/auth/AuthenticatedShell";
import PageLoader from "./components/ui/PageLoader";
import { Role } from "./types";

const Home = lazy(() => import("./pages/Home"));
const Orders = lazy(() => import("./pages/Orders"));
const POS = lazy(() => import("./pages/POS"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Customers = lazy(() => import("./pages/Customers"));
const ShiftManagement = lazy(() => import("./pages/ShiftManagement"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader label="Loading PoSimon..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
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
        onClick={() => { window.location.href = "/login"; }}
        className="px-10 py-4 bg-[#d6b66b] text-black font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(214,182,107,0.5)]"
      >
        ถอยไปตั้งหลักก่อน
      </button>
    </div>
  </div>
);

function App() {
  useAuthBootstrap();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/home"
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
