'use client';

import { cn } from '@/lib/utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Button sesuai ui.md bagian 4:
 * - Primary: solid #0033FF (tetap solid agar CTA tegas & terbaca di atas kaca)
 * - Secondary/Ghost: kaca bg-white/20 dengan border putih
 * - Focus ring solid #0033FF (accessibility, bukan translucent)
 */
export function GlassButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: GlassButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap',
        'transition-all duration-200 ease-out select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033FF] focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none',
        {
          primary:
            'bg-[#0033FF] text-white shadow-[0_4px_20px_rgba(0,51,255,0.35)] hover:shadow-[0_4px_28px_rgba(0,51,255,0.5)] hover:scale-[1.02]',
          secondary:
            'bg-white/20 backdrop-blur-md border border-white/30 text-[#00033D] hover:bg-white/30 hover:border-[#977DFF]/40',
          ghost: 'bg-transparent text-[#00033D] hover:bg-white/20',
          danger:
            'bg-red-500/10 backdrop-blur-md border border-red-300/40 text-red-600 hover:bg-red-500/20',
        }[variant],
        {
          sm: 'h-8 px-3 text-xs',
          md: 'h-11 px-5 text-sm',
          lg: 'h-12 px-7 text-base',
        }[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
