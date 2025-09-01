import { PDFDocument, PDFForm, PDFTextField, rgb, PDFFont, PDFPage } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

class PdfService {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), 'resources/js/Components/spk.pdf');
    }

    /**
     * Generate SPK PDF dengan mengisi template yang sudah ada
     */
    public async generateSpkPdf(spkData: any): Promise<Buffer> {
        try {
            // Baca template PDF
            const existingPdfBytes = fs.readFileSync(this.templatePath);
            
            // Load PDF document
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            // Coba akses form fields dulu
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            
            if (fields.length > 0) {
                // Jika PDF memiliki form fields, isi menggunakan form
                await this.fillFormFields(form, spkData);
            } else {
                // Jika tidak ada form fields, overlay text di posisi yang ditentukan
                await this.overlayTextOnPdf(pdfDoc, spkData);
            }
            
            // Serialize PDF dan return sebagai buffer
            const pdfBytes = await pdfDoc.save();
            return Buffer.from(pdfBytes);
            
        } catch (error) {
            console.error('Error generating SPK PDF:', error);
            throw new Error('Gagal membuat PDF SPK');
        }
    }

    /**
     * Mengisi form fields jika PDF memiliki form
     */
    private async fillFormFields(form: PDFForm, spkData: any): Promise<void> {
        try {
            const fields = form.getFields();
            console.log('Available form fields:', fields.map(field => field.getName()));

            // Prepare service items text
            const serviceItemsText = spkData.service_items?.map((item: any) => 
                `${item.item_name}: ${this.formatCurrency(item.total_price)}`
            ).join('\n') || '';

            // Prepare sparepart items text
            const sparepartItemsText = spkData.sparepart_items?.map((item: any) => 
                `${item.item_name} (${item.quantity}x): ${this.formatCurrency(item.total_price)}`
            ).join('\n') || '';

            // Map data SPK ke form fields (sesuaikan dengan nama field di PDF)
            const fieldMappings = {
                'spk_number': spkData.spk_number,
                'nomor_surat': spkData.spk_number,
                'tanggal_surat': this.formatDate(spkData.tanggal_masuk),
                'tanggal_masuk': this.formatDate(spkData.tanggal_masuk),
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
                'jam_masuk': this.formatTime(spkData.jam_masuk),
                'jam_janji_selesai': this.formatTime(spkData.jam_janji_selesai),
                'tanggal_keluar': this.formatDateTime(spkData.tanggal_keluar),
                'estimated_cost': this.formatCurrency(spkData.estimated_cost),
                'estimasi_biaya': this.formatCurrency(spkData.estimated_cost),
                'actual_cost': this.formatCurrency(spkData.actual_cost),
                'biaya_aktual': this.formatCurrency(spkData.actual_cost),
                // New fields for service and sparepart breakdown
                'service_items': serviceItemsText,
                'biaya_service': serviceItemsText,
                'jasa_service': serviceItemsText,
                'service_total': this.formatCurrency(spkData.service_total || 0),
                'total_service': this.formatCurrency(spkData.service_total || 0),
                'sparepart_items': sparepartItemsText,
                'list_sparepart': sparepartItemsText,
                'sparepart_list': sparepartItemsText,
                'sparepart_total': this.formatCurrency(spkData.sparepart_total || 0),
                'total_sparepart': this.formatCurrency(spkData.sparepart_total || 0)
            };

            // Isi form fields yang tersedia
            for (const [fieldName, value] of Object.entries(fieldMappings)) {
                try {
                    const field = form.getTextField(fieldName);
                    if (field && value) {
                        field.setText(value.toString());
                    }
                } catch (error) {
                    // Field tidak ditemukan, lanjutkan ke field berikutnya
                    continue;
                }
            }

            // Flatten form agar tidak bisa di-edit lagi
            form.flatten();
            
        } catch (error) {
            console.error('Error filling form fields:', error);
            throw error;
        }
    }

    /**
     * Overlay text jika PDF tidak memiliki form fields dengan auto-wrapping
     */
    private async overlayTextOnPdf(pdfDoc: PDFDocument, spkData: any): Promise<void> {
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

            // Prepare service items text
            const serviceItemsText = spkData.service_items?.map((item: any) => 
                `${item.item_name}: ${this.formatCurrency(item.total_price)}`
            ).join('\n') || '';

            // Prepare sparepart items text
            const sparepartItemsText = spkData.sparepart_items?.map((item: any) => 
                `${item.item_name} (${item.quantity}x): ${this.formatCurrency(item.total_price)}`
            ).join('\n') || '';

            // Koordinat untuk masing-masing field dengan area width
            const textPositions = [
                { label: 'SPK Number', text: spkData.spk_number, x: 450, y: 760, maxWidth: rightColumnWidth },
                { label: 'Tanggal Masuk', text: this.formatDate(spkData.tanggal_masuk), x: 450, y: 740, maxWidth: rightColumnWidth },
                { label: 'Nama Customer', text: spkData.customer_name, x: 100, y: 657, maxWidth: leftColumnWidth },
                { label: 'Alamat', text: spkData.customer_address, x: 100, y: 630, maxWidth: leftColumnWidth },
                { label: 'No Telp', text: spkData.customer_phone, x: 100, y: 549, maxWidth: leftColumnWidth },
                { label: 'No Polisi', text: spkData.license_plate, x: 345, y: 657, maxWidth: rightColumnWidth },
                { label: 'Type/Model', text: `${spkData.brand} ${spkData.model}`, x: 345, y: 622, maxWidth: rightColumnWidth },
                { label: 'Tahun', text: spkData.year?.toString(), x: 345, y: 590, maxWidth: rightColumnWidth },
                { label: 'Kilometer', text: spkData.kilometer?.toString(), x: 345, y: 549, maxWidth: rightColumnWidth },
                { label: 'Jarak (KM)', text: spkData.jarak?.toString() || spkData.kilometer?.toString(), x: 131, y: 159, maxWidth: leftColumnWidth }, // Field jarak
                { label: 'Jam Masuk', text: this.formatTime(spkData.jam_masuk), x: 131, y: 190, maxWidth: rightColumnWidth }, // Jam masuk
                { label: 'Jam Janji Selesai', text: this.formatTime(spkData.jam_janji_selesai), x: 131, y: 174, maxWidth: leftColumnWidth }, // Jam janji selesai
                { label: 'Service', text: spkData.service_description, x: 40, y: 490, maxWidth: fullWidth - 200 }, // Adjusted Y position
                { label: 'Keluhan', text: spkData.keluhan, x: 260, y: 490, maxWidth: fullWidth - 120 }, // Adjusted Y position
                { label: 'Estimasi Biaya', text: this.formatCurrency(spkData.estimated_cost), x: 100, y: 105, maxWidth: leftColumnWidth },
                // New positions for service and sparepart breakdown
                { label: 'Biaya Service', text: serviceItemsText, x: 100, y: 350, maxWidth: leftColumnWidth },
                { label: 'Total Service', text: this.formatCurrency(spkData.service_total || 0), x: 100, y: 320, maxWidth: leftColumnWidth },
                { label: 'List Sparepart', text: sparepartItemsText, x: 100, y: 280, maxWidth: fullWidth - 100 },
                { label: 'Total Sparepart', text: this.formatCurrency(spkData.sparepart_total || 0), x: 100, y: 200, maxWidth: leftColumnWidth },
                { label: 'Total Keseluruhan', text: this.formatCurrency(spkData.actual_cost), x: 100, y: 170, maxWidth: leftColumnWidth }
            ];

            console.log('🔧 Adding text overlays with auto-wrapping:');
            
            // Tambahkan text ke PDF dengan auto-wrapping
            for (const position of textPositions) {
                if (position.text) {
                    const originalWidth = this.getTextWidth(position.text, font, fontSize);
                    const willWrap = originalWidth > position.maxWidth;
                    
                    if (willWrap) {
                        console.log(`  📝 ${position.label}: "${position.text}" (${originalWidth.toFixed(0)}px > ${position.maxWidth}px - WRAPPING)`);
                        const lines = this.wrapText(position.text, font, fontSize, position.maxWidth);
                        console.log(`     ↳ Wrapped into ${lines.length} lines: ${lines.map(l => `"${l}"`).join(', ')}`);
                    } else {
                        console.log(`  ✅ ${position.label}: "${position.text}" (${originalWidth.toFixed(0)}px fits in ${position.maxWidth}px)`);
                    }
                    
                    const finalY = this.drawWrappedText(
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
            console.error('Error overlaying text on PDF:', error);
            throw error;
        }
    }

    /**
     * Format tanggal untuk display
     */
    private formatDate(timestamp: number): string {
        if (!timestamp) return '';
        return dayjs(timestamp).format('DD/MM/YYYY');
    }

    /**
     * Format tanggal dan waktu untuk display
     */
    private formatDateTime(timestamp: number): string {
        if (!timestamp) return '';
        return dayjs(timestamp).format('DD/MM/YYYY HH:mm');
    }

    /**
     * Format currency untuk display
     */
    private formatCurrency(amount: number): string {
        if (!amount) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Format waktu saja untuk display (jam masuk dan jam janji selesai)
     */
    private formatTime(timestamp: number): string {
        if (!timestamp) return '';
        return dayjs(timestamp).format('HH:mm');
    }

    /**
     * Calculate text width for given font and size
     */
    private getTextWidth(text: string, font: PDFFont, fontSize: number): number {
        if (!text) return 0;
        // Approximate width calculation for Helvetica font
        // Different characters have different widths, this is a rough estimation
        const avgCharWidth = fontSize * 0.6; // Average character width ratio for Helvetica
        return text.length * avgCharWidth;
    }

    /**
     * Wrap text to fit within specified width
     */
    private wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
        if (!text) return [];
        
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = this.getTextWidth(testLine, font, fontSize);
            
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                    
                    // Check if single word is still too long
                    if (this.getTextWidth(currentLine, font, fontSize) > maxWidth) {
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
    private drawWrappedText(
        page: PDFPage, 
        text: string, 
        x: number, 
        y: number, 
        font: PDFFont, 
        fontSize: number, 
        textColor: any, 
        maxWidth: number, 
        lineHeight: number = fontSize * 1.2
    ): number {
        if (!text) return y;
        
        const lines = this.wrapText(text, font, fontSize, maxWidth);
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
}

export default new PdfService();