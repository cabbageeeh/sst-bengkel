# Membuka SST Bengkel di Windows

Untuk laptop tanpa Node.js, gunakan installer mandiri yang dijelaskan di [INSTALL-WINDOWS.md](INSTALL-WINDOWS.md). Bagian berikut menjelaskan launcher pengembangan di folder proyek.

Klik dua kali `SST Bengkel.exe` di folder proyek. Server lokal akan dinyalakan otomatis jika belum berjalan, kemudian aplikasi dibuka dalam jendela Chrome atau Edge tanpa kolom alamat.

Ini adalah launcher lokal untuk instalasi proyek saat ini, bukan installer mandiri. Laptop masih membutuhkan Node.js 22, dependensi proyek, dan file `.env`. Launcher menjalankan server dan Vite secara langsung; pengguna tidak perlu mengetik `npm run dev`. Instalasi Node.js 22 melalui NVM juga didukung. Jangan pindahkan EXE sendirian; buat shortcut ke EXE jika ingin membukanya dari desktop.

Data tetap menggunakan database proyek saat ini. Launcher tidak menyalin atau mengganti database. Server tetap berjalan setelah jendela ditutup, sehingga aplikasi cepat dibuka kembali. Log startup tersimpan dalam `tmp/desktop`.

Untuk membangun ulang EXE:

```powershell
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' /nologo /target:winexe /reference:System.Windows.Forms.dll '/win32icon:public\images\sst-bengkel.ico' '/out:SST Bengkel.exe' '.\desktop\Launcher.cs'
```

Shortcut `SST Bengkel.lnk` sudah dibuat di Desktop Windows pada laptop ini. Pengujian 28 November 2026 berhasil dari kondisi server mati: EXE menyalakan server dan frontend lalu membuka halaman Ringkasan dengan data bengkel.

## Membangun installer mandiri

Pasang dependensi proyek dan Inno Setup 6.4.3 pada mesin pembuat. Jalankan dengan Node.js 22:

```powershell
node desktop/build-installer.cjs --node-root 'C:\path\node22' --iscc 'C:\path\Inno Setup 6\ISCC.exe'
```

Installer dan checksum dibuat di `release/` (tidak masuk Git). Builder menggunakan dependensi produksi yang sudah terpasang, sehingga modul native better-sqlite3 dan uWebSockets.js harus cocok dengan Node.js 22 Windows x64. Builder memeriksa kedua modul tersebut sebelum membuat installer.

Hasil build menyertakan runtime Node.js dan lisensinya, kode backend JavaScript, aset frontend hasil build, migrasi database, serta launcher Windows. Database proyek, `.env`, log, dan data pelanggan tidak dimasukkan. Compiler Inno Setup 6.4.3: https://github.com/jrsoftware/issrc/releases/tag/is-6_4_3

Ikon Windows berasal dari logo SST Bengkel di `public/images/sst-bengkel-logo.png`. Untuk membuat ulang file ICO ukuran 16–256 piksel, jalankan `powershell -NoProfile -ExecutionPolicy Bypass -File desktop/build-icon.ps1`. Ikon ditanam dalam EXE, installer, dan shortcut Desktop/Start Menu.

Pengujian paket (membuat data uji terisolasi di `tmp/`):

```powershell
& '.\tmp\installer-build\payload\runtime\node.exe' tests/desktop-package.cjs
```
