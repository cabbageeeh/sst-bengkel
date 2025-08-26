# 📄 PDF Generation Test Scripts dengan Auto-Wrapping

Test scripts untuk mengatur posisi field pada PDF SPK generation dengan fitur automatic text wrapping untuk text panjang.

## 🔧 Files yang Dibuat

1. **`test-pdf-generation.js`** - Script utama untuk test PDF generation (basic)
2. **`test-pdf-generation-wrapped.js`** - Script dengan fitur auto-wrapping untuk text panjang ⭐
3. **`pdf-position-helper.js`** - Helper untuk menyesuaikan posisi field dengan wrapping support
4. **`temp/`** - Direktori output PDF hasil test

## 🚀 Cara Menggunakan

### 1. Generate PDF Test dengan Auto-Wrapping (Recommended)
```bash
node test-pdf-generation-wrapped.js
```
Script ini menggunakan data sample dengan text panjang dan otomatis wrap text yang terlalu panjang.

### 2. Generate PDF Test Basic
```bash
node test-pdf-generation.js
```
Script basic tanpa auto-wrapping.

### 3. Generate Coordinate Grid
```bash
node pdf-position-helper.js grid
```
Menghasilkan PDF dengan grid koordinat untuk membantu menentukan posisi yang tepat.

### 4. Test dengan Posisi Custom + Auto-Wrapping
```bash
node pdf-position-helper.js test
```
Generate PDF dengan posisi field yang sudah disesuaikan di `FIELD_POSITIONS` dengan auto-wrapping.

### 5. Export Kode untuk PdfService
```bash
node pdf-position-helper.js export
```
Menampilkan kode yang bisa di-copy ke `PdfService.ts` untuk update koordinat.

## ⭐ Fitur Auto-Wrapping

### Apa itu Auto-Wrapping?
Fitur yang secara otomatis memecah text panjang menjadi beberapa baris agar tidak keluar dari area yang ditentukan.

### Fitur yang Tersedia:
- ✅ **Automatic text width detection** - Mendeteksi lebar text secara otomatis
- ✅ **Smart word wrapping** - Memecah di spasi, bukan di tengah kata
- ✅ **Configurable column widths** - Bisa set lebar maksimal per field
- ✅ **Line height adjustment** - Pengaturan jarak antar baris
- ✅ **Long text handling** - Khusus untuk field keluhan & service description
- ✅ **Console output** - Info detail proses wrapping

### Sample Data dengan Text Panjang:
```javascript
{
  customer_name: "John Doe Dengan Nama Yang Sangat Panjang Sekali",
  customer_address: "Jl. Contoh Alamat Yang Sangat Panjang Sekali No. 123, RT 05/RW 07, Kelurahan Contoh, Kecamatan Sample, Jakarta Selatan 12345",
  keluhan: "Mesin bersuara kasar dan oli bocor, ada bunyi tidak normal dari bagian depan, kemungkinan masalah pada bearing atau komponen transmisi, perlu pemeriksaan menyeluruh untuk mengetahui sumber masalah yang sebenarnya",
  service_description: "Ganti oli mesin menggunakan oli sintetik SAE 5W-30, tune up lengkap termasuk ganti busi, filter udara, dan filter oli, perbaikan kebocoran oli pada bagian gasket kepala silinder, pembersihan throttle body, pemeriksaan sistem pendingin dan radiator, serta general check up untuk semua komponen kendaraan"
}
```

## 📐 Sistem Koordinat PDF

- **Origin (0,0)**: Bottom-left corner
- **X-axis**: Increase untuk move RIGHT
- **Y-axis**: Increase untuk move UP
- **PDF Size**: 595.5 x 842.25 points (A4)

## 🎯 Langkah Menyesuaikan Posisi dengan Auto-Wrapping

1. **Buka file template PDF** (`resources/js/Components/spk.pdf`) untuk melihat layout asli
2. **Generate coordinate grid** dengan `node pdf-position-helper.js grid`
3. **Buka `spk-coordinate-grid.pdf`** untuk melihat koordinat
4. **Edit `FIELD_POSITIONS`** di `pdf-position-helper.js` sesuai kebutuhan:
   ```javascript
   const FIELD_POSITIONS = {
       customer_name: { label: 'Nama', x: 100, y: 657, maxWidth: 200 },
       customer_address: { label: 'Alamat', x: 100, y: 620, maxWidth: 200 },
       keluhan: { label: 'Keluhan', x: 260, y: 480, maxWidth: 195 },
       service_description: { label: 'Service', x: 40, y: 480, maxWidth: 415 },
       // ... dst
   };
   ```
5. **Test posisi baru** dengan `node pdf-position-helper.js test`
6. **Cek console output** untuk info wrapping:
   ```
   📝 Nama Customer: "John Doe Dengan Nama Yang Sangat Panjang Sekali" (282px > 200px - WRAPPING)
        ↳ Wrapped into 2 lines: "John Doe Dengan Nama Yang Sangat", "Panjang Sekali"
        ↳ Final Y position: 645
   ```
7. **Export ke PdfService** dengan `node pdf-position-helper.js export`
8. **Update PdfService.ts** dengan kode yang dihasilkan

## 📋 Sample Data yang Digunakan

```javascript
{
  "spk_number": "SPK-202412-0001",
  "customer_name": "John Doe",
  "customer_address": "Jl. Contoh No. 123, Jakarta Selatan", 
  "customer_phone": "081234567890",
  "license_plate": "B 1234 ABC",
  "brand": "Toyota",
  "model": "Avanza",
  "year": 2020,
  "kilometer": 45000,
  "keluhan": "Mesin bersuara kasar dan oli bocor",
  "service_description": "Ganti oli mesin, tune up, dan perbaikan kebocoran oli",
  "estimated_cost": 750000,
  "actual_cost": 720000
}
```

## 📁 Output Files

- `SPK-{number}-{timestamp}.pdf` - PDF hasil test basic
- `SPK-WRAPPED-{number}-{timestamp}.pdf` - PDF dengan auto-wrapping ⭐
- `spk-coordinate-grid.pdf` - PDF dengan grid koordinat
- `spk-positioned-fields.pdf` - PDF dengan posisi field yang disesuaikan

## 💡 Tips Auto-Wrapping

1. **Buka PDF di PDF reader** yang bisa menampilkan koordinat mouse (seperti Adobe Reader)
2. **Gunakan grid** untuk menentukan koordinat yang tepat
3. **Test iterative** - adjust -> test -> adjust lagi
4. **Perhatikan maxWidth** - set lebar maksimal yang sesuai dengan area field
5. **Check wrapping info** - lihat console output untuk info detail wrapping
6. **Adjust line spacing** - sesuaikan lineHeight jika perlu
7. **Test dengan text panjang** - pastikan semua case text panjang teratasi
8. **Koordinasi field** - pastikan field yang di-wrap tidak overlap dengan field lain

### Parameter Auto-Wrapping:
- **maxWidth**: Lebar maksimal sebelum text di-wrap
- **lineHeight**: Jarak antar baris (default: fontSize * 1.2)
- **fontSize**: Ukuran font (mempengaruhi width calculation)

### Field yang Biasanya Perlu Wrapping:
- ✅ **customer_address** - Alamat sering panjang
- ✅ **keluhan** - Deskripsi masalah bisa detail
- ✅ **service_description** - Deskripsi service bisa panjang
- ⚠️ **customer_name** - Kadang nama panjang

## 🔄 Update PdfService

Setelah menentukan koordinat yang tepat, update `app/services/PdfService.ts`:

1. Copy output dari `node pdf-position-helper.js export`
2. Replace array `textPositions` di method `overlayTextOnPdf`
3. Test di aplikasi dengan endpoint `/spk/:id/pdf`

## 🎨 Format Data

- **Tanggal**: DD/MM/YYYY format Indonesia
- **Currency**: Rp 123.456 format Indonesia
- **DateTime**: DD/MM/YYYY HH:mm
- **Text**: UTF-8 dengan support karakter Indonesia