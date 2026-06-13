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
      
      if (user.role !== "student") {
        // Log them out immediately if they do not have student privileges
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setError("Administrative accounts must use the admin login portal.");
        return;
      }
      
      login(token, user);
      
      const from = location.state?.from?.pathname || "/app";
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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in with your KUET student email.</p>
          </div>
          
          {error && (
            <div className="rounded-md bg-blood/10 p-3 text-sm text-blood border border-blood/20">
              {error}
            </div>
          )}

          <Field label="Email" required>
            <Input 
              type="email" 
              placeholder="you@stud.kuet.ac.bd" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Password <span className="text-blood">*</span></span>
              <Link to="/forgot-password" className="text-[10px] text-primary hover:underline">Forgot?</Link>
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
          <Btn type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
          </Btn>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            No account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
          <p className="pt-2 text-center text-[10px] text-muted-foreground">
            <Link to="/admin/login" className="hover:underline">Admin login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
