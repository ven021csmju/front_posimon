import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound, Wine, Globe, MessageCircle, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import api, { ABSOLUTE_API_URL } from "../services/api";
import { User } from "../types";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUser, isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "manager" || user.role === "cashier") navigate("/pos");
      else navigate("/");
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070606]">
        <div className="text-2xl font-sans font-black text-[#d6b66b] animate-pulse">Checking session...</div>
      </div>
    );
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${api.defaults.baseURL}/auth/login/pos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert("Login failed: " + (errorData?.detail || response.statusText));
        return;
      }

      // After successful login, the HttpOnly cookie is set. 
      // We fetch the user details to verify the session and update the store.
      await fetchUser();
      
      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "manager" || user.role === "cashier") navigate("/pos");
        else navigate("/");
      }
    } catch (err: any) {
      console.error("Login request error:", err);
      alert("Login failed: " + (err.response?.data?.detail || err.message || "Unable to connect to server"));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // For POS frontend, use the /pos variant to ensure correct redirect
    window.location.href = `${ABSOLUTE_API_URL}/auth/login/${provider}/pos`;
  };

  return (
    <div className="min-h-screen bg-[#070606] text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(122,16,38,0.34),transparent_34%),linear-gradient(145deg,#151111,#070606)] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#4a0715] text-[#d6b66b] shadow-lg shadow-[#4a0715]/30">
              <Wine size={30} />
            </div>
            <div>
              <p className="text-xl font-black text-white">PoSimon Cellar</p>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6b66b]">European wine POS</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.22em] text-[#d6b66b]">Premium cashier suite</p>
            <h1 className="font-sans text-6xl font-black leading-[0.95] tracking-tight text-white">
              Luxury wine retail, built for speed.
            </h1>
            <p className="mt-6 text-lg font-medium leading-8 text-zinc-400">
              A dark, focused cashier workflow with barcode support, real-time carts, order history, and admin visibility in one unified system.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Fast checkout", "Live inventory", "Secure shifts"].map((item) => (
              <Card key={item} className="p-4">
                <p className="text-sm font-black text-white">{item}</p>
                <p className="mt-1 text-xs text-zinc-500">Production-ready</p>
              </Card>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center p-5">
          <Card className="w-full max-w-md overflow-hidden">
            <div className="border-b border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#7a1026] to-[#2a050d] text-[#d6b66b] shadow-lg shadow-[#5a0b1b]/20">
                <Wine size={42} />
              </div>
              <h2 className="font-sans text-3xl font-black text-white">Staff Sign In</h2>
              <p className="mt-2 text-sm font-semibold text-zinc-500">Access your cashier terminal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 p-8">
              <Input label="Username" icon={<UserRound size={18} />} value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Input label="Password" icon={<LockKeyhole size={18} />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" variant="primary" size="xl" fullWidth disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="border-t border-white/10 px-8 pb-8 pt-6">
              <p className="mb-4 text-center text-xs font-black uppercase tracking-[0.18em] text-zinc-600">Or continue with</p>
              
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  fullWidth 
                  onClick={() => handleSocialLogin("google")}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10"
                >
                  <Globe size={20} className="text-blue-400" />
                  <span>Sign in with Google</span>
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="secondary" 
                    size="md" 
                    onClick={() => handleSocialLogin("line")}
                    className="flex items-center justify-center gap-2 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-white border-[#06C755]/20"
                  >
                    <MessageCircle size={18} className="text-[#06C755]" />
                    <span>LINE</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="md" 
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-white border-[#1877F2]/20"
                  >
                    <Users size={18} className="text-[#1877F2]" />
                    <span>Facebook</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
