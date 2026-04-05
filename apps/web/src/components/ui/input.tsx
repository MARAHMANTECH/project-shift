// Dedicated form input components — Editorial Organicism
// Brand Identity: Borderless, surface_container_high baggrund, Forest Green focus glow
// No-Line Rule: Ingen explicit borders, tonale skift definerer grænser

"use client";

import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

// ── Shared styles — No-Line Rule: ingen border, tonal baggrund ──
const baseInputClasses = `
  w-full rounded-2xl
  border-0
  bg-[var(--color-surface-high)] text-[var(--foreground)]
  text-sm font-medium
  placeholder:text-[var(--muted-foreground)]
  focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:bg-[var(--color-surface-lowest)]
  transition-all duration-300
  appearance-none
`.trim();

// ── Text Input ──
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, id, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`${baseInputClasses} h-12 px-4 ${icon ? "pl-11" : ""} ${error ? "ring-2 ring-error/30 bg-error/5" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ── Select ──
interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, icon, error, id, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={id}
            className={`${baseInputClasses} h-12 px-4 ${icon ? "pl-11" : ""} ${error ? "ring-2 ring-error/30 bg-error/5" : ""} cursor-pointer ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);
SelectInput.displayName = "SelectInput";

// ── Textarea ──
interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`${baseInputClasses} px-4 py-3.5 resize-none ${error ? "ring-2 ring-error/30 bg-error/5" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);
TextareaInput.displayName = "TextareaInput";

export { Input, SelectInput, TextareaInput };
export type { InputProps, SelectInputProps, TextareaInputProps };
