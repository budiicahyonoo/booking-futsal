export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-muted/30 py-24 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full tracking-wide mb-6 inline-block">
            V1.0 MAINCORE ENGINE
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6">
            Bangun Aplikasi Lebih Cepat dengan <span className="text-primary">Standar Pasti</span>.
          </h1>
          <p className="text-lg text-foreground/70 mb-10 max-w-2xl mx-auto">
            Website template ini menggunakan struktur warna CayLabs yang solid. Dilengkapi dengan navigasi responsif, area konten utama, dan footer yang konsisten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Mulai Sekarang
            </button>
            <button className="w-full sm:w-auto px-8 py-3 bg-background border border-border text-foreground rounded-md font-medium shadow-sm hover:bg-muted transition-all">
              Lihat Dokumentasi
            </button>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fitur Template Website</h2>
            <p className="text-foreground/70 max-w-xl mx-auto">Komponen bawaan yang siap digunakan untuk berbagai kebutuhan halaman publik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Responsive Navbar", desc: "Berubah otomatis menjadi hamburger menu di perangkat mobile.", icon: "📱" },
              { title: "Consistent Colors", desc: "Mengikuti palet 6 warna utama tanpa perlu konfigurasi ulang.", icon: "🎨" },
              { title: "Dark Footer", desc: "Menggunakan warna Sidebar (#030812) untuk memberikan kontras pada bagian bawah.", icon: "⬛" },
            ].map((feature, i) => (
              <div key={i} className="p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}