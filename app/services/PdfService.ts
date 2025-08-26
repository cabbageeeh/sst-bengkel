import { PDFDocument, PDFForm, PDFTextField, rgb } from 'pdf-lib';
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
                'keluhan': spkData.keluhan,
                'service_description': spkData.service_description,
                'service': spkData.service_description,
                'jam_masuk': this.formatDateTime(spkData.tanggal_masuk),
                'jam_janji_selesai': this.formatDateTime(spkData.tanggal_keluar),
                'tanggal_keluar': this.formatDateTime(spkData.tanggal_keluar),
                'estimated_cost': this.formatCurrency(spkData.estimated_cost),
                'estimasi_biaya': this.formatCurrency(spkData.estimated_cost),
                'actual_cost': this.formatCurrency(spkData.actual_cost),
                'biaya_aktual': this.formatCurrency(spkData.actual_cost)
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
     * Overlay text jika PDF tidak memiliki form fields
     */
    private async overlayTextOnPdf(pdfDoc: PDFDocument, spkData: any): Promise<void> {
        try {
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();

            // Konfigurasi font dan ukuran
            const font = await pdfDoc.embedFont('Helvetica');
            const fontSize = 10;
            const textColor = rgb(0, 0, 0);

            // Koordinat untuk masing-masing field (sesuaikan dengan template PDF)
            // Ini contoh koordinat, perlu disesuaikan dengan template sesungguhnya
            const textPositions = [
                { text: spkData.spk_number, x: 450, y: 750 },
                { text: this.formatDate(spkData.tanggal_masuk), x: 400, y: height - 120 },
                { text: spkData.customer_name, x: 150, y: height - 160 },
                { text: spkData.customer_address, x: 150, y: height - 180 },
                { text: spkData.customer_phone, x: 150, y: height - 200 },
                { text: spkData.license_plate, x: 150, y: height - 240 },
                { text: `${spkData.brand} ${spkData.model}`, x: 150, y: height - 260 },
                { text: spkData.year?.toString(), x: 150, y: height - 280 },
                { text: spkData.kilometer?.toString(), x: 150, y: height - 300 },
                { text: spkData.keluhan, x: 150, y: height - 340 },
                { text: spkData.service_description, x: 150, y: height - 380 },
                { text: this.formatCurrency(spkData.estimated_cost), x: 150, y: height - 420 }
            ];

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
                }
            }
            
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
}

export default new PdfService();