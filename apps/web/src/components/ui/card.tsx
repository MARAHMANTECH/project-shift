// Card — Editorial Organicism: Tonal layering, No-Line Rule
// Dybde via surface tiers + ambient shadows, ikke borders

import { type HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "outlined" | "glass" | "surface" | "editorial";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "surface-lowest shadow-[var(--shadow-ambient)]",
  elevated: "surface-lowest shadow-[var(--shadow-elevated)]",
  outlined: "surface-low", // No-Line Rule: tonal shift erstatter ghost-border
  glass: "glass shadow-[var(--shadow-glass)]",
  surface: "surface-container", // No-Line Rule: tonal adskillelse
  editorial: "surface-low", // Magasin-layout sektioner
};

function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-3xl transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 pt-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardBody({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 pb-6 pt-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter, type CardProps };
