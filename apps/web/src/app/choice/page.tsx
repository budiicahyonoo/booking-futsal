export default function ChoicePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-lg bg-[#0033FF] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-[0_0_15px_rgba(0,51,255,0.3)]">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-[#00033D] mb-2">Maincore Engine</h1>
          <p className="text-[#00033D]/60 text-sm">Pilih fondasi arsitektur UI untuk proyek Anda saat ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Dashboard Template */}
          <div className="bg-[#FFFFFF] border border-[#EAEDFB] rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#977DFF] to-[#0033FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-bold text-[#00033D] mb-2">Dashboard Template</h2>
            <p className="text-[#00033D]/70 text-sm mb-6 flex-1">
              Sistem tertutup dengan Sidebar & Header. Ideal untuk Admin Dashboard, LMS, HRIS, ERP, dan Internal Management System.
            </p>
            <ul className="text-xs text-[#00033D]/60 space-y-2 mb-8">
              <li className="flex items-center gap-2"><span>✔️</span> Standardized Table & Form</li>
              <li className="flex items-center gap-2"><span>✔️</span> Configurable Sidebar</li>
              <li className="flex items-center gap-2"><span>✔️</span> Popup, Modal & Toast Ready</li>
            </ul>
            <a href="/dashboard" className="w-full text-center px-4 py-2.5 bg-[#EAEDFB] text-[#0033FF] rounded-md text-sm font-semibold hover:bg-[#0033FF] hover:text-white transition-colors">
              Gunakan Dashboard
            </a>
          </div>

          {/* Card 2: Website Template */}
          <div className="bg-[#FFFFFF] border border-[#EAEDFB] rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#977DFF] to-[#0033FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-bold text-[#00033D] mb-2">Website Template</h2>
            <p className="text-[#00033D]/70 text-sm mb-6 flex-1">
              Sistem publik dengan Navbar responsif & Footer. Ideal untuk Company Profile, Landing Page, dan Marketing Website.
            </p>
            <ul className="text-xs text-[#00033D]/60 space-y-2 mb-8">
              <li className="flex items-center gap-2"><span>✔️</span> Responsive Hamburger Menu</li>
              <li className="flex items-center gap-2"><span>✔️</span> Main Content & Footer Area</li>
              <li className="flex items-center gap-2"><span>✔️</span> Public & SEO Optimized</li>
            </ul>
            <a href="/home" className="w-full text-center px-4 py-2.5 bg-[#EAEDFB] text-[#0033FF] rounded-md text-sm font-semibold hover:bg-[#0033FF] hover:text-white transition-colors">
              Gunakan Website
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}