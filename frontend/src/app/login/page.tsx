"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Scale } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

      // Store session
      localStorage.setItem("nyayagpt-admin", "true");
      router.push("/admin");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emblem text-accent">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-foreground">
              Nyaya<span className="text-gradient-gold">GPT</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/library"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Library
            </Link>
            <Link
              href="/eligibility"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Eligibility
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center px-4 py-10">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emblem text-accent">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground">
                Admin login
              </h1>
              <p className="text-sm text-muted-foreground">
                Use your NyayaGPT administrator account.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">
                Username
              </span>
              <input
                autoComplete="username"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-gold"
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">
                Password
              </span>
              <input
                autoComplete="current-password"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-gold"
                disabled={loading}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Default credentials: <code className="text-foreground">admin</code> /{" "}
            <code className="text-foreground">admin123</code>
          </p>
        </section>
      </main>
    </div>
  );
}
