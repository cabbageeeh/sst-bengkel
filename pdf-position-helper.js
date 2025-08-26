const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

/**
 * Script helper untuk menyesuaikan posisi field di PDF
 * Jalankan script ini setelah melihat PDF hasil test untuk menyesuaikan koordinat
 */

// SESUAIKAN KOORDINAT INI BERDASARKAN TEMPLATE PDF ANDA
const FIELD_POSITIONS = {
    // Format: { label: 'Label', x: koordinat_x, y: koordinat_y }
    
    // Header Section
    spk_number: { label: 'No SPK', x: 150, y: 722 },
    tanggal_masuk: { label: 'Tanggal Masuk', x: 400, y: 722 },
    
    // Customer Information
    customer_name: { label: 'Nama', x: 150, y: 682 },
    customer_address: { label: 'Alamat', x: 150, y: 662 },
    customer_phone: { label: 'No Telp', x: 150, y: 642 },
    
    // Vehicle Information  
    license_plate: { label: 'No Polisi', x: 150, y: 602 },
    vehicle_type: { label: 'Type/Model', x: 150, y: 582 },
    vehicle_year: { label: 'Tahun', x: 150, y: 562 },
    kilometer: { label: 'Kilometer', x: 150, y: 542 },
    
    // Service Information
    keluhan: { label: 'Keluhan', x: 150, y: 502 },
    service_description: { label: 'Jenis Service', x: 150, y: 462 },
    
    // DateTime Information
    jam_masuk: { label: 'Jam Masuk', x: 150, y: 422 },
    jam_keluar: { label: 'Jam Keluar', x: 400, y: 422 },
    
    // Cost Information
    estimated_cost: { label: 'Estimasi Biaya', x: 150, y: 382 },
    actual_cost: { label: 'Biaya Aktual', x: 400, y: 382 },
    
    // Signature Areas (jika diperlukan)
    signature_customer: { label: 'TTD Customer', x: 150, y: 150 },
    signature_mechanic: { label: 'TTD Mekanik', x: 400, y: 150 }
};

/**
 * Generate preview PDF dengan grid koordinat untuk membantu positioning
 */
async function generateCoordinateGrid() {
    try {
        const templatePath = path.join(__dirname, 'resources/js/Components/spk.pdf');
        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        const font = await pdfDoc.embedFont('Helvetica');
        
        // Draw coordinate grid
        console.log('📐 Menambahkan grid koordinat ke PDF...');
        
        // Vertical lines every 50 units
        for (let x = 0; x <= width; x += 50) {
            firstPage.drawLine({
                start: { x, y: 0 },
                end: { x, y: height },
                thickness: 0.5,
                color: rgb(0.8, 0.8, 0.8),
            });
            
            // Add X coordinate labels
            if (x % 100 === 0) {
                firstPage.drawText(x.toString(), {
                    x: x + 2,
                    y: height - 20,
                    size: 8,
                    font,
                    color: rgb(0.6, 0.6, 0.6),
                });
            }
        }
        
        // Horizontal lines every 50 units
        for (let y = 0; y <= height; y += 50) {
            firstPage.drawLine({
                start: { x: 0, y },
                end: { x: width, y },
                thickness: 0.5,
                color: rgb(0.8, 0.8, 0.8),
            });
            
            // Add Y coordinate labels
            if (y % 100 === 0) {
                firstPage.drawText(y.toString(), {
                    x: 5,
                    y: y + 2,
                    size: 8,
                    font,
                    color: rgb(0.6, 0.6, 0.6),
                });
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(__dirname, 'temp', 'spk-coordinate-grid.pdf');
        fs.writeFileSync(outputPath, pdfBytes);
        
        console.log(`✅ Grid koordinat tersimpan di: ${outputPath}`);
        console.log('💡 Gunakan PDF ini untuk menentukan koordinat yang tepat');
        
    } catch (error) {
        console.error('❌ Error generating coordinate grid:', error);
    }
}

/**
 * Generate PDF dengan posisi field yang sudah disesuaikan
 */
async function generateWithCustomPositions() {
    try {
        console.log('🎯 Generating PDF dengan posisi field yang sudah disesuaikan...');
        
        const templatePath = path.join(__dirname, 'resources/js/Components/spk.pdf');
        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont('Helvetica');
        
        // Sample data
        const sampleData = {
            spk_number: 'SPK-202412-0001',
            tanggal_masuk: '27/08/2025',
            customer_name: 'John Doe',
            customer_address: 'Jl. Contoh No. 123, Jakarta Selatan',
            customer_phone: '081234567890',
            license_plate: 'B 1234 ABC',
            vehicle_type: 'Toyota Avanza',
            vehicle_year: '2020',
            kilometer: '45000',
            keluhan: 'Mesin bersuara kasar dan oli bocor',
            service_description: 'Ganti oli mesin, tune up, dan perbaikan kebocoran oli',
            jam_masuk: '27/08/2025 08:00',
            jam_keluar: '28/08/2025 17:00',
            estimated_cost: 'Rp 750.000',
            actual_cost: 'Rp 720.000'
        };
        
        // Add text at specified positions
        Object.entries(FIELD_POSITIONS).forEach(([field, position]) => {
            const value = sampleData[field];
            if (value) {
                firstPage.drawText(value, {
                    x: position.x,
                    y: position.y,
                    size: 10,
                    font,
                    color: rgb(0, 0, 0),
                });
                
                console.log(`  ✅ ${position.label}: "${value}" at (${position.x}, ${position.y})`);
            }
        });
        
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(__dirname, 'temp', 'spk-positioned-fields.pdf');
        fs.writeFileSync(outputPath, pdfBytes);
        
        console.log(`✅ PDF dengan posisi field tersimpan di: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error generating positioned PDF:', error);
    }
}

/**
 * Export koordinat untuk digunakan di PdfService
 */
function exportCoordinatesForPdfService() {
    console.log('\n📋 Copy kode ini ke PdfService.ts untuk mengupdate koordinat:\n');
    
    console.log('const textPositions = [');
    Object.entries(FIELD_POSITIONS).forEach(([field, position]) => {
        const dataMapping = {
            spk_number: 'spkData.spk_number',
            tanggal_masuk: 'this.formatDate(spkData.tanggal_masuk)',
            customer_name: 'spkData.customer_name',
            customer_address: 'spkData.customer_address',
            customer_phone: 'spkData.customer_phone',
            license_plate: 'spkData.license_plate',
            vehicle_type: '`${spkData.brand} ${spkData.model}`',
            vehicle_year: 'spkData.year?.toString()',
            kilometer: 'spkData.kilometer?.toString()',
            keluhan: 'spkData.keluhan',
            service_description: 'spkData.service_description',
            jam_masuk: 'this.formatDateTime(spkData.tanggal_masuk)',
            jam_keluar: 'this.formatDateTime(spkData.tanggal_keluar)',
            estimated_cost: 'this.formatCurrency(spkData.estimated_cost)',
            actual_cost: 'this.formatCurrency(spkData.actual_cost)'
        };
        
        const dataSource = dataMapping[field] || `spkData.${field}`;
        console.log(`    { text: ${dataSource}, x: ${position.x}, y: height - ${842.25 - position.y} }, // ${position.label}`);
    });
    console.log('];');
}

// Main execution
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'grid':
            await generateCoordinateGrid();
            break;
        case 'test':
            await generateWithCustomPositions();
            break;
        case 'export':
            exportCoordinatesForPdfService();
            break;
        default:
            console.log('🔧 PDF Position Helper');
            console.log('');
            console.log('Commands:');
            console.log('  node pdf-position-helper.js grid   - Generate coordinate grid');
            console.log('  node pdf-position-helper.js test   - Test with current positions');
            console.log('  node pdf-position-helper.js export - Export code for PdfService');
            console.log('');
            console.log('📝 Edit FIELD_POSITIONS dalam script ini untuk menyesuaikan koordinat');
            break;
    }
}

main();