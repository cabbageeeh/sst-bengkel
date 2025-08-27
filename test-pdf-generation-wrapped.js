const fs = require('fs');
const path = require('path');
const { PDFDocument, PDFForm, PDFTextField, rgb } = require('pdf-lib');
const dayjs = require('dayjs');

// Sample SPK data untuk testing dengan text yang panjang
const sampleSpkData = {
    spk_number: 'SPK-202412-0001',
    tanggal_masuk: Date.now(),
    tanggal_keluar: Date.now() + (24 * 60 * 60 * 1000), // +1 day
    jam_masuk: Date.now(), // Jam masuk untuk field terpisah
    jam_janji_selesai: Date.now() + (8 * 60 * 60 * 1000), // +8 hours
    customer_name: 'Dani Rama',
    customer_address: 'Jl. Contoh Alamat Yang Sangat Panjang Sekali No. 123, RT 05/RW 07, Kelurahan Contoh, Kecamatan Sample, Jakarta Selatan 12345',
    customer_phone: '081234567890',
    license_plate: 'B 1234 ABC',
    brand: 'Toyota',
    model: 'Avanza',
    year: 2020,
    kilometer: 45000,
    jarak: 45000, // Jarak sama dengan kilometer
    keluhan: 'Mesin bersuara kasar dan oli bocor, ada bunyi tidak normal dari bagian depan, kemungkinan masalah pada bearing atau komponen transmisi, perlu pemeriksaan menyeluruh untuk mengetahui sumber masalah yang sebenarnya',
    service_description: 'Ganti oli mesin menggunakan oli sintetik SAE 5W-30, tune up lengkap termasuk ganti busi, filter udara, dan filter oli, perbaikan kebocoran oli pada bagian gasket kepala silinder, pembersihan throttle body, pemeriksaan sistem pendingin dan radiator, serta general check up untuk semua komponen kendaraan',
    estimated_cost: 750000,
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
 * Format waktu saja untuk display (jam masuk dan jam janji selesai)
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    return dayjs(timestamp).format('HH:mm');
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
 * Calculate text width for given font and size
 */
function getTextWidth(text, font, fontSize) {
    if (!text) return 0;
    // Approximate width calculation for Helvetica font
    // Different characters have different widths, this is a rough estimation
    const avgCharWidth = fontSize * 0.6; // Average character width ratio for Helvetica
    return text.length * avgCharWidth;
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(text, font, fontSize, maxWidth) {
    if (!text) return [];
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = getTextWidth(testLine, font, fontSize);
        
        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
                
                // Check if single word is still too long
                if (getTextWidth(currentLine, font, fontSize) > maxWidth) {
                    // Force break very long words
                    lines.push(currentLine);
                    currentLine = '';
                }
            } else {
                // Single word is too long, force add it anyway
                lines.push(word);
                currentLine = '';
            }
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

/**
 * Draw text with automatic wrapping
 */
function drawWrappedText(page, text, x, y, font, fontSize, textColor, maxWidth, lineHeight = fontSize * 1.2) {
    if (!text) return y;
    
    const lines = wrapText(text, font, fontSize, maxWidth);
    let currentY = y;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        page.drawText(line, {
            x: x,
            y: currentY,
            size: fontSize,
            font: font,
            color: textColor,
        });
        
        if (i < lines.length - 1) {
            currentY -= lineHeight; // Move to next line
        }
    }
    
    return currentY; // Return final Y position
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
            console.log('🔧 No form fields found, using text overlay approach with auto-wrapping');
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
            'jarak': spkData.jarak?.toString(), // Jarak (KM) - sama dengan kilometer
            'jarak_km': spkData.jarak?.toString(),
            'keluhan': spkData.keluhan,
            'service_description': spkData.service_description,
            'service': spkData.service_description,
            'jam_masuk': formatTime(spkData.jam_masuk),
            'jam_janji_selesai': formatTime(spkData.jam_janji_selesai),
            'tanggal_keluar': formatDateTime(spkData.tanggal_keluar),
            'estimated_cost': formatCurrency(spkData.estimated_cost),
            'estimasi_biaya': formatCurrency(spkData.estimated_cost)
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
 * Overlay text jika PDF tidak memiliki form fields dengan auto-wrapping
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
        const lineHeight = fontSize * 1.2;
        
        // Konfigurasi area text (sesuaikan dengan template)
        const leftColumnWidth = 180; // Width for left column text
        const rightColumnWidth = 150; // Width for right column text
        const fullWidth = width - 100; // Full width minus margins
        const marginRight = 50; // Right margin

        // Koordinat untuk masing-masing field dengan area width
        const textPositions = [
            { label: 'SPK Number', text: spkData.spk_number, x: 450, y: 760, maxWidth: rightColumnWidth },
            { label: 'Tanggal Masuk', text: formatDate(spkData.tanggal_masuk), x: 450, y: 740, maxWidth: rightColumnWidth },
            { label: 'Nama Customer', text: spkData.customer_name, x: 100, y: 657, maxWidth: leftColumnWidth },
            { label: 'Alamat', text: spkData.customer_address, x: 100, y: 630, maxWidth: leftColumnWidth },
            { label: 'No Telp', text: spkData.customer_phone, x: 100, y: 549, maxWidth: leftColumnWidth },
            { label: 'No Polisi', text: spkData.license_plate, x: 345, y: 657, maxWidth: rightColumnWidth },
            { label: 'Type/Model', text: `${spkData.brand} ${spkData.model}`, x: 345, y: 622, maxWidth: rightColumnWidth },
            { label: 'Tahun', text: spkData.year?.toString(), x: 345, y: 580, maxWidth: rightColumnWidth },
            { label: 'Kilometer', text: spkData.kilometer?.toString(), x: 345, y: 549, maxWidth: rightColumnWidth },
            { label: 'Jarak (KM)', text: spkData.jarak?.toString(), x: 131, y: 156, maxWidth: leftColumnWidth }, // Field jarak
            { label: 'Jam Masuk', text: formatTime(spkData.jam_masuk), x: 131, y: 170, maxWidth: rightColumnWidth }, // Jam masuk
            { label: 'Jam Janji Selesai', text: formatTime(spkData.jam_janji_selesai), x: 100, y: 490, maxWidth: leftColumnWidth }, // Jam janji selesai
            { label: 'Service', text: spkData.service_description, x: 40, y: 450, maxWidth: fullWidth - 200 }, // Adjusted Y position
            { label: 'Keluhan', text: spkData.keluhan, x: 260, y: 450, maxWidth: fullWidth - 120 }, // Adjusted Y position
            { label: 'Estimasi Biaya', text: formatCurrency(spkData.estimated_cost), x: 100, y: 105, maxWidth: leftColumnWidth }
        ];

        console.log('🔧 Adding text overlays with auto-wrapping:');
        
        // Tambahkan text ke PDF dengan auto-wrapping
        for (const position of textPositions) {
            if (position.text) {
                const originalWidth = getTextWidth(position.text, font, fontSize);
                const willWrap = originalWidth > position.maxWidth;
                
                if (willWrap) {
                    console.log(`  📝 ${position.label}: "${position.text}" (${originalWidth.toFixed(0)}px > ${position.maxWidth}px - WRAPPING)`);
                    const lines = wrapText(position.text, font, fontSize, position.maxWidth);
                    console.log(`     ↳ Wrapped into ${lines.length} lines: ${lines.map(l => `"${l}"`).join(', ')}`);
                } else {
                    console.log(`  ✅ ${position.label}: "${position.text}" (${originalWidth.toFixed(0)}px fits in ${position.maxWidth}px)`);
                }
                
                const finalY = drawWrappedText(
                    firstPage, 
                    position.text, 
                    position.x, 
                    position.y, 
                    font, 
                    fontSize, 
                    textColor, 
                    position.maxWidth,
                    lineHeight
                );
                
                console.log(`     ↳ Final Y position: ${finalY.toFixed(0)}`);
            } else {
                console.log(`  ⚠️  ${position.label}: no data`);
            }
        }
        
        console.log('✅ Text overlay with auto-wrapping completed');
        
    } catch (error) {
        console.error('❌ Error overlaying text on PDF:', error);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting PDF generation test with AUTO-WRAPPING feature...\n');
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
            console.log('📁 Created temp directory');
        }
        
        // Generate PDF
        const pdfBuffer = await generateSpkPdf(sampleSpkData);
        
        // Save to temp directory
        const outputPath = path.join(tempDir, `SPK-WRAPPED-${sampleSpkData.spk_number}-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`\n✅ PDF with auto-wrapping generated successfully!`);
        console.log(`📁 Output saved to: ${outputPath}`);
        console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        
        console.log('\n📋 Sample data used (with long text):');
        console.log('Customer Name:', sampleSpkData.customer_name);
        console.log('Address:', sampleSpkData.customer_address);
        console.log('Jam Masuk:', formatTime(sampleSpkData.jam_masuk));
        console.log('Jam Janji Selesai:', formatTime(sampleSpkData.jam_janji_selesai));
        console.log('Jarak (KM):', sampleSpkData.jarak);
        console.log('Keluhan:', sampleSpkData.keluhan);
        console.log('Service:', sampleSpkData.service_description);
        
        console.log('\n💡 Auto-wrapping features:');
        console.log('1. ✅ Automatic text width detection');
        console.log('2. ✅ Smart word wrapping (breaks at spaces)');
        console.log('3. ✅ Configurable column widths');
        console.log('4. ✅ Line height adjustment');
        console.log('5. ✅ Long text handling for keluhan & service');
        console.log('6. ✅ Console output shows wrapping info');
        
        console.log('\n🔧 To adjust wrapping:');
        console.log('- Edit maxWidth values in textPositions array');
        console.log('- Adjust fontSize for smaller/larger text');
        console.log('- Modify lineHeight for line spacing');
        console.log('- Check console output for text flow info');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
main();