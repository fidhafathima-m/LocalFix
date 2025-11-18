import React from "react";
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "info" | "warning" | "error";
  className?: string;
}
export function Badge({
  children,
  variant = "info",
  className = "",
}: BadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
