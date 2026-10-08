# Rancangan Proyek: Aplikasi Keuangan Pribadi

**Nama sementara:** DompetKu  
**Platform utama:** iPhone  
**Tujuan:** Mengatur uang mingguan, mencatat pengeluaran, dan meningkatkan tabungan secara konsisten.

---

## 1. Konsep Utama

Aplikasi ini ditujukan untuk penggunaan pribadi. Pengguna memasukkan uang yang diterima setiap minggu, lalu aplikasi membaginya ke beberapa kategori anggaran. Setiap transaksi mengurangi saldo kategori terkait. Ketika minggu berakhir, sisa anggaran dipindahkan ke tabungan dan periode baru dimulai.

Fokus aplikasi:
- Pengelolaan uang mingguan.
- Pencatatan transaksi.
- Pemantauan anggaran per kategori.
- Pelacakan pertumbuhan tabungan.
- Backup dan pemulihan data.

## 2. Teknologi

| Bagian | Teknologi | Fungsi |
|---|---|---|
| Struktur tampilan | HTML | Struktur halaman |
| Desain | CSS | Layout, warna, dan responsivitas iPhone |
| Logika aplikasi | JavaScript | Anggaran, transaksi, dan perhitungan tabungan |
| Database lokal | IndexedDB | Menyimpan data keuangan di perangkat |
| Dukungan offline | Service Worker | Menyimpan file aplikasi agar bisa dibuka offline |
| Instalasi | PWA | Memungkinkan aplikasi ditambahkan ke Home Screen iPhone |
| Hosting | GitHub Pages atau Netlify | Menyediakan file aplikasi melalui HTTPS |

Untuk versi pertama, aplikasi tidak memerlukan backend, login, atau database online. Hosting statis gratis hanya menyajikan file aplikasi; data keuangan tetap disimpan secara lokal.

## 3. Struktur Menu

### A. Beranda
- Saldo anggaran minggu ini.
- Total pengeluaran minggu ini.
- Total tabungan.
- Sisa anggaran setiap kategori.
- Transaksi terbaru.
- Tombol tambah transaksi.

### B. Transaksi
- Daftar pemasukan dan pengeluaran.
- Tambah transaksi.
- Edit transaksi.
- Hapus transaksi dengan konfirmasi.
- Filter berdasarkan tanggal, jenis, dan kategori.

### C. Tabungan
- Total tabungan terkumpul.
- Riwayat setoran.
- Tambahan tabungan dari sisa anggaran.
- Riwayat penarikan jika fitur penarikan diaktifkan.
- Grafik perkembangan tabungan.

### D. Pengaturan
- Mengatur nominal dan persentase anggaran.
- Mengatur kategori.
- Mengatur awal periode mingguan.
- Ekspor dan impor backup.
- Pengaturan opsional PIN aplikasi.

## 4. Sistem Pembagian Uang

Pembagian awal yang disarankan:

| Kategori | Persentase | Jika Rp350.000 | Jika Rp400.000 |
|---|---:|---:|---:|
| Kebutuhan | 55% | Rp192.500 | Rp220.000 |
| Keinginan | 15% | Rp52.500 | Rp60.000 |
| Tabungan awal | 15% | Rp52.500 | Rp60.000 |
| Dana cadangan | 10% | Rp35.000 | Rp40.000 |
| Bebas | 5% | Rp17.500 | Rp20.000 |
| **Total** | **100%** | **Rp350.000** | **Rp400.000** |

Persentase ini adalah nilai awal dan harus dapat diubah di pengaturan.

Kategori kebutuhan dapat mencakup:
- Makan.
- Bensin.
- Rokok.
- Galon.
- Kebutuhan kost lainnya.

Kategori keinginan dapat mencakup jajan tambahan, nongkrong, game, atau pengeluaran tidak wajib lainnya.

## 5. Alur Keuangan Mingguan

1. Pengguna memasukkan nominal uang mingguan, misalnya Rp350.000 atau Rp400.000.
2. Aplikasi membagi nominal sesuai persentase kategori.
3. Bagian tabungan awal langsung ditambahkan ke total tabungan.
4. Pengguna mencatat setiap pengeluaran.
5. Saldo kategori diperbarui otomatis.
6. Saat minggu berakhir, aplikasi menghitung sisa anggaran.
7. Sisa anggaran yang memenuhi aturan penutupan dipindahkan ke tabungan.
8. Aplikasi membuat periode mingguan baru.

### Aturan penting
- Tabungan awal tidak boleh dihitung sebagai uang belanja.
- Setiap perpindahan ke tabungan harus tercatat satu kali saja.
- Sisa anggaran tidak otomatis dibawa menjadi anggaran belanja minggu berikutnya.
- Dana cadangan tetap terpisah. Jika tidak terpakai, pengguna dapat memilih untuk memindahkannya ke tabungan saat penutupan minggu.
- Aplikasi harus mencegah saldo menjadi tidak konsisten ketika transaksi lama diedit atau dihapus.

## 6. Rancangan Dashboard

Dashboard sebaiknya menampilkan:
- Periode minggu berjalan.
- Total anggaran minggu ini.
- Total pengeluaran.
- Sisa anggaran yang tersedia.
- Total tabungan terkumpul.
- Sisa saldo per kategori.
- Daftar transaksi terbaru.
- Tombol **Catat Pengeluaran** yang mudah dijangkau dengan satu tangan.

Desain harus responsif untuk layar iPhone, dengan teks yang mudah dibaca, tombol yang cukup besar, dan navigasi bawah.

## 7. Fitur Utama

### A. Anggaran Mingguan
- Masukkan nominal uang yang diterima.
- Pembagian otomatis berdasarkan persentase.
- Persentase dapat diubah.
- Tampilkan batas dan sisa anggaran per kategori.

### B. Pencatatan Transaksi
Data transaksi:
- ID transaksi.
- Tanggal.
- Jenis transaksi: pemasukan atau pengeluaran.
- Nominal.
- Kategori.
- Keterangan opsional.
- Waktu pembuatan dan perubahan data.

### C. Riwayat dan Laporan
- Riwayat mingguan dan bulanan.
- Total pengeluaran per kategori.
- Perbandingan anggaran dan realisasi.
- Grafik perkembangan tabungan.

### D. Tabungan
- Tabungan awal setiap minggu.
- Tambahan dari sisa anggaran.
- Riwayat setoran dan penarikan.
- Total tabungan saat ini.

### E. Backup dan Keamanan
- Ekspor seluruh data menjadi file JSON.
- Impor file JSON untuk memulihkan data.
- Konfirmasi sebelum penghapusan data.
- PIN aplikasi sebagai fitur opsional.

## 8. Rancangan Database Lokal

Gunakan IndexedDB dengan beberapa object store berikut:

| Object store | Data |
|---|---|
| `settings` | Persentase anggaran, preferensi, dan tanggal awal minggu |
| `weeks` | Periode, uang masuk, status periode, dan ringkasan anggaran |
| `transactions` | Tanggal, nominal, kategori, jenis, dan keterangan |
| `categories` | Nama kategori dan batas anggaran |
| `savings` | Riwayat setoran, tambahan dari sisa uang, dan penarikan |

Setiap perpindahan uang ke tabungan harus direpresentasikan secara konsisten. Hindari menyimpan saldo hasil perhitungan sebagai satu-satunya sumber data; gunakan catatan transaksi dan perpindahan dana sebagai sumber utama agar saldo dapat dihitung ulang dengan benar.

## 9. Struktur Folder Proyek

```text
dompetku/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── service-worker.js
├── js/
│   ├── db.js
│   ├── transactions.js
│   ├── budget.js
│   ├── savings.js
│   └── reports.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

Keterangan:
- `index.html`: halaman utama.
- `style.css`: desain responsif.
- `app.js`: inisialisasi dan navigasi aplikasi.
- `db.js`: pengelolaan IndexedDB.
- `transactions.js`: tambah, edit, hapus, dan tampilkan transaksi.
- `budget.js`: pembagian dan penghitungan anggaran.
- `savings.js`: tabungan dan penutupan minggu.
- `reports.js`: ringkasan dan laporan.
- `manifest.json`: identitas PWA.
- `service-worker.js`: cache untuk akses offline.
- `icons/`: ikon aplikasi.

## 10. Tahapan Pengembangan

### Tahap 1 — Fondasi tampilan
- Buat struktur HTML.
- Buat desain responsif untuk iPhone.
- Buat navigasi dan dashboard menggunakan data contoh.

### Tahap 2 — Penyimpanan lokal
- Siapkan IndexedDB.
- Buat fungsi tambah, baca, edit, dan hapus transaksi.
- Pastikan data tetap tersedia setelah aplikasi ditutup dan dibuka kembali.

### Tahap 3 — Anggaran
- Buat pembagian uang otomatis.
- Hubungkan transaksi dengan kategori.
- Perbarui saldo kategori setelah transaksi.

### Tahap 4 — Tabungan
- Catat tabungan awal mingguan.
- Buat proses penutupan minggu.
- Pindahkan sisa anggaran ke tabungan tanpa menghitung dana dua kali.
- Buat riwayat pertumbuhan tabungan.

### Tahap 5 — PWA dan pengujian
- Tambahkan manifest dan ikon.
- Tambahkan Service Worker.
- Uji akses offline.
- Buat fitur backup dan restore.
- Hosting file aplikasi melalui HTTPS.
- Buka melalui Safari dan tambahkan ke Home Screen iPhone.

## 11. Keputusan Proyek

- Aplikasi ditujukan untuk penggunaan pribadi.
- Perangkat utama adalah iPhone.
- Teknologi utama: HTML, CSS, dan JavaScript.
- Bentuk aplikasi: PWA.
- Penyimpanan: IndexedDB.
- Tidak memakai backend atau database online pada versi pertama.
- Uang dikelola per minggu.
- Tabungan awal dipisahkan ketika uang masuk.
- Sisa anggaran dipindahkan ke tabungan saat minggu ditutup.
- Dana cadangan tetap terpisah kecuali pengguna memilih memindahkannya.
- Data dapat diekspor dan dipulihkan melalui backup.

## 12. Hal yang Belum Diputuskan

- Nama final aplikasi.
- Desain visual final.
- Apakah dana cadangan otomatis ditabung atau tetap menjadi cadangan.
- Apakah penarikan tabungan akan tersedia pada versi pertama.
- Apakah aplikasi perlu PIN sejak versi awal.

## 13. Catatan Penting

PWA dengan IndexedDB menyimpan data pada penyimpanan browser/perangkat. Data tidak otomatis tersinkronisasi ke perangkat lain dan dapat hilang jika data situs dihapus atau terjadi masalah pada perangkat. Karena itu, fitur backup dan restore sebaiknya dibuat sebelum aplikasi dipakai untuk mencatat keuangan secara rutin.

**Langkah awal saat mulai mengerjakan:** selesaikan Tahap 1 terlebih dahulu—buat tampilan dashboard dengan HTML dan CSS. Setelah tampilannya sesuai, lanjutkan ke IndexedDB dan logika anggaran.
