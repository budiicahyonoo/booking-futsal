import Link from 'next/link';
import { GlassCard, GlassButton } from '@/components/glass';
import { formatRupiah, formatHour } from '@/lib/format';
import type { Court, Venue } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getHomeData(): Promise<{ venue: Venue | null; courts: Court[] }> {
  try {
    const [resVenue, resCourts] = await Promise.all([
      fetch(`${API}/venues`, { cache: 'no-store' }),
      fetch(`${API}/courts`, { cache: 'no-store' }),
    ]);
    const venue: Venue = await resVenue.json();
    const courts: Court[] = await resCourts.json();
    return { venue, courts };
  } catch {
    return { venue: null, courts: [] };
  }
}

export default async function HomePage() {
  const { venue, courts } = await getHomeData();

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <span className="px-4 py-1.5 bg-[#977DFF]/20 backdrop-blur-sm border border-[#977DFF]/30 text-[#00033D] text-xs font-semibold rounded-full tracking-wide mb-6 inline-block">
            📍 MAMPANG PRAPATAN, JAKARTA SELATAN
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#00033D] tracking-tight mb-6 leading-tight">
            Booking Lapangan Futsal <span className="text-[#0033FF]">Tanpa Ribet</span>
          </h1>
          <p className="text-lg text-[#00033D]/70 mb-10 max-w-2xl mx-auto">
            Lihat jadwal kosong real-time, pilih slot, bayar DP atau lunas — semua
            dari HP kamu. {venue?.name || 'GOR Mampang Arena'} siap menghadirkan
            permainan terbaikmu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking">
              <GlassButton size="lg">Lihat Jadwal &amp; Booking</GlassButton>
            </Link>
            <Link href="/booking/status">
              <GlassButton variant="secondary" size="lg">
                Cek Status Booking
              </GlassButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Info venue & lapangan */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-2">🏟️</div>
              <h3 className="font-bold text-[#00033D] mb-1">{venue?.name || 'GOR Mampang Arena'}</h3>
              <p className="text-sm text-[#00033D]/60">
                {venue?.address || 'Jl. Mampang Prapatan Raya No. 88, Jakarta Selatan'}
              </p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-bold text-[#00033D] mb-1">Jam Operasional</h3>
              <p className="text-sm text-[#00033D]/60">
                {formatHour(venue?.openHour ?? 8)} – {formatHour(venue?.closeHour ?? 24)} WIB
              </p>
              <p className="text-xs text-[#00033D]/40 mt-1">Setiap hari</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-2">⚽</div>
              <h3 className="font-bold text-[#00033D] mb-1">{courts.length || 3} Lapangan</h3>
              <p className="text-sm text-[#00033D]/60">Vinyl, rumput sintetis &amp; interlock</p>
            </GlassCard>
          </div>

          <h2 className="text-2xl font-bold text-[#00033D] text-center mb-8">Lapangan Kami</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courts.map((court) => {
              const peak = court.pricingRules?.find((r) => r.dayType === 'WEEKDAY' && r.startHour >= 17);
              const off = court.pricingRules?.find((r) => r.dayType === 'WEEKDAY' && r.startHour < 17);
              return (
                <GlassCard
                  key={court.id}
                  className="p-6 hover:bg-white/40 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="h-28 rounded-xl bg-gradient-to-br from-[#977DFF]/30 to-[#0033FF]/20 border border-white/30 flex items-center justify-center text-4xl mb-4">
                    ⚽
                  </div>
                  <h3 className="font-bold text-[#00033D] text-lg">{court.name}</h3>
                  <p className="text-sm text-[#00033D]/60 capitalize mb-3">{court.surfaceType}</p>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-[#00033D]/60">Off-peak</span>
                    <span className="font-semibold text-[#00033D]">
                      {formatRupiah(off?.price ?? 0)}/jam
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#00033D]/60">Peak malam</span>
                    <span className="font-semibold text-[#0033FF]">
                      {formatRupiah(peak?.price ?? 0)}/jam
                    </span>
                  </div>
                  <Link href="/booking" className="block mt-4">
                    <GlassButton variant="secondary" className="w-full">
                      Booking Sekarang
                    </GlassButton>
                  </Link>
                  <p className="text-[10px] text-[#00033D]/40 mt-2 text-center">
                    Member reguler dapat harga khusus
                  </p>
                </GlassCard>
              );
            })}
          </div>

          {courts.length === 0 && (
            <GlassCard className="p-10 text-center text-[#00033D]/60">
              Data lapangan belum tersedia. Pastikan backend &amp; database sudah berjalan.
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}
