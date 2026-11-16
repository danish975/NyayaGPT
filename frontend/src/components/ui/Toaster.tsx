"use client";

import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; message: string; tone: Tone };

const useToastStore = create<{
  toasts: ToastItem[];
  push: (message: string, tone: Tone) => void;
  dismiss: (id: number) => void;
}>((set, get) => ({
  toasts: [],
  push: (message, tone) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts.slice(-2), { id, message, tone }] });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Show a short, non-blocking notification. */
export function toast(message: string, tone: Tone = "success") {
  useToastStore.getState().push(message, tone);
}

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  info: <Info className="h-4 w-4 text-gold-ink" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-xl border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lift"
        >
          {ICONS[t.tone]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
