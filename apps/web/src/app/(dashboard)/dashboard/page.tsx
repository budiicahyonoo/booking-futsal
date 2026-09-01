import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Pengguna</CardTitle>
            <span className="text-primary text-lg">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,245</div>
            <p className="text-xs text-foreground/50 mt-1">+12% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Sesi Aktif</CardTitle>
            <span className="text-secondary text-lg">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">342</div>
            <p className="text-xs text-foreground/50 mt-1">Saat ini online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Pendapatan</CardTitle>
            <span className="text-green-500 text-lg">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Rp 4.5M</div>
            <p className="text-xs text-foreground/50 mt-1">+8% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Sistem Error</CardTitle>
            <span className="text-red-500 text-lg">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-foreground/50 mt-1">Sistem berjalan normal</p>
          </CardContent>
        </Card>

      </div>

      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-md bg-muted/30">
            <p className="text-sm text-foreground/50">Komponen tabel data akan dirender di area ini.</p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}