import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Wine } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/ui/Card";

export const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchUser, setToken } = useAuthStore();

  useEffect(() => {
    const processAuth = async () => {
      console.log('AuthSuccess: Processing authentication...');
      
      // If the backend still sends a token in the URL, grab it for WebSockets
      const token = searchParams.get("token");
      if (token) {
        console.log('AuthSuccess: Found token in URL, updating memory store');
        setToken(token);
      }

      try {
        console.log('AuthSuccess: Verifying session via fetchUser');
        await fetchUser();
        
        const currentUser = useAuthStore.getState().user;
        console.log('AuthSuccess: Current user state:', currentUser);
        
        if (currentUser) {
          console.log('AuthSuccess: Login verified, navigating to dashboard/pos');
          if (currentUser.role === "admin") navigate("/admin/dashboard");
          else if (currentUser.role === "manager" || currentUser.role === "cashier") navigate("/pos");
          else navigate("/");
        } else {
          console.warn('AuthSuccess: No user data found after verification, redirecting to login');
          navigate("/login");
        }
      } catch (error) {
        console.error("AuthSuccess: Critical error during verification", error);
        navigate("/login");
      }
    };

    processAuth();
  }, [navigate, fetchUser, searchParams, setToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070606] p-5 text-zinc-100">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-[#d6b66b]/10 text-[#d6b66b]">
          <Wine size={42} />
        </div>
        <CheckCircle2 className="mx-auto mb-5 text-emerald-300" size={44} />
        <h1 className="font-sans text-3xl font-black text-white">Authentication Complete</h1>
        <p className="mt-3 text-sm font-semibold text-zinc-500">Securely connecting to PoSimon Cellar POS.</p>
      </Card>
    </div>
  );
};
