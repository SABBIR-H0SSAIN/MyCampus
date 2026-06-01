import { useState } from "react";
import { departments } from "@/lib/mock-data";
import { Logo } from "@/components/brand/Logo";
import { Btn, Field, Input, Select } from "@/components/ui-bits";
import { Upload, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileSelected, setFileSelected] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      await api.get('/sanctum/csrf-cookie');
      await api.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Successfully registered, now pending
      navigate("/pending-approval");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Validation errors
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        setError(firstError[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Already verified? Sign in</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary"><ShieldCheck className="h-5 w-5" /></div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Sign up as a KUETian</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Submit your details and a clear photo of your student ID card. Admins typically approve within 24 hours.</p>
        </div>
        <form className="space-y-6 rounded-2xl border border-border bg-surface p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" required><Input name="name" placeholder="Tahmid Rahman" required disabled={isLoading} /></Field>
            <Field label="Email" required hint="Use your @stud.kuet.ac.bd email"><Input name="email" type="email" placeholder="you@stud.kuet.ac.bd" required disabled={isLoading} /></Field>
            
            <Field label="Roll number" required><Input name="roll_number" placeholder="1907042" required disabled={isLoading} /></Field>
            <Field label="Department" required>
              <Select name="department" required defaultValue="" disabled={isLoading}><option value="" disabled>Select department</option>{departments.map(d => <option key={d}>{d}</option>)}</Select>
            </Field>
            
            <Field label="Batch (year)" required>
              <Select name="batch" required defaultValue="" disabled={isLoading}>
                <option value="" disabled>Select batch</option>
                {Array.from({ length: new Date().getFullYear() - 1967 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gender" required>
              <Select name="gender" required defaultValue="" disabled={isLoading}><option value="" disabled>Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></Select>
            </Field>
            
            <Field label="Password" required><Input name="password" type="password" placeholder="At least 8 characters" required disabled={isLoading} /></Field>
            <Field label="Confirm Password" required><Input name="password_confirmation" type="password" placeholder="Retype password" required disabled={isLoading} /></Field>
            
            <Field label="Phone (optional)"><Input name="phone" type="tel" placeholder="+880 17XX XXX XXX" disabled={isLoading} /></Field>
            <Field label="Blood Group (optional)">
              <Select name="blood_group" defaultValue="" disabled={isLoading}>
                <option value="" disabled>Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
            </Field>
          </div>
          
          {error && (
            <div className="rounded-md bg-blood/10 p-3 text-sm text-blood border border-blood/20">
              {error}
            </div>
          )}

          <Field label="Student ID card" hint="JPG or PNG, max 5MB" required>
            <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-border px-4 py-8 text-sm transition-colors ${fileSelected ? 'bg-primary-soft/30 border-primary' : 'bg-background hover:border-primary/40 hover:text-foreground'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className={`h-4 w-4 ${fileSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={fileSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {fileSelected ? 'ID Card Selected' : 'Tap to upload a clear photo of your student ID'}
              </span>
              <input 
                type="file" 
                name="student_id_card" 
                accept="image/*" 
                className="sr-only" 
                required 
                onChange={(e) => setFileSelected(e.target.files ? e.target.files.length > 0 : false)}
                disabled={isLoading}
              />
            </label>
          </Field>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-primary" disabled={isLoading} />
            <span>I confirm I am a current KUET student and agree to the <a className="text-primary hover:underline" href="#">community guidelines</a>.</span>
          </label>
          <Btn type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Sign up"} <ArrowRight className="h-4 w-4" />
          </Btn>
          <p className="text-center text-xs text-muted-foreground">By registering, you'll be added to a queue. You'll be notified by email once approved.</p>
        </form>
      </main>
    </div>
  );
}
