'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

/** Badge/Pill sesuai ui.md bagian 4: rounded-full accent glass */
export function GlassBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium',
        'bg-[#977DFF]/20 backdrop-blur-sm border border-[#977DFF]/30 text-[#00033D]',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Modal sesuai ui.md bagian 4 & 7: kaca terang, overlay gelap, animasi spring 300ms */
export function GlassModal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'bg-white/50 backdrop-blur-2xl border border-white/30 rounded-2xl w-full',
          'shadow-[0_8px_32px_rgba(0,3,61,0.25)]',
          'animate-in zoom-in-95 fade-in duration-300',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
            <h3 className="font-semibold text-[#00033D]">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#00033D]/60 hover:bg-white/30 hover:text-[#00033D] transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
