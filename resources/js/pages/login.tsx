import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Btn, Field, Input } from "@/components/ui-bits";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.get('/sanctum/csrf-cookie');
      
      const response = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      

      
      login(token, user);
      
      const from = location.state?.from?.pathname || (user.role === 'admin' ? "/admin" : "/app");
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        if (err.response.status === 403 && err.response.data.registration_status === 'pending') {
          navigate('/pending-approval', { replace: true });
        }
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 sm:p-9 shadow-lg">
        {/* Header inside the card for cohesive visual flow */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="inline-block mb-3 hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back<span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your campus dashboard & services.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-blood/10 p-3 text-sm text-blood border border-blood/20 text-center font-medium">
              {error}
            </div>
          )}

          <Field label="Email" required>
            <Input
              type="email"
              placeholder="you@kuet.ac.bd"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Password <span className="text-blood">*</span></span>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Btn type="submit" className="w-full mt-2 justify-center py-2.5 text-sm font-semibold shadow-sm" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4 ml-1.5" />
          </Btn>

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border mt-5">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline cursor-pointer">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
