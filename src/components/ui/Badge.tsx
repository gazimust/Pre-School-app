import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const colorMap: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 border-gray-300",
  green: "bg-leaf-100 text-leaf-800 border-leaf-300",
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  red: "bg-red-100 text-red-800 border-red-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  brand: "bg-brand-100 text-brand-800 border-brand-300",
};

export function Badge({ children, color = "gray" }: { children: ReactNode; color?: keyof typeof colorMap }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorMap[color]
      )}
    >
      {children}
    </span>
  );
}
