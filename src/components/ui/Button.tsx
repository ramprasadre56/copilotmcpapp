"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      rounded-lg transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-blue-600 text-white hover:bg-blue-700
        focus:ring-blue-500 dark:focus:ring-offset-slate-900
      `,
      secondary: `
        bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white
        hover:bg-slate-200 dark:hover:bg-slate-600
        focus:ring-slate-500 dark:focus:ring-offset-slate-900
      `,
      danger: `
        bg-red-600 text-white hover:bg-red-700
        focus:ring-red-500 dark:focus:ring-offset-slate-900
      `,
      ghost: `
        bg-transparent text-slate-600 dark:text-slate-400
        hover:bg-slate-100 dark:hover:bg-slate-800
        hover:text-slate-900 dark:hover:text-white
        focus:ring-slate-500 dark:focus:ring-offset-slate-900
      `,
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
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
