// Helper waktu: venue beroperasi di WIB (UTC+7) sesuai PRD 8 Localization.
// Jam disimpan sebagai angka desimal (mis. 19.5 => 19:30) & tanggal sebagai midnight WIB.

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Membuat Date dari tanggal (YYYY-MM-DD) & jam desimal dalam konteks WIB */
export function wibDate(dateStr: string, hour = 0): Date {
  return new Date(new Date(`${dateStr}T00:00:00+07:00`).getTime() + hour * 3600_000);
}

/** Mengambil bagian tanggal (midnight WIB) dari sebuah Date */
export function wibDayStart(date: Date): Date {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}T00:00:00+07:00`);
}

/** Format tanggal ke YYYY-MM-DD di zona WIB */
export function toWibDateString(date: Date): string {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Mendapat day-of-week WIB: 0=Minggu .. 6=Sabtu */
export function wibDayOfWeek(date: Date): number {
  return new Date(date.getTime() + WIB_OFFSET_MS).getUTCDay();
}

/** Weekend = Sabtu/Minggu menurut WIB */
export function isWeekend(date: Date): boolean {
  const dow = wibDayOfWeek(date);
  return dow === 0 || dow === 6;
}

/** Waktu sekarang dikurangi offset = jam WIB dalam desimal (mis. 19.5) */
export function nowWibHourFraction(date = new Date()): number {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  return shifted.getUTCHours() + shifted.getUTCMinutes() / 60;
}

/** Format jam desimal ke "HH:MM" */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Nama hari dalam Bahasa Indonesia */
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const NAMA_BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
