import { cn } from '@/lib/utils';

/**
 * Base glass component (ui.md bagian 4 & 9).
 * Semua card wajib memakai formula ini agar efek kaca konsisten,
 * tidak di-hardcode berulang di tiap halaman.
 */
export function GlassCard({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl',
        'shadow-[0_8px_32px_rgba(0,3,61,0.12)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Panel gelap utk sidebar/overlay sesuai formula dark glass ui.md */
export function GlassDarkPanel({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-[#030812]/60 backdrop-blur-2xl border border-white/10',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Panel highlight utk state aktif/penting */
export function GlassAccentPanel({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-[#977DFF]/15 backdrop-blur-xl border border-[#977DFF]/30 rounded-2xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
