const fs = require('fs');
const path = require('path');
const { PDFDocument, PDFForm, PDFTextField, rgb } = require('pdf-lib');
const dayjs = require('dayjs');

// Sample SPK data untuk testing
const sampleSpkData = {
    spk_number: 'SPK-202412-0001',
    tanggal_masuk: Date.now(),
    tanggal_keluar: Date.now() + (24 * 60 * 60 * 1000), // +1 day
    customer_name: 'John Doe',
    customer_address: 'Jl. Contoh No. 123, Jakarta Selatan',
    customer_phone: '081234567890',
    license_plate: 'B 1234 ABC',
    brand: 'Toyota',
    model: 'Avanza',
    year: 2020,
    kilometer: 45000,
    keluhan: 'Mesin bersuara kasar dan oli bocor',
    service_description: 'Ganti oli mesin, tune up, dan perbaikan kebocoran oli',
    estimated_cost: 750000,
    actual_cost: 720000,
    status: 'completed'
};

/**
 * Format tanggal untuk display
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    return dayjs(timestamp).format('DD/MM/YYYY');
}

/**
 * Format tanggal dan waktu untuk display
 */
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    return dayjs(timestamp).format('DD/MM/YYYY HH:mm');
}

/**
 * Format currency untuk display
 */
function formatCurrency(amount) {
    if (!amount) return '';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Generate SPK PDF dengan mengisi template yang sudah ada
 */
async function generateSpkPdf(spkData) {
    try {
        const templatePath = path.join(__dirname, 'resources/js/Components/spk.pdf');
        
        console.log('📄 Reading template PDF from:', templatePath);
        
        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template PDF not found at: ${templatePath}`);
        }
        
        // Baca template PDF
        const existingPdfBytes = fs.readFileSync(templatePath);
        console.log('✅ Template PDF loaded successfully');
        
        // Load PDF document
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        console.log('✅ PDF document loaded');
        
        // Coba akses form fields dulu
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        console.log(`📋 Found ${fields.length} form fields in PDF`);
        
        if (fields.length > 0) {
            console.log('🔧 Using form fields approach');
            console.log('Available form fields:');
            fields.forEach((field, index) => {
                console.log(`  ${index + 1}. ${field.getName()} (${field.constructor.name})`);
            });
            
            await fillFormFields(form, spkData);
        } else {
            console.log('🔧 No form fields found, using text overlay approach');
            await overlayTextOnPdf(pdfDoc, spkData);
        }
        
        // Serialize PDF dan return sebagai buffer
        const pdfBytes = await pdfDoc.save();
        console.log('✅ PDF generated successfully');
        
        return Buffer.from(pdfBytes);
        
    } catch (error) {
        console.error('❌ Error generating SPK PDF:', error);
        throw error;
    }
}

/**
 * Mengisi form fields jika PDF memiliki form
 */
async function fillFormFields(form, spkData) {
    try {
        // Map data SPK ke form fields (sesuaikan dengan nama field di PDF)
        const fieldMappings = {
            'spk_number': spkData.spk_number,
            'nomor_surat': spkData.spk_number,
            'tanggal_surat': formatDate(spkData.tanggal_masuk),
            'tanggal_masuk': formatDate(spkData.tanggal_masuk),
            'customer_name': spkData.customer_name,
            'nama': spkData.customer_name,
            'alamat': spkData.customer_address,
            'customer_address': spkData.customer_address,
            'phone': spkData.customer_phone,
            'no_telp': spkData.customer_phone,
            'customer_phone': spkData.customer_phone,
            'license_plate': spkData.license_plate,
            'no_polisi': spkData.license_plate,
            'vehicle_brand': spkData.brand,
            'brand': spkData.brand,
            'vehicle_model': spkData.model,
            'model': spkData.model,
            'type_model': `${spkData.brand} ${spkData.model}`,
            'vehicle_year': spkData.year?.toString(),
            'year': spkData.year?.toString(),
            'tahun': spkData.year?.toString(),
            'kilometer': spkData.kilometer?.toString(),
            'keluhan': spkData.keluhan,
            'service_description': spkData.service_description,
            'service': spkData.service_description,
            'jam_masuk': formatDateTime(spkData.tanggal_masuk),
            'jam_janji_selesai': formatDateTime(spkData.tanggal_keluar),
            'tanggal_keluar': formatDateTime(spkData.tanggal_keluar),
            'estimated_cost': formatCurrency(spkData.estimated_cost),
            'estimasi_biaya': formatCurrency(spkData.estimated_cost),
            'actual_cost': formatCurrency(spkData.actual_cost),
            'biaya_aktual': formatCurrency(spkData.actual_cost)
        };

        console.log('🔧 Filling form fields:');
        let filledCount = 0;
        
        // Isi form fields yang tersedia
        for (const [fieldName, value] of Object.entries(fieldMappings)) {
            try {
                const field = form.getTextField(fieldName);
                if (field && value) {
                    field.setText(value.toString());
                    console.log(`  ✅ ${fieldName}: "${value}"`);
                    filledCount++;
                }
            } catch (error) {
                // Field tidak ditemukan, lanjutkan ke field berikutnya
                console.log(`  ⚠️  ${fieldName}: field not found`);
                continue;
            }
        }

        console.log(`✅ Successfully filled ${filledCount} form fields`);

        // Flatten form agar tidak bisa di-edit lagi
        form.flatten();
        console.log('✅ Form flattened');
        
    } catch (error) {
        console.error('❌ Error filling form fields:', error);
        throw error;
    }
}

/**
 * Overlay text jika PDF tidak memiliki form fields
 */
async function overlayTextOnPdf(pdfDoc, spkData) {
    try {
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        console.log(`📐 PDF dimensions: ${width} x ${height}`);

        // Konfigurasi font dan ukuran
        const font = await pdfDoc.embedFont('Helvetica');
        const fontSize = 10;
        const textColor = rgb(0, 0, 0);

        // Koordinat untuk masing-masing field (sesuaikan dengan template PDF)
        // Ini contoh koordinat, perlu disesuaikan dengan template sesungguhnya
        const textPositions = [
            { label: 'SPK Number', text: spkData.spk_number, x: 450, y: 760 },
            { label: 'Tanggal Masuk', text: formatDate(spkData.tanggal_masuk), x: 450, y: 740 },
            { label: 'Nama Customer', text: spkData.customer_name, x: 100, y: 657 },
            { label: 'Alamat', text: spkData.customer_address, x: 100, y: 620 },
            { label: 'No Telp', text: spkData.customer_phone, x: 100, y: 549 },
            { label: 'No Polisi', text: spkData.license_plate, x: 345, y: 657 },
            { label: 'Type/Model', text: `${spkData.brand} ${spkData.model}`, x: 345, y: 622 },
            { label: 'Tahun', text: spkData.year?.toString(), x: 345, y: 580 },
            { label: 'Kilometer', text: spkData.kilometer?.toString(), x: 345, y: 549 },
            { label: 'Keluhan', text: spkData.keluhan, x: 260, y: 480 },
            { label: 'Service', text: spkData.service_description, x: 40, y: 480 },
            { label: 'Estimasi Biaya', text: formatCurrency(spkData.estimated_cost), x: 100, y: 105 },
            { label: 'Biaya Aktual', text: formatCurrency(spkData.actual_cost), x: 150, y: height - 440 }
        ];

        console.log('🔧 Adding text overlays:');
        
        // Tambahkan text ke PDF
        for (const position of textPositions) {
            if (position.text) {
                firstPage.drawText(position.text, {
                    x: position.x,
                    y: position.y,
                    size: fontSize,
                    font: font,
                    color: textColor,
                });
                console.log(`  ✅ ${position.label}: "${position.text}" at (${position.x}, ${position.y})`);
            } else {
                console.log(`  ⚠️  ${position.label}: no data`);
            }
        }
        
        console.log('✅ Text overlay completed');
        
    } catch (error) {
        console.error('❌ Error overlaying text on PDF:', error);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting PDF generation test...\n');
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
            console.log('📁 Created temp directory');
        }
        
        // Generate PDF
        const pdfBuffer = await generateSpkPdf(sampleSpkData);
        
        // Save to temp directory
        const outputPath = path.join(tempDir, `SPK-${sampleSpkData.spk_number}-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`\n✅ PDF generated successfully!`);
        console.log(`📁 Output saved to: ${outputPath}`);
        console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        
        console.log('\n📋 Sample data used:');
        console.log(JSON.stringify(sampleSpkData, null, 2));
        
        console.log('\n💡 Tips for adjusting field positions:');
        console.log('1. Open the generated PDF to see current field positions');
        console.log('2. Adjust coordinates in overlayTextOnPdf function');
        console.log('3. PDF coordinate system: (0,0) is bottom-left corner');
        console.log('4. Increase Y value to move text up, decrease to move down');
        console.log('5. Increase X value to move text right, decrease to move left');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
main();