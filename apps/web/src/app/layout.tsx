import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mampang Arena — Booking Lapangan Futsal",
  description:
    "Booking lapangan futsal GOR Mampang Arena, Mampang Prapatan Jakarta Selatan. Jadwal real-time, bayar DP atau lunas, konfirmasi cepat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={jakarta.className}>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            // Toast glass style (ui.md bagian 7)
            style: {
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              color: '#00033D',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0, 3, 61, 0.12)',
            },
            success: {
              iconTheme: { primary: '#0033FF', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
