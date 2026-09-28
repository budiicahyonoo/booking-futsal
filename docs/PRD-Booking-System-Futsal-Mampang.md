# Product Requirements Document (PRD)
# Booking System Lapangan Futsal — GOR Mampang Arena

| | |
|---|---|
| **Nama Produk** | (Working Title) — *MampangKick* / *GOR Mampang Arena Booking* *(ganti sesuai nama brand)* |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 2 September 2026 |
| **Fokus Bisnis** | Penyewaan Lapangan Futsal (Sport Venue Booking) |
| **Model Tenant** | Single-venue (1 tenant = 1 GOR/venue dengan beberapa lapangan di dalamnya) |
| **Lokasi Studi Kasus** | GOR Futsal di kawasan Mampang Prapatan, Jakarta Selatan |
| **Platform** | Web App (Booking Publik + Dashboard Admin/Owner) + Mobile-Web Responsive (tidak ada native app di V1) |
| **Status** | Draft untuk pengembangan |

---

## 1. Latar Belakang & Ringkasan Eksekutif

### 1.1 Latar Belakang
Kawasan Mampang Prapatan, Jakarta Selatan, merupakan area padat perkantoran dan pemukiman dengan demand tinggi untuk aktivitas olahraga futsal, terutama di jam pulang kerja (18.00–23.00) dan akhir pekan. Sebagian besar GOR futsal di kawasan ini masih mengelola booking secara manual melalui:

- **WhatsApp/telepon manual** — admin harus mengecek jadwal di buku/Excel, rawan double-booking saat banyak pesan masuk bersamaan.
- **Tidak ada visibilitas jadwal real-time** untuk calon penyewa — pelanggan harus tanya dulu "jam sekian kosong gak?" bolak-balik chat.
- **Pembayaran & DP tidak tercatat rapi** — sering terjadi sengketa soal siapa yang sudah bayar DP, siapa yang belum, terutama saat member reguler booking rutin mingguan.
- **Tidak ada data okupansi lapangan** — pemilik GOR tidak tahu jam/hari mana yang sepi untuk strategi promo, atau performa tiap lapangan (jika ada lebih dari 1 lapangan).

### 1.2 Solusi
Sebuah **platform booking lapangan futsal berbasis web** yang memungkinkan calon penyewa melihat ketersediaan slot secara real-time, melakukan booking & pembayaran DP/lunas secara online, serta memberikan admin/owner GOR sebuah dashboard terpusat untuk mengelola jadwal, konfirmasi pembayaran, dan laporan okupansi. Tersedia dalam bentuk:

- **Halaman Booking Publik** — dapat diakses siapa saja (guest) untuk melihat jadwal & booking tanpa perlu instal aplikasi.
- **Web Dashboard Admin/Owner** — digunakan staff GOR dan pemilik untuk mengelola lapangan, jadwal, konfirmasi pembayaran, member, dan laporan.

### 1.3 Model Bisnis
- Per-booking (bayar per sesi/jam sewa), dengan opsi **DP (down payment)** atau lunas di muka.
- Potensi tambahan: **paket membership** (mis. sewa rutin mingguan dengan harga khusus) — dicatat sebagai fitur inti V1 karena umum di GOR futsal Jakarta.
- Tidak ada model SaaS multi-tenant di V1 (1 sistem = 1 GOR/venue), namun arsitektur dirancang agar dapat diperluas ke multi-venue di fase berikutnya (lihat bagian 10).

---

## 2. Tujuan Produk (Goals & Objectives)

### 2.1 Business Goals
1. Meningkatkan tingkat okupansi lapangan (utilization rate) dengan mempermudah proses booking sehingga calon penyewa tidak "kabur" karena proses manual yang lambat.
2. Mengurangi kerugian akibat **double-booking** dan sengketa pembayaran yang merusak reputasi GOR.
3. Membangun basis pelanggan tetap (member) melalui data riwayat booking & program loyalitas sederhana.

### 2.2 Product Goals
1. Calon penyewa dapat melihat ketersediaan slot lapangan secara **real-time** tanpa perlu bertanya ke admin.
2. Sistem mencegah **double-booking** secara otomatis pada level database (locking slot saat proses booking berlangsung).
3. Admin dapat mengonfirmasi pembayaran (manual transfer/QRIS) dan mengelola jadwal dari satu dashboard terpusat.
4. Sistem mengirim **notifikasi otomatis** (WhatsApp/email) sebagai pengingat H-1 dan konfirmasi booking.
5. Owner mendapat insight okupansi lapangan per jam/hari untuk pengambilan keputusan harga (dynamic pricing sederhana, mis. harga jam ramai vs jam sepi).

### 2.3 Success Metrics (KPI)
| Metrik | Target |
|---|---|
| Waktu proses booking (dari pilih slot sampai konfirmasi) | < 3 menit |
| Tingkat double-booking / bentrok jadwal | 0% (hard constraint di sistem) |
| Okupansi lapangan (jam terisi / total jam operasional) | Meningkat ≥ 20% dalam 3 bulan pertama |
| Konversi kunjungan halaman booking → booking berhasil | ≥ 15% |
| Waktu konfirmasi pembayaran oleh admin | < 15 menit (jam operasional) pada 90% transaksi |
| Retensi member (booking ulang dalam 30 hari) | ≥ 40% |
| Uptime sistem | ≥ 99% |

---

## 3. Target Pengguna & Persona

### 3.1 Segmen Target
- Komunitas/grup futsal kantoran & pertemanan di sekitar Mampang, Kuningan, Kalibata, dan Jakarta Selatan pada umumnya.
- Tim/klub futsal reguler yang menyewa jadwal tetap mingguan.
- Event organizer kecil yang menyewa untuk turnamen/mabar (main bareng) skala kecil.

### 3.2 Persona

**Persona 1 — Rian (Kapten Tim/Pemesan Reguler)**
- Usia 25–35 tahun, karyawan kantoran, kapten tim futsal kantor.
- Booking rutin tiap Jumat malam sepulang kerja, kadang butuh reschedule mendadak.
- Ingin proses booking cepat via HP, tidak mau ribet chat admin bolak-balik.
- Mengakses via **HP (mobile browser)**.

**Persona 2 — Mbak Tari (Admin/Kasir GOR)**
- Usia 20–30 tahun, staff yang menjaga GOR di lokasi.
- Bertugas konfirmasi pembayaran, memastikan jadwal tidak bentrok, dan menangani check-in pelanggan yang datang.
- Butuh tampilan jadwal harian yang jelas (mirip kalender) di layar admin.
- Mengakses via **tablet/laptop di meja resepsionis GOR**.

**Persona 3 — Pak Herman (Pemilik GOR/Owner)**
- Usia 40–55 tahun, pemilik 2–3 lapangan futsal di satu lokasi.
- Ingin tahu okupansi tiap lapangan, jam ramai/sepi, dan total pendapatan tanpa harus di lokasi terus-menerus.
- Mengakses via **HP/laptop dari rumah atau saat bepergian**.

**Persona 4 — Guest/Calon Penyewa Baru**
- Belum tentu terdaftar sebagai member, hanya ingin cek jadwal kosong dan booking sekali.
- Mengharapkan proses tanpa harus daftar akun ribet (guest checkout dengan No. HP).

---

## 4. Peran Pengguna & Hak Akses (User Roles & Permissions)

Sistem menggunakan **Role-Based Access Control (RBAC)**. Berikut daftar role:

| Role | Level | Platform Akses | Deskripsi |
|---|---|---|---|
| **Owner** | Venue | Web Dashboard | Pemilik GOR. Akses penuh ke semua modul: lapangan, harga, laporan, pengaturan, user |
| **Admin/Kasir** | Venue | Web Dashboard | Staff operasional harian. Kelola jadwal, konfirmasi pembayaran, check-in pelanggan |
| **Member (Pelanggan Terdaftar)** | Publik (Auth) | Web Booking (Publik) | Pelanggan yang mendaftar akun. Dapat booking, lihat riwayat, dapat harga member (jika ada) |
| **Guest (Tamu)** | Publik (Non-Auth) | Web Booking (Publik) | Pengunjung tanpa akun. Dapat booking dengan input No. HP, tanpa riwayat tersimpan permanen |

### 4.1 Matriks Hak Akses (RBAC Detail)

| Modul / Fitur | Owner | Admin/Kasir | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Kelola data lapangan (tambah/edit/nonaktifkan) | ✅ | 🔶 (edit terbatas) | ❌ | ❌ |
| Kelola harga & jam operasional | ✅ | ❌ | ❌ | ❌ |
| Lihat kalender jadwal semua lapangan | ✅ | ✅ | 🔶 (lapangan sendiri saja) | 🔶 (hanya slot kosong) |
| Buat booking baru | ✅ | ✅ (atas nama pelanggan/walk-in) | ✅ | ✅ |
| Reschedule / batalkan booking | ✅ | ✅ | 🔶 (sesuai kebijakan H-X) | ❌ (via hubungi admin) |
| Konfirmasi pembayaran manual (transfer/QRIS) | ✅ | ✅ | ❌ | ❌ |
| Kelola member & harga khusus member | ✅ | 🔶 (lihat saja) | ❌ | ❌ |
| Lihat laporan pendapatan & okupansi | ✅ | 🔶 (harian saja) | ❌ | ❌ |
| Kelola user staff (tambah admin baru) | ✅ | ❌ | ❌ | ❌ |
| Kelola pengaturan notifikasi (WA/email) | ✅ | ❌ | ❌ | ❌ |
| Lihat riwayat booking pribadi | ✅ | ✅ | ✅ | ❌ |

Legenda: ✅ Full akses · 🔶 Akses terbatas/butuh syarat · ❌ Tidak ada akses

---

## 5. Ruang Lingkup (Scope)

### 5.1 In-Scope (MVP)
- Manajemen multi-lapangan dalam 1 venue (mis. Lapangan A, B, C dengan harga & karakteristik berbeda).
- Kalender ketersediaan real-time per lapangan, per slot jam (mis. slot 1 jam, dapat dikonfigurasi durasi minimum).
- Booking online oleh Guest (tanpa akun) maupun Member (dengan akun).
- Pencegahan **double-booking** otomatis (slot locking saat transaksi berlangsung).
- Sistem DP (down payment) dan pelunasan, dengan bukti transfer upload manual atau integrasi QRIS.
- Konfirmasi pembayaran manual oleh Admin (verifikasi bukti transfer) & otomatis untuk QRIS.
- Notifikasi WhatsApp/email: konfirmasi booking, pengingat H-1, notifikasi pembatalan.
- Manajemen member dengan harga khusus (member rate) dan riwayat booking.
- Booking berulang (recurring booking) untuk pelanggan reguler mingguan.
- Kebijakan pembatalan/reschedule dengan aturan waktu (mis. gratis reschedule jika H-1, DP hangus jika batal mendadak).
- Laporan okupansi lapangan (per jam, per hari, per lapangan) dan laporan pendapatan.
- Dashboard admin dengan tampilan kalender (day/week view) untuk manajemen jadwal & walk-in booking manual.
- Halaman booking publik yang mobile-friendly (mengingat mayoritas akses dari HP).

### 5.2 Out-of-Scope (Fase Berikutnya / Non-Goals di V1)
- Multi-venue dalam satu akun (akan menjadi Fase 2 — arsitektur data dirancang agar siap diperluas, lihat bagian 10).
- Native mobile app (Android/iOS) — V1 fokus web responsive.
- Marketplace/agregator lintas GOR (semacam "cari lapangan futsal se-Jakarta") — dicatat sebagai kandidat fase 2.
- Fitur cari lawan tanding/matchmaking komunitas.
- Program loyalitas poin tingkat lanjut (tier membership, redeem reward).
- Integrasi penjualan merchandise/kantin di dalam GOR.
- Live streaming/rekaman pertandingan.

---

## 6. Functional Requirements (Kebutuhan Fungsional)

### 6.1 Modul: Autentikasi & Manajemen User
| ID | Requirement |
|---|---|
| FR-AUTH-01 | Sistem mendukung registrasi akun Member (nama, No. HP, email opsional, password) |
| FR-AUTH-02 | Login menggunakan No. HP/email + password |
| FR-AUTH-03 | Sistem mendukung **guest booking** tanpa perlu registrasi, cukup input nama & No. HP aktif |
| FR-AUTH-04 | Owner dapat membuat akun Admin/Kasir dengan role tertentu |
| FR-AUTH-05 | Password reset via OTP WhatsApp/email |
| FR-AUTH-06 | Sesi login Member/Guest tidak wajib expire ketat (booking tetap dapat dicek via link unik yang dikirim ke No. HP) |

### 6.2 Modul: Master Data — Lapangan & Harga
| ID | Requirement |
|---|---|
| FR-COURT-01 | Owner dapat CRUD data lapangan: nama (mis. "Lapangan A"), jenis permukaan (vinyl/rumput sintetis/interlock), foto, kapasitas |
| FR-COURT-02 | Owner dapat mengatur jam operasional venue (mis. 08.00–24.00) dan durasi slot booking (mis. per 1 jam) |
| FR-COURT-03 | Owner dapat mengatur **harga per slot** yang berbeda berdasarkan lapangan, hari (weekday/weekend), dan jam (peak/off-peak) |
| FR-COURT-04 | Owner dapat menonaktifkan sementara lapangan tertentu (mis. sedang direnovasi) sehingga tidak muncul di jadwal booking publik |
| FR-COURT-05 | Owner dapat mengatur harga khusus member (member rate) berbeda dari harga umum |

### 6.3 Modul: Kalender & Ketersediaan (Scheduling Engine)
| ID | Requirement |
|---|---|
| FR-SCHED-01 | Sistem menampilkan kalender ketersediaan real-time per lapangan dalam tampilan grid jam x hari |
| FR-SCHED-02 | Slot yang sudah dibooking (baik lunas maupun DP) ditandai "Terisi" dan tidak dapat dipilih calon penyewa lain |
| FR-SCHED-03 | Sistem menerapkan **locking mechanism** pada slot saat pengguna sedang dalam proses checkout (mis. hold slot selama 10 menit) untuk mencegah 2 pengguna booking slot yang sama secara bersamaan |
| FR-SCHED-04 | Slot yang di-hold namun tidak diselesaikan pembayarannya dalam batas waktu, otomatis kembali berstatus "Kosong" |
| FR-SCHED-05 | Admin dapat melakukan **booking manual** langsung dari dashboard (mis. untuk pelanggan walk-in atau telepon) |
| FR-SCHED-06 | Sistem mendukung **booking berulang (recurring)**, mis. "setiap Jumat 20.00–21.00 selama 8 minggu", dengan validasi otomatis jika salah satu tanggal ternyata sudah terisi |

### 6.4 Modul: Booking & Pembayaran
| ID | Requirement |
|---|---|
| FR-BOOK-01 | Pengguna (Guest/Member) memilih lapangan, tanggal, dan slot jam yang tersedia, lalu melanjutkan ke checkout |
| FR-BOOK-02 | Pengguna dapat memilih pembayaran **DP (persentase/nominal tetap)** atau **lunas** |
| FR-BOOK-03 | Sistem mendukung pembayaran via transfer bank manual (upload bukti transfer) dan **QRIS** (integrasi payment gateway) |
| FR-BOOK-04 | Booking dengan metode transfer manual berstatus "Menunggu Konfirmasi" sampai Admin memverifikasi bukti transfer |
| FR-BOOK-05 | Booking dengan QRIS otomatis terkonfirmasi begitu pembayaran berhasil (via webhook payment gateway) |
| FR-BOOK-06 | Sistem mengirim link/kode booking unik yang dapat digunakan pengguna untuk melihat status booking tanpa perlu login |
| FR-BOOK-07 | Pengguna dapat mengajukan reschedule/pembatalan sesuai kebijakan waktu yang berlaku (lihat FR-POLICY-01) |
| FR-BOOK-08 | Riwayat booking (untuk Member) dapat dilihat di halaman akun: status, tanggal, lapangan, nominal dibayar |

### 6.5 Modul: Kebijakan Pembatalan & Reschedule
| ID | Requirement |
|---|---|
| FR-POLICY-01 | Owner dapat mengatur kebijakan pembatalan (mis. reschedule gratis jika ≥ H-1, DP hangus jika pembatalan < 12 jam sebelum jadwal) |
| FR-POLICY-02 | Sistem menghitung otomatis apakah pembatalan/reschedule yang diajukan pengguna memenuhi kebijakan waktu yang berlaku |
| FR-POLICY-03 | Admin dapat melakukan override manual (approve pembatalan di luar kebijakan) dengan alasan wajib dicatat (audit log) |

### 6.6 Modul: Manajemen Member
| ID | Requirement |
|---|---|
| FR-MEMBER-01 | Member dapat melihat & mengedit profil (nama, No. HP, email) |
| FR-MEMBER-02 | Owner/Admin dapat melihat daftar member beserta statistik booking (total booking, total spend, terakhir booking) |
| FR-MEMBER-03 | Owner dapat menandai member tertentu sebagai "member reguler" untuk mendapat harga khusus otomatis saat booking |

### 6.7 Modul: Notifikasi
| ID | Requirement |
|---|---|
| FR-NOTIF-01 | Sistem mengirim notifikasi WhatsApp/email konfirmasi setelah booking berhasil dibuat |
| FR-NOTIF-02 | Sistem mengirim pengingat otomatis H-1 sebelum jadwal booking |
| FR-NOTIF-03 | Sistem mengirim notifikasi ke Admin/Owner saat ada booking baru yang menunggu konfirmasi pembayaran manual |
| FR-NOTIF-04 | Sistem mengirim notifikasi pembatalan/reschedule ke pihak terkait (pengguna & admin) |

### 6.8 Modul: Laporan & Analitik (Reporting)
| ID | Requirement |
|---|---|
| FR-RPT-01 | Dashboard ringkasan harian: jumlah booking, pendapatan hari ini, okupansi tiap lapangan |
| FR-RPT-02 | Laporan okupansi per lapangan per rentang waktu (harian/mingguan/bulanan), ditampilkan dalam grafik heatmap jam x hari |
| FR-RPT-03 | Laporan pendapatan per periode, per lapangan, per metode pembayaran |
| FR-RPT-04 | Laporan daftar booking pending (menunggu konfirmasi pembayaran) yang perlu ditindaklanjuti Admin |
| FR-RPT-05 | Export laporan ke Excel/PDF |

### 6.9 Modul: Pengaturan (Settings)
| ID | Requirement |
|---|---|
| FR-SET-01 | Pengaturan profil venue: nama GOR, alamat, logo, No. HP/WA kontak |
| FR-SET-02 | Pengaturan rekening bank/akun QRIS untuk penerimaan pembayaran |
| FR-SET-03 | Pengaturan durasi hold slot saat checkout (default 10 menit) |
| FR-SET-04 | Pengaturan template pesan notifikasi WhatsApp/email |
| FR-SET-05 | Pengaturan kebijakan DP (persentase/nominal default) dan kebijakan pembatalan |

---

## 7. User Flows Utama

### 7.1 Flow: Booking Online oleh Guest
1. Pengunjung membuka halaman booking publik, memilih tanggal.
2. Sistem menampilkan kalender ketersediaan semua lapangan pada tanggal tsb (grid jam x lapangan).
3. Pengunjung memilih slot kosong pada lapangan yang diinginkan → slot otomatis di-hold selama 10 menit.
4. Pengunjung mengisi data: nama, No. HP, memilih metode pembayaran (DP/lunas) dan metode (transfer/QRIS).
5. Jika transfer manual: pengunjung upload bukti transfer → status booking "Menunggu Konfirmasi".
6. Jika QRIS: pengunjung menyelesaikan pembayaran → sistem menerima webhook → status otomatis "Terkonfirmasi".
7. Sistem mengirim WhatsApp/email berisi detail booking & link cek status.
8. Admin menerima notifikasi booking baru (khusus transfer manual) → memverifikasi bukti transfer → mengubah status jadi "Terkonfirmasi" atau "Ditolak" (dengan alasan).

### 7.2 Flow: Booking Berulang (Recurring) oleh Member Reguler
1. Member login → memilih menu "Booking Rutin".
2. Member memilih lapangan, hari (mis. tiap Jumat), jam, dan jumlah minggu (mis. 8 minggu).
3. Sistem mengecek ketersediaan tiap tanggal yang dihasilkan; jika ada tanggal yang bentrok, sistem menampilkan daftar tanggal bermasalah dan meminta konfirmasi (skip tanggal tsb atau batalkan seluruh permintaan).
4. Member melanjutkan ke pembayaran (DP per sesi atau DP borongan semua sesi).
5. Setelah konfirmasi pembayaran, sistem membuat seluruh entri booking untuk tanggal-tanggal yang valid sekaligus.
6. Sistem mengirim pengingat H-1 otomatis untuk setiap sesi dalam rangkaian recurring booking tsb.

### 7.3 Flow: Reschedule Booking
1. Pengguna membuka link status booking (dari WhatsApp) atau login sebagai Member → memilih booking yang ingin diubah.
2. Pengguna klik "Reschedule" → sistem mengecek kebijakan waktu (FR-POLICY-02): apakah masih dalam batas waktu yang diizinkan.
3. Jika memenuhi syarat: pengguna memilih slot baru dari kalender ketersediaan → sistem memindahkan booking, slot lama dilepas kembali menjadi "Kosong".
4. Jika tidak memenuhi syarat: sistem menampilkan opsi "Hubungi Admin" untuk pengajuan manual (override oleh Admin/Owner).
5. Notifikasi perubahan jadwal dikirim ke pengguna.

### 7.4 Flow: Konfirmasi Pembayaran Manual oleh Admin
1. Admin login ke dashboard → membuka menu "Booking Pending".
2. Admin memilih booking dengan status "Menunggu Konfirmasi" → melihat detail & bukti transfer yang diupload.
3. Admin memverifikasi nominal & bukti transfer sesuai dengan rekening venue.
4. Admin klik "Konfirmasi" (status booking jadi "Terkonfirmasi", slot terkunci permanen) atau "Tolak" (wajib isi alasan, slot dilepas kembali menjadi "Kosong").
5. Sistem otomatis mengirim notifikasi hasil konfirmasi ke pengguna.

---

## 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Requirement |
|---|---|
| **Performance** | Waktu respon API < 500ms untuk 95% request; kalender ketersediaan harus termuat < 2 detik |
| **Concurrency** | Sistem harus menangani percobaan booking bersamaan pada slot yang sama tanpa terjadi double-booking (locking level database/transaksi atomik) |
| **Scalability** | Arsitektur dirancang agar dapat diperluas ke multi-venue tanpa migrasi skema besar (lihat bagian 10) |
| **Security** | Password di-hash (bcrypt); komunikasi API via HTTPS/TLS; validasi RBAC di setiap endpoint; bukti transfer disimpan aman (tidak dapat diakses publik langsung) |
| **Availability** | Target uptime ≥ 99%; sistem tetap dapat menampilkan jadwal (read-only) meski terjadi gangguan pada layanan pembayaran |
| **Compatibility** | Halaman booking publik harus optimal di mobile browser (Chrome/Safari Android & iOS) mengingat mayoritas akses pelanggan dari HP |
| **Usability** | Proses booking oleh Guest baru harus dapat diselesaikan tanpa training, maksimal 5 langkah dari pilih slot sampai konfirmasi |
| **Auditability** | Aksi sensitif (override kebijakan pembatalan, konfirmasi/tolak pembayaran manual, ubah harga) tercatat dalam audit log dengan user & timestamp |
| **Localization** | Bahasa Indonesia sebagai default, format mata uang Rupiah, format tanggal & zona waktu WIB |

---

## 9. Model Data / Entitas Utama (High-Level Data Model)

> Catatan: Ini adalah gambaran entitas tingkat tinggi untuk memandu perancangan database (ERD detail dibuat saat fase technical design).

**Entitas Inti:**
- `Venue` — id, nama_gor, alamat, logo, kontak_wa, jam_operasional_buka, jam_operasional_tutup
- `Court` (Lapangan) — id, venue_id, nama, jenis_permukaan, foto, status_aktif
- `PricingRule` (Aturan Harga) — id, court_id, hari_tipe (weekday/weekend), jam_mulai, jam_selesai, harga, harga_member
- `User` — id, venue_id (nullable untuk Member/Guest), nama, no_hp, email, password_hash, role
- `Member` — id, user_id, tipe_member (reguler/biasa), total_booking, total_spend
- `Booking` — id, court_id, user_id (nullable jika guest), nama_pemesan, no_hp_pemesan, tanggal, jam_mulai, jam_selesai, status (hold/pending/confirmed/cancelled/completed), tipe_pembayaran (dp/lunas), recurring_group_id (nullable)
- `RecurringGroup` — id, court_id, hari, jam_mulai, jam_selesai, tanggal_mulai, jumlah_minggu, status
- `Payment` — id, booking_id, metode (transfer/qris), nominal, bukti_transfer_url, status (menunggu/terkonfirmasi/ditolak), verified_by, verified_at
- `CancellationPolicy` — id, venue_id, batas_waktu_gratis_jam, persentase_dp_hangus
- `SlotHold` — id, court_id, tanggal, jam_mulai, jam_selesai, expired_at, session_id (untuk mencegah double booking saat checkout berlangsung)
- `Notification` — id, booking_id, tipe (konfirmasi/pengingat/pembatalan), channel (wa/email), status_kirim, sent_at
- `AuditLog` — id, venue_id, user_id, aksi, detail, timestamp

**Relasi Kunci:**
- 1 `Venue` → banyak `Court`, `User` (Admin/Owner).
- 1 `Court` → banyak `PricingRule`, `Booking`.
- 1 `Booking` → 1 `Payment` (dapat lebih dari 1 jika ada pembayaran DP lalu pelunasan terpisah).
- 1 `RecurringGroup` → banyak `Booking` (tiap sesi mingguan adalah 1 baris `Booking` yang saling terhubung via `recurring_group_id`).
- `SlotHold` bersifat sementara (TTL/expired_at) dan dihapus otomatis setelah slot dikonfirmasi jadi `Booking` atau hold kedaluwarsa.

---

## 10. Pertimbangan Teknis (Technical Considerations)

> Bagian ini bersifat rekomendasi awal untuk memudahkan tahap development, bukan keputusan final arsitektur.

- **Arsitektur:** Single-venue di V1, namun skema data menyertakan `venue_id` di tabel-tabel kunci (`Court`, `User`, `Booking` via `Court`) agar mudah diperluas menjadi multi-venue (SaaS) di fase berikutnya tanpa migrasi besar.
- **Backend:** REST API dengan autentikasi JWT, middleware RBAC per endpoint (Owner/Admin/Member).
- **Database:** PostgreSQL — cocok untuk data booking yang butuh konsistensi transaksi (ACID), terutama untuk mencegah double-booking (gunakan *row-level locking* atau *unique constraint* pada kombinasi `court_id + tanggal + jam_mulai` yang berstatus aktif).
- **Concurrency Handling:** Implementasi `SlotHold` dengan TTL pendek (mis. 10 menit) menggunakan mekanisme expiry (cron job/scheduled task atau TTL di level cache seperti Redis) untuk melepas slot yang tidak jadi dibayar.
- **Web Frontend:** Next.js App Router (sesuai stack CayLabs), dengan real-time update ketersediaan slot menggunakan polling interval singkat atau WebSocket untuk pengalaman "kalender hidup" saat banyak pengguna mengecek jadwal bersamaan.
- **Payment Gateway:** Integrasi QRIS via provider lokal (mis. Midtrans/Xendit) untuk pembayaran otomatis; upload bukti transfer manual disimpan di object storage (mis. S3-compatible) dengan akses terbatas.
- **Notifikasi:** Integrasi WhatsApp Business API (atau provider pihak ketiga seperti Fonnte/Wablas yang umum dipakai UMKM Indonesia) untuk pengingat & konfirmasi; email sebagai fallback/opsional.
- **Hosting/Infra:** Cloud (Vercel untuk frontend Next.js, VPS/Docker untuk backend NestJS sesuai standar CayLabs Core Engine), dengan backup database harian.
- **Kesiapan Multi-Venue (masa depan):** Struktur data sudah venue-aware sejak awal; migrasi ke multi-tenant SaaS (banyak GOR berlangganan) hanya perlu penambahan lapisan tenant isolation & billing, tanpa perlu redesain skema booking inti.

---

## 11. Roadmap / Rencana Rilis

| Fase | Fitur Utama | Estimasi |
|---|---|---|
| **Fase 0 — Setup & Onboarding** | Setup project dari CayLabs Core Engine, auth, manajemen user/role, data lapangan & harga dasar | 1-2 minggu |
| **Fase 1 — MVP Inti** | Kalender ketersediaan, booking online (guest & member), slot locking anti double-booking, pembayaran manual transfer | 4-5 minggu |
| **Fase 2 — Pembayaran & Notifikasi** | Integrasi QRIS, notifikasi WhatsApp/email (konfirmasi & pengingat H-1) | 2-3 minggu |
| **Fase 3 — Fitur Lanjutan** | Booking berulang (recurring), kebijakan pembatalan/reschedule otomatis, manajemen member & harga khusus | 3-4 minggu |
| **Fase 4 — Laporan & Optimalisasi** | Dashboard laporan okupansi & pendapatan, export laporan, heatmap jam ramai/sepi | 2-3 minggu |
| **Fase 5 — Skalabilitas (Post-MVP)** | Multi-venue (SaaS), native mobile app, program loyalitas, marketplace lintas GOR | TBD |

---

## 12. Risiko & Asumsi

### 12.1 Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Dua pengguna mencoba booking slot yang sama secara bersamaan | Double-booking, kekecewaan pelanggan | Slot locking dengan TTL + unique constraint di level database sebagai lapisan kedua |
| Pelanggan upload bukti transfer palsu/salah nominal | Kerugian finansial venue | Verifikasi manual wajib oleh Admin sebelum status "Terkonfirmasi"; nominal di sistem harus cocok dengan yang diklaim |
| Pelanggan tidak melanjutkan pembayaran setelah hold slot | Slot "tersandera" tidak bisa dibooking pihak lain | TTL hold otomatis (mis. 10 menit) melepas slot kembali jika tidak ada pembayaran |
| Ketergantungan pada provider WhatsApp API pihak ketiga | Notifikasi gagal terkirim | Fallback ke email/SMS; monitoring status pengiriman notifikasi |
| Owner mengubah harga di tengah proses booking pelanggan | Ketidaksesuaian harga saat checkout | Harga di-lock pada saat slot di-hold, bukan mengambil harga real-time saat pembayaran final |

### 12.2 Asumsi
- Venue (GOR) memiliki jumlah lapangan terbatas (1–5 lapangan) sehingga tidak memerlukan sharding data di V1.
- Mayoritas pelanggan mengakses via mobile browser, bukan aplikasi native.
- Admin/Kasir selalu standby di jam operasional untuk memverifikasi pembayaran manual dalam waktu wajar.
- Koneksi internet di lokasi GOR cukup stabil untuk operasional dashboard admin (tidak memerlukan mode offline seperti sistem POS).

---

## 13. Glosarium

| Istilah | Definisi |
|---|---|
| **Slot** | Satuan waktu booking pada satu lapangan, mis. jam 19.00–20.00 |
| **Slot Hold** | Status sementara saat slot sedang "ditahan" oleh calon penyewa yang sedang proses checkout, sebelum pembayaran final |
| **DP (Down Payment)** | Uang muka sebagai tanda jadi booking, sisanya dibayar saat datang ke lokasi |
| **Recurring Booking** | Booking berulang pada hari & jam yang sama untuk beberapa minggu ke depan |
| **Okupansi** | Persentase jam terisi dibanding total jam operasional yang tersedia |
| **QRIS** | Quick Response Code Indonesian Standard — standar QR pembayaran nasional |
| **Walk-in** | Pelanggan yang datang langsung ke lokasi tanpa booking online sebelumnya, dicatat manual oleh Admin |
| **Peak/Off-Peak Hour** | Jam ramai (biasanya malam hari & akhir pekan) vs jam sepi, yang dapat memiliki harga berbeda |

---

## 14. Lampiran — Prioritas Fitur untuk MVP (Ringkasan Cepat)

**Must Have (P0):**
- Auth & role (Owner, Admin, Member, Guest booking)
- CRUD lapangan & aturan harga
- Kalender ketersediaan real-time + slot locking anti double-booking
- Booking online (guest & member) dengan DP/lunas via transfer manual
- Konfirmasi pembayaran manual oleh Admin
- Notifikasi WhatsApp/email konfirmasi booking

**Should Have (P1):**
- Integrasi QRIS (pembayaran otomatis)
- Pengingat H-1 otomatis
- Reschedule/pembatalan dengan kebijakan waktu
- Booking manual oleh Admin (walk-in)

**Nice to Have (P2):**
- Booking berulang (recurring)
- Manajemen member & harga khusus
- Laporan okupansi & pendapatan dengan grafik/heatmap
- Export laporan

**Future (P3 - Fase 2+):**
- Multi-venue (SaaS)
- Native mobile app
- Program loyalitas
- Marketplace/agregator lintas GOR

---

*Dokumen ini adalah living document — dapat diperbarui seiring hasil diskusi teknis dan feedback pengguna selama proses development.*
