# Membuka SST Bengkel di Windows

Klik dua kali `SST Bengkel.exe` di folder proyek. Server lokal akan dinyalakan otomatis jika belum berjalan, kemudian aplikasi dibuka dalam jendela Chrome atau Edge tanpa kolom alamat.

Ini adalah launcher lokal untuk instalasi proyek saat ini, bukan installer mandiri. Laptop masih membutuhkan Node.js 22, dependensi proyek, dan file `.env`. Launcher menjalankan server dan Vite secara langsung; pengguna tidak perlu mengetik `npm run dev`. Instalasi Node.js 22 melalui NVM juga didukung. Jangan pindahkan EXE sendirian; buat shortcut ke EXE jika ingin membukanya dari desktop.

Data tetap menggunakan database proyek saat ini. Launcher tidak menyalin atau mengganti database. Server tetap berjalan setelah jendela ditutup, sehingga aplikasi cepat dibuka kembali. Log startup tersimpan dalam `tmp/desktop`.

Untuk membangun ulang EXE:

```powershell
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' /nologo /target:winexe /reference:System.Windows.Forms.dll '/out:SST Bengkel.exe' '.\desktop\Launcher.cs'
```

Shortcut `SST Bengkel.lnk` sudah dibuat di Desktop Windows pada laptop ini. Pengujian 28 November 2026 berhasil dari kondisi server mati: EXE menyalakan server dan frontend lalu membuka halaman Ringkasan dengan data bengkel.
