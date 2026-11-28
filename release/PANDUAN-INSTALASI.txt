# SST Bengkel untuk Windows

Installer: SST-Bengkel-Setup-1.1.0-x64.exe

1. Salin installer ke laptop Windows 10/11 64-bit.
2. Jalankan installer, lalu ikuti petunjuknya. Shortcut Desktop dibuat otomatis bila opsi tersebut dicentang.
3. Klik SST Bengkel untuk membuka aplikasi. Node.js sudah disertakan; tidak perlu memasang Node.js, menjalankan npm, atau membuka terminal.

Aplikasi menggunakan jendela Chrome atau Microsoft Edge yang sudah tersedia di Windows. Browser default akan digunakan jika keduanya tidak ditemukan. Data bengkel dapat dikelola tanpa koneksi internet. Setiap laptop menyimpan datanya sendiri; tidak ada sinkronisasi antar laptop.

## Penyimpanan data

Instalasi baru dimulai dengan data kosong. Installer tidak berisi data pelanggan atau database dari laptop pembuat installer.

Database: %LOCALAPPDATA%\SSTBengkel\bengkel.sqlite3
Log: %LOCALAPPDATA%\SSTBengkel\logs
Backup sebelum perubahan struktur database: %LOCALAPPDATA%\SSTBengkel\backups

Program dipasang di %LOCALAPPDATA%\Programs\SSTBengkel. Folder data terpisah dari folder program. Update dan uninstall tidak menghapus database pengguna.

Server lokal tetap menyala setelah jendela ditutup. Untuk menghentikannya, tutup jendela aplikasi dan pilih "Hentikan server SST Bengkel" di Start Menu. Komputer yang dimatikan akan menghentikan server; membuka aplikasi akan menyalakannya lagi.

## Memindahkan data

Tutup jendela SST Bengkel dan hentikan server di kedua laptop sebelum menyalin database. Simpan salinan database tujuan terlebih dahulu. Salin file bengkel.sqlite3 dari folder data laptop asal ke folder data laptop tujuan. Jika masih ada file bengkel.sqlite3-wal atau bengkel.sqlite3-shm, jangan menyalin database dengan Explorer; lakukan backup SQLite terlebih dahulu untuk memastikan data terakhir ikut tersimpan.

Untuk memindahkan data dari proyek pengembangan (dev.sqlite3), gunakan backup SQLite yang konsisten, simpan dengan nama bengkel.sqlite3 di folder data tujuan saat server tujuan berhenti. Jangan mengganti file database saat aplikasi berjalan.

## Catatan distribusi

Installer belum ditandatangani dengan sertifikat penerbit. Windows mungkin menampilkan penerbit tidak dikenal. Verifikasi asal file sebelum menjalankan installer.
