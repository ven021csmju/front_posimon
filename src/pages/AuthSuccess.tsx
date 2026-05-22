import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wine } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/ui/Card";

export const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchUser, setToken } = useAuthStore();

  useEffect(() => {
    const processAuth = async () => {
      const error = searchParams.get("error");
      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      const token = searchParams.get("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setToken(token);

      try {
        await fetchUser();
        const currentUser = useAuthStore.getState().user;

        if (!currentUser || !useAuthStore.getState().isAuthenticated) {
          navigate("/login", { replace: true });
          return;
        }

        if (currentUser.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (currentUser.role === "manager" || currentUser.role === "cashier") {
          navigate("/pos", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } catch {
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [navigate, fetchUser, searchParams, setToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070606] p-5 text-zinc-100">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-[#d6b66b]/10 text-[#d6b66b] animate-pulse">
          <Wine size={42} />
        </div>
        <h1 className="font-sans text-2xl font-black text-white">Signing you in...</h1>
        <p className="mt-3 text-sm font-semibold text-zinc-500">Please wait a moment.</p>
      </Card>
    </div>
  );
};
