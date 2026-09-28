'use client';

import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string | null;
}

/**
 * Input sesuai ui.md bagian 4 & 8:
 * - bg-white/40 backdrop-blur-md border-[#EAEDFB] rounded-xl h-11
 * - Label di luar input (di atasnya)
 * - Focus ring solid #0033FF
 * - Error: outline merah translucent dengan lapisan kaca konsisten
 */
export function GlassInput({ label, error, hint, className, id, ...props }: GlassInputProps) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#00033D]">
          {label}
          {props.required && <span className="text-[#0033FF] ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl px-3.5 text-sm text-[#00033D] bg-white/40 backdrop-blur-md',
          'border border-[#EAEDFB] placeholder:text-[#00033D]/40',
          'transition-all duration-200 outline-none',
          'focus:border-[#0033FF] focus:ring-2 focus:ring-[#0033FF]/30 focus:bg-white/50',
          error
            ? 'border-red-400/50 bg-red-50/30'
            : '',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#00033D]/50">{hint}</p>
      ) : null}
    </div>
  );
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
}

export function GlassSelect({ label, error, className, id, children, ...props }: GlassSelectProps) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#00033D]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl px-3 text-sm text-[#00033D] bg-white/40 backdrop-blur-md',
          'border border-[#EAEDFB]',
          'transition-all duration-200 outline-none',
          'focus:border-[#0033FF] focus:ring-2 focus:ring-[#0033FF]/30 focus:bg-white/50',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}

export function GlassTextarea({ label, error, className, id, ...props }: GlassTextareaProps) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#00033D]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl px-3.5 py-2.5 text-sm text-[#00033D] bg-white/40 backdrop-blur-md',
          'border border-[#EAEDFB] placeholder:text-[#00033D]/40 min-h-20',
          'transition-all duration-200 outline-none',
          'focus:border-[#0033FF] focus:ring-2 focus:ring-[#0033FF]/30 focus:bg-white/50',
          error ? 'border-red-400/50 bg-red-50/30' : '',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
