import Link from 'next/link';
import { WebsiteNavbar } from '@/components/website/WebsiteNavbar';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <WebsiteNavbar />
      <main className="flex-1">{children}</main>

      {/* Footer gelap */}
      <footer className="bg-[#030812] text-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#0033FF] flex items-center justify-center text-white font-bold text-xs">
                  MA
                </div>
                <span className="font-bold">Mampang Arena</span>
              </div>
              <p className="text-sm text-white/60 max-w-sm">
                GOR futsal di kawasan Mampang Prapatan, Jakarta Selatan. Booking
                online, jadwal real-time, tanpa ribet.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Navigasi</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/booking" className="hover:text-white transition-colors">
                    Booking Lapangan
                  </Link>
                </li>
                <li>
                  <Link href="/booking/status" className="hover:text-white transition-colors">
                    Cek Status Booking
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Masuk / Daftar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Kontak</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>📍 Mampang Prapatan, Jakarta Selatan</li>
                <li>📱 WhatsApp: 0812-3456-7890</li>
                <li>⏰ 08:00 – 24:00 WIB</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
            © 2026 Mampang Arena. Dibangun dengan CayLabs Core Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
