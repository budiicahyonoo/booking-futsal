import React from 'react';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Navbar Responsif */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                C
              </div>
              <span className="font-bold text-lg text-foreground tracking-wide">CayLabs</span>
            </div>

            {/* Navigasi Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/home" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Pricing</a>
            </nav>

            {/* Tombol Aksi Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <a href="/auth/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Log In</a>
              <a href="/choice" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">Get Started</a>
            </div>

            {/* Hamburger Menu (Mobile) */}
            <button className="md:hidden p-2 text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Area Konten Utama */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer Gelap */}
      <footer className="bg-sidebar text-sidebar-foreground py-12 border-t border-sidebar-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">C</div>
              <span className="font-bold text-lg">CayLabs</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70 max-w-sm mx-auto md:mx-0">
              Standardized UI foundation untuk seluruh project masa depan. Dibangun dengan standar Maincore.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Produk</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">Template Dashboard</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Template Website</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}