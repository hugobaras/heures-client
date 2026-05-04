"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

const STORAGE_KEY = "heures-client-theme";

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function getThemeSnapshot(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "dark";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      onClick={toggle}
      suppressHydrationWarning
      className={cn(
        "relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-line-default bg-card-elevated text-fg-muted transition-all hover:border-line-strong hover:bg-card-strong",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 12, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute inline-flex"
        >
          {isDark ? (
            <Moon className="size-4" strokeWidth={2} />
          ) : (
            <Sun className="size-4" strokeWidth={2} />
          )}
        </motion.span>
      </AnimatePresence>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklch, var(--neon-violet) 25%, transparent) 0%, transparent 70%)",
        }}
      />
    </button>
  );
}
