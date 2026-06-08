import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Btn, Field, Input } from "@/components/ui-bits";
import { ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sanctum CSRF protection
      await api.get('/sanctum/csrf-cookie');
      
      const response = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      const roles = user.roles ? user.roles.map((r: any) => r.name) : [];
      
      if (!roles.includes("admin")) {
        // Log them out immediately if they are not an admin
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setError("You do not have administrative privileges.");
        return;
      }
      
      login(token, user, roles);
      
      const from = location.state?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-sidebar px-4 text-sidebar-foreground">
      <div className="mb-8 flex flex-col items-center">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-sidebar-border bg-background p-6 md:p-8 shadow-sm text-foreground">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Authenticate to access the admin panel.</p>
          </div>
          
          {error && (
            <div className="rounded-md bg-blood/10 p-3 text-sm text-blood border border-blood/20">
              {error}
            </div>
          )}

          <Field label="Email" required>
            <Input 
              type="email" 
              placeholder="admin@mycampus.test" 
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
          
          <Btn type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign in to Admin Panel"} <ArrowRight className="h-4 w-4" />
          </Btn>
          
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Student? <Link to="/login" className="font-medium text-primary hover:underline">Go to student login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
