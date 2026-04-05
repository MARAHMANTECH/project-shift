// Button — Editorial Organicism: Forest Gradient, pill-shapes
// Brand Identity: Rounded, organic, premium

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "cta" | "ghost" | "forest";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md",
  forest:
    "gradient-forest text-white hover:opacity-95 active:opacity-90 shadow-md hover:shadow-lg",
  secondary:
    "surface-high text-[var(--foreground)] hover:bg-[var(--color-surface-highest)] active:bg-[var(--color-surface-dim)]",
  cta: "gradient-cta text-white hover:opacity-95 active:opacity-90 shadow-md hover:shadow-lg",
  ghost:
    "bg-transparent text-[var(--foreground)] hover:surface-container",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 min-h-[44px] px-4 text-xs gap-1.5",
  md: "h-11 min-h-[44px] px-5 text-sm gap-2",
  lg: "h-12 min-h-[44px] px-7 text-base gap-2.5",
};

function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        transition-all duration-200 ease-out
        touch-target
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Vent venligst...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, type ButtonProps };
