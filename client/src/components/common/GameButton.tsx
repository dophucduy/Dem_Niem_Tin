import React from "react";
import { Loader2 } from "lucide-react";

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "justice" | "righteous" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles = 
    "inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4 py-2.5 text-sm gap-2 min-h-[44px]",
    lg: "px-6 py-3.5 text-base gap-2.5 min-h-[52px]",
    xl: "px-8 py-4 text-lg gap-3 min-h-[60px] uppercase tracking-wider",
  }[size];

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-trust-500 to-trust-600 hover:from-trust-400 hover:to-trust-500 text-night-950 shadow-glow font-extrabold border border-trust-300/40",
    danger:
      "bg-gradient-to-r from-corruption-600 to-corruption-700 hover:from-corruption-500 hover:to-corruption-600 text-white shadow-glow-danger border border-corruption-400/40",
    justice:
      "bg-gradient-to-r from-justice-600 to-justice-700 hover:from-justice-500 hover:to-justice-600 text-white shadow-glow-justice border border-justice-400/40",
    righteous:
      "bg-gradient-to-r from-righteous-600 to-righteous-700 hover:from-righteous-500 hover:to-righteous-600 text-white shadow-glow-righteous border border-righteous-400/40",
    outline:
      "bg-night-900/60 hover:bg-night-800 text-slate-200 border border-slate-700 hover:border-slate-500",
    ghost:
      "bg-transparent hover:bg-night-800/60 text-slate-300 hover:text-white",
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles}
        ${variantStyles}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

