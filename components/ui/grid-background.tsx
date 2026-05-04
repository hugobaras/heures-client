"use client";

import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  className?: string;
  variant?: "dots" | "grid";
};

export function GridBackground({
  className,
  variant = "dots",
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 mask-radial",
          variant === "dots" ? "dot-bg" : "grid-bg",
        )}
      />

      <div
        aria-hidden
        className="absolute -top-1/4 left-1/2 size-[600px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--aurora-1) 0%, transparent 60%)",
          animation: "aurora 18s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="absolute right-0 bottom-0 size-[500px] translate-x-1/4 translate-y-1/4 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--aurora-2) 0%, transparent 60%)",
          animation: "aurora 14s ease-in-out infinite",
          animationDelay: "-4s",
        }}
      />
    </div>
  );
}
