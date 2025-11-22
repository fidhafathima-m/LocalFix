import React from "react";
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "primary" | "secondary" | "error" | "warning";
}
export function Badge({ children, variant = "secondary" }: BadgeProps) {
  const variantClasses = {
    success: "bg-green-50 text-green-700 border-green-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-purple-50 text-purple-700 border-purple-200",
    error: "bg-gray-50 text-gray-600 border-gray-200",
    warning: "bg-yello-50 text-yellow-600 border-yellow-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
