"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white
        hover:shadow-lg hover:shadow-[#667eea]/30 hover:-translate-y-0.5
        focus:ring-[#667eea]/50
      `,
      secondary: `
        glass-card text-[var(--foreground)]
        hover:bg-[var(--surface-hover)] hover:-translate-y-0.5
        focus:ring-[var(--border)]
      `,
      ghost: `
        text-[var(--foreground)] opacity-70
        hover:opacity-100 hover:bg-[var(--surface)]
        focus:ring-[var(--border)]
      `,
      danger: `
        bg-red-500/10 text-red-400 border border-red-500/20
        hover:bg-red-500/20
        focus:ring-red-500/50
      `,
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5 rounded-lg",
      md: "text-sm px-4 py-2 rounded-xl",
      lg: "text-base px-6 py-3 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
