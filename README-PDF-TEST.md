# 📄 PDF Generation Test Scripts

Test scripts untuk mengatur posisi field pada PDF SPK generation.

## 🔧 Files yang Dibuat

1. **`test-pdf-generation.js`** - Script utama untuk test PDF generation
2. **`pdf-position-helper.js`** - Helper untuk menyesuaikan posisi field
3. **`temp/`** - Direktori output PDF hasil test

## 🚀 Cara Menggunakan

### 1. Generate PDF Test Pertama
```bash
node test-pdf-generation.js
```
Ini akan menghasilkan PDF dengan posisi field default di direktori `temp/`.

### 2. Generate Coordinate Grid
```bash
node pdf-position-helper.js grid
```
Menghasilkan PDF dengan grid koordinat untuk membantu menentukan posisi yang tepat.

### 3. Test dengan Posisi Custom
```bash
node pdf-position-helper.js test
```
Generate PDF dengan posisi field yang sudah disesuaikan di `FIELD_POSITIONS`.

### 4. Export Kode untuk PdfService
```bash
node pdf-position-helper.js export
```
Menampilkan kode yang bisa di-copy ke `PdfService.ts` untuk update koordinat.

## 📐 Sistem Koordinat PDF

- **Origin (0,0)**: Bottom-left corner
- **X-axis**: Increase untuk move RIGHT
- **Y-axis**: Increase untuk move UP
- **PDF Size**: 595.5 x 842.25 points (A4)

## 🎯 Langkah Menyesuaikan Posisi

1. **Buka file template PDF** (`resources/js/Components/spk.pdf`) untuk melihat layout asli
2. **Generate coordinate grid** dengan `node pdf-position-helper.js grid`
3. **Buka `spk-coordinate-grid.pdf`** untuk melihat koordinat
4. **Edit `FIELD_POSITIONS`** di `pdf-position-helper.js` sesuai kebutuhan:
   ```javascript
   const FIELD_POSITIONS = {
       spk_number: { label: 'No SPK', x: 150, y: 722 },
       customer_name: { label: 'Nama', x: 150, y: 682 },
       // ... dst
   };
   ```
5. **Test posisi baru** dengan `node pdf-position-helper.js test`
6. **Export ke PdfService** dengan `node pdf-position-helper.js export`
7. **Update PdfService.ts** dengan kode yang dihasilkan

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

- `SPK-{number}-{timestamp}.pdf` - PDF hasil test dengan data sample
- `spk-coordinate-grid.pdf` - PDF dengan grid koordinat
- `spk-positioned-fields.pdf` - PDF dengan posisi field yang disesuaikan

## 💡 Tips

1. **Buka PDF di PDF reader** yang bisa menampilkan koordinat mouse (seperti Adobe Reader)
2. **Gunakan grid** untuk menentukan koordinat yang tepat
3. **Test iterative** - adjust -> test -> adjust lagi
4. **Perhatikan text length** - pastikan ada ruang cukup untuk text panjang
5. **Check margin** - jangan terlalu dekat dengan tepi PDF

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