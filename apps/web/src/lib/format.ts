// Format & lokal Indonesia (PRD 8 Localization: Rupiah, tanggal, WIB)

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** YYYY-MM-DD -> "Jumat, 2 Oktober 2026" */
export function formatTanggalIndo(dateStr: string, withDay = true): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const hari = NAMA_HARI[date.getUTCDay()];
  const teks = `${d} ${NAMA_BULAN[m - 1]} ${y}`;
  return withDay ? `${hari}, ${teks}` : teks;
}

/** Date -> YYYY-MM-DD dalam WIB */
export function toDateStringWIB(date: Date = new Date()): string {
  const wib = new Date(date.getTime() + 7 * 3600_000);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, '0');
  const d = String(wib.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Tambah n hari ke string tanggal YYYY-MM-DD */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Label status booking berbahasa Indonesia */
export const STATUS_LABEL: Record<string, string> = {
  HOLD: 'Menunggu Pembayaran',
  PENDING_PAYMENT: 'Menunggu Konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
};

export const STATUS_COLOR: Record<string, string> = {
  HOLD: 'bg-amber-100/60 text-amber-800 border-amber-300/50',
  PENDING_PAYMENT: 'bg-sky-100/60 text-sky-800 border-sky-300/50',
  CONFIRMED: 'bg-emerald-100/60 text-emerald-800 border-emerald-300/50',
  CANCELLED: 'bg-gray-200/60 text-gray-700 border-gray-300/50',
  COMPLETED: 'bg-[#977DFF]/20 text-[#00033D] border-[#977DFF]/30',
  REJECTED: 'bg-red-100/60 text-red-800 border-red-300/50',
};
