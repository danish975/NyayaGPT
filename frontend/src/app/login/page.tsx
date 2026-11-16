"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { buttonStyles, inputStyles } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // The server set a signed, httpOnly session cookie; middleware checks it on /admin.
      router.replace("/admin");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        id="main"
        className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center px-4 py-12"
      >
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_65%)]" />
        <section className="w-full max-w-md animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-elegant">
          <div className="bg-emblem px-6 py-6 text-white">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent ring-1 ring-white/15">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <h1 className="mt-4 font-display text-2xl">Admin login</h1>
            <p className="mt-1 text-sm text-white/70">Use your NyayaGPT administrator account.</p>
          </div>

          <form className="space-y-4 p-6" onSubmit={submit} noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                autoFocus
                className={inputStyles}
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  autoComplete="current-password"
                  className={cn(inputStyles, "pr-10")}
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="flex animate-fade-in items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={!canSubmit} className={cn(buttonStyles.primary, "w-full py-3")}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-ink" />
              Secured with a signed, httpOnly session cookie.
            </p>

            {process.env.NODE_ENV === "development" && (
              <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                Dev default (when ADMIN_PASSWORD is unset):{" "}
                <code className="text-foreground">admin</code> /{" "}
                <code className="text-foreground">admin123</code>
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
