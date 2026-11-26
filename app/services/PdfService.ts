import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 36;
const WIDTH = A4[0] - MARGIN * 2;
const BOTTOM = A4[1] - 49;
const INK = rgb(.07, .15, .24);
const MUTED = rgb(.36, .41, .48);
const BORDER = rgb(.83, .86, .90);
const PALE = rgb(.96, .97, .98);
const RED = rgb(.84, .12, .18);

type Item = { item_name?: string; description?: string; quantity?: number; unit_price?: number; total_price?: number };
type Line = { text: string; bold?: boolean };

/** A fresh A4 document; every content block participates in pagination. */
class SpkPdfLayout {
    private page: PDFPage;
    private y = 0;
    private readonly characters: Set<number>;

    constructor(private doc: PDFDocument, private regular: PDFFont, private bold: PDFFont, private logo: PDFImage, private inspectionImage: PDFImage, private data: any) {
        this.characters = new Set(regular.getCharacterSet());
    }

    // Helvetica supports Indonesian/Latin text. Normalize typographic variants
    // and replace unsupported decorative characters rather than failing a print.
    private clean(value: unknown): string {
        return Array.from(String(value ?? '').normalize('NFKC').replace(/\r\n?/g, '\n').replace(/\t/g, '    '))
            .map(char => char === '\n' || this.characters.has(char.codePointAt(0)) ? char : '?').join('');
    }

    private text(value: unknown, x: number, top: number, size = 9.5, bold = false, color = INK) {
        const valueText = this.clean(value);
        const font = bold ? this.bold : this.regular;
        // Catch regressions before a PDF with clipped text is sent to a customer.
        const right = x + font.widthOfTextAtSize(valueText, size);
        if (x < MARGIN - .1 || right > A4[0] - MARGIN + .2 || top < 0 || top + size > A4[1] - 18) {
            throw new Error('SPK text is outside its printable bounds');
        }
        this.page.drawText(valueText, { x, y: A4[1] - top - size, size, font, color });
    }

    private rect(x: number, top: number, width: number, height: number, fill = rgb(1, 1, 1), border = BORDER) {
        this.page.drawRectangle({ x, y: A4[1] - top - height, width, height, color: fill, borderColor: border, borderWidth: .6 });
    }

    private line(x1: number, top1: number, x2: number, top2: number, color = BORDER, thickness = .6) {
        this.page.drawLine({ start: { x: x1, y: A4[1] - top1 }, end: { x: x2, y: A4[1] - top2 }, color, thickness });
    }

    private wrap(value: unknown, width: number, size = 9.5, bold = false): string[] {
        const font = bold ? this.bold : this.regular;
        const output: string[] = [];
        for (const paragraph of this.clean(value).split('\n')) {
            if (!paragraph.trim()) { output.push(''); continue; }
            let line = '';
            for (const word of paragraph.trim().split(/\s+/)) {
                const candidate = line ? `${line} ${word}` : word;
                if (font.widthOfTextAtSize(candidate, size) <= width) { line = candidate; continue; }
                if (line) { output.push(line); line = ''; }
                // Part numbers, URLs and unspaced descriptions must also wrap.
                let part = '';
                for (const char of word) {
                    if (part && font.widthOfTextAtSize(part + char, size) > width) { output.push(part); part = ''; }
                    part += char;
                }
                line = part;
            }
            if (line) output.push(line);
        }
        return output.length ? output : ['-'];
    }

    private right(value: unknown, right: number, top: number, size = 9.5, bold = false, color = INK) {
        const text = this.clean(value);
        this.text(text, right - (bold ? this.bold : this.regular).widthOfTextAtSize(text, size), top, size, bold, color);
    }

    private currency(value: unknown) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    }

    private date(value: unknown) { return value && dayjs(value as any).isValid() ? dayjs(value as any).format('DD/MM/YYYY') : '-'; }
    private time(value: unknown) {
        if (!value) return '-';
        if (/^\d{2}:\d{2}$/.test(String(value))) return String(value);
        return dayjs(value as any).isValid() ? dayjs(value as any).format('HH:mm') : '-';
    }

    private newPage(intake = false) {
        this.page = this.doc.addPage(A4);
        const logo = this.logo.scaleToFit(126, 65);
        this.page.drawImage(this.logo, { x: MARGIN, y: A4[1] - 30 - logo.height, ...logo });
        this.text('SURAT PERINTAH KERJA', 207, 33, 16, true);
        this.text(intake ? 'Lembar penerimaan & persetujuan' : 'Lembar kerja & pemeriksaan kendaraan', 207, 56, 9, false, MUTED);
        const number = this.wrap(this.data.spk_number || '-', WIDTH - 171, 10, true);
        number.forEach((line, i) => this.text(line, 207, 73 + i * 12, 10, true));
        const ruleY = Math.max(105, 89 + number.length * 12);
        this.line(MARGIN, ruleY, A4[0] - MARGIN, ruleY, RED, 1.7);
        this.y = ruleY + 16;
    }

    private ensure(height: number): boolean {
        if (this.y + height <= BOTTOM) return false;
        this.newPage();
        return true;
    }

    private heading(title: string) {
        this.ensure(47);
        this.rect(MARGIN, this.y, WIDTH, 25, PALE);
        this.rect(MARGIN, this.y, 3, 25, RED, RED);
        this.text(title, MARGIN + 12, this.y + 6, 10, true);
        this.y += 35;
    }

    private facts(rows: Array<[string, unknown, string, unknown]>) {
        const column = WIDTH / 2;
        for (const [leftLabel, leftValue, rightLabel, rightValue] of rows) {
            const left = this.wrap(leftValue === null || leftValue === undefined || leftValue === '' ? '-' : leftValue, column - 24);
            const right = this.wrap(rightValue === null || rightValue === undefined || rightValue === '' ? '-' : rightValue, column - 24);
            let offset = 0;
            while (offset < Math.max(left.length, right.length)) {
                if (BOTTOM - this.y < 55) this.newPage();
                const count = Math.min(Math.max(left.length, right.length) - offset, Math.floor((BOTTOM - this.y - 29) / 13));
                const height = 29 + count * 13;
                this.rect(MARGIN, this.y, WIDTH, height);
                this.line(MARGIN + column, this.y, MARGIN + column, this.y + height);
                this.text(leftLabel + (offset ? ' (lanjutan)' : ''), MARGIN + 11, this.y + 7, 8, false, MUTED);
                this.text(rightLabel + (offset ? ' (lanjutan)' : ''), MARGIN + column + 11, this.y + 7, 8, false, MUTED);
                for (let i = 0; i < count; i++) {
                    if (left[offset + i] !== undefined) this.text(left[offset + i], MARGIN + 11, this.y + 22 + i * 13);
                    if (right[offset + i] !== undefined) this.text(right[offset + i], MARGIN + column + 11, this.y + 22 + i * 13);
                }
                offset += count;
                this.y += height;
            }
        }
        this.y += 13;
    }

    private paragraph(title: string, value: unknown) {
        const lines = this.wrap(value === null || value === undefined || value === '' ? 'Belum ada keterangan.' : value, WIDTH - 24);
        let offset = 0;
        while (offset < lines.length) {
            if (BOTTOM - this.y < 68) this.newPage();
            const count = Math.min(lines.length - offset, Math.floor((BOTTOM - this.y - 34) / 13));
            const height = 34 + count * 13;
            this.rect(MARGIN, this.y, WIDTH, height);
            this.text(title + (offset ? ' (lanjutan)' : ''), MARGIN + 12, this.y + 9, 10, true);
            for (let i = 0; i < count; i++) this.text(lines[offset + i], MARGIN + 12, this.y + 27 + i * 13);
            this.y += height + 12;
            offset += count;
        }
    }

    private table(items: Item[], title: string) {
        if (!items.length) return;
        const edges = [MARGIN, MARGIN + 26, MARGIN + 269, MARGIN + 309, MARGIN + 412, MARGIN + WIDTH];
        const tableHeader = (continued = false) => {
            this.ensure(100);
            this.heading(title + (continued ? ' (lanjutan)' : ''));
            this.rect(MARGIN, this.y, WIDTH, 23, PALE);
            this.text('No.', edges[0] + 7, this.y + 6, 8, true);
            this.text('Uraian', edges[1] + 7, this.y + 6, 8, true);
            this.right('Qty', edges[3] - 8, this.y + 6, 8, true);
            this.right('Harga satuan', edges[4] - 8, this.y + 6, 8, true);
            this.right('Jumlah', edges[5] - 8, this.y + 6, 8, true);
            this.y += 23;
        };
        tableHeader();
        items.forEach((item, index) => {
            const lines: Line[] = this.wrap(item.item_name || 'Item servis', edges[2] - edges[1] - 16, 9, true).map(text => ({ text, bold: true }));
            if (item.description && item.description !== item.item_name) lines.push(...this.wrap(item.description, edges[2] - edges[1] - 16, 9).map(text => ({ text })));
            let offset = 0;
            while (offset < lines.length) {
                const minimum = 16 + Math.min(2, lines.length - offset) * 12;
                if (this.y + minimum > BOTTOM) { this.newPage(); tableHeader(true); }
                const count = Math.min(lines.length - offset, Math.floor((BOTTOM - this.y - 16) / 12));
                const height = count * 12 + 16;
                this.rect(MARGIN, this.y, WIDTH, height);
                if (offset === 0) {
                    this.text(String(index + 1), edges[0] + 7, this.y + 8, 8);
                    this.right(String(item.quantity ?? 1), edges[3] - 8, this.y + 8, 8);
                    this.right(this.currency(item.unit_price), edges[4] - 8, this.y + 8, 8);
                    this.right(this.currency(item.total_price), edges[5] - 8, this.y + 8, 8, true);
                }
                for (let i = 0; i < count; i++) this.text(lines[offset + i].text, edges[1] + 7, this.y + 8 + i * 12, 9, !!lines[offset + i].bold);
                this.y += height;
                offset += count;
            }
        });
        this.y += 14;
    }

    private totals() {
        this.ensure(143);
        this.heading('Ringkasan biaya');
        const rows: Array<[string, string]> = [
            ['Estimasi biaya servis', this.data.estimated_cost === null || this.data.estimated_cost === undefined ? 'Belum diisi' : this.currency(this.data.estimated_cost)],
            ['Total jasa servis', this.currency(this.data.service_total)],
            ['Total sparepart', this.currency(this.data.sparepart_total)],
            ['Total biaya', this.data.actual_cost === null || this.data.actual_cost === undefined ? 'Belum ditetapkan' : this.currency(this.data.actual_cost)]
        ];
        rows.forEach(([label, value], i) => {
            const strong = i === rows.length - 1;
            this.rect(MARGIN, this.y, WIDTH, 20, strong ? PALE : rgb(1, 1, 1));
            this.text(label, MARGIN + 12, this.y + 7, 9, strong);
            this.right(value, A4[0] - MARGIN - 12, this.y + 7, 9.5, strong);
            this.y += 20;
        });
        this.text('Perubahan estimasi:', MARGIN, this.y + 11, 9, false, MUTED);
        this.line(MARGIN + 102, this.y + 23, A4[0] - MARGIN, this.y + 23);
        this.y += 28;
    }

    private checkbox(label: string, x: number, top: number, size = 8.5) {
        this.rect(x, top + 1, 8, 8);
        this.text(label, x + 14, top, size);
    }

    /** Compact inspection form; keep together when long work notes need continuation sheets. */
    private intake() {
        this.ensure(390);
        let top=this.y;
        this.heading('Penerimaan & pemeriksaan kendaraan');
        top=this.y;
        this.rect(MARGIN,top,WIDTH,84);
        const rows: Array<[string,string[]]> = [
            ['Part bekas',['Ya, diserahkan','Tidak']],
            ['STNK',['Ditinggal di mobil','Dibawa pelanggan']],
            ['Barang titipan',['Ya: __________','Tidak']],
            ['Prioritas',['EM','Booking','Reguler']]
        ];
        rows.forEach(([label,values],i)=>{
            const y=top+7+i*18;
            this.text(label,MARGIN+8,y,8,true);
            values.forEach((value,j)=>this.checkbox(value,MARGIN+100+j*135,y,8));
        });
        this.y+=90;
        top=this.y;
        this.text('Pekerjaan',MARGIN+8,top,8,true);
        ['FS','PB','WR','OTH'].forEach((v,i)=>this.checkbox(v,MARGIN+100+i*64,top,8));
        this.text('Kendaraan',MARGIN+8,top+18,8,true);
        this.checkbox('Ditunggu',MARGIN+100,top+18,8);this.checkbox('Ditinggal',MARGIN+190,top+18,8);
        this.text('Cuci',MARGIN+300,top+18,8,true);
        this.checkbox('Ya',MARGIN+340,top+18,8);this.checkbox('Tidak',MARGIN+400,top+18,8);
        this.text(`Jam masuk: ${this.time(this.data.jam_masuk)}    Janji selesai: ${this.time(this.data.jam_janji_selesai)}`,MARGIN+8,top+36,8);
        this.y+=54;
        top=this.y;
        this.rect(MARGIN,top,WIDTH,137);
        this.text('Tandai kondisi pada gambar:',MARGIN+8,top+6,8.5,true);
        this.text('Segitiga = cacat    X = gores    O = penyok',MARGIN+8,top+21,7.5,false,MUTED);
        const image=this.inspectionImage.scaleToFit(235,99);
        this.page.drawImage(this.inspectionImage,{x:MARGIN+10+(235-image.width)/2,y:A4[1]-top-35-image.height,...image});
        this.line(MARGIN+255,top,MARGIN+255,top+137);
        this.text('Kelengkapan kendaraan',MARGIN+267,top+7,8.5,true);
        ['Headrest','Dashboard','Pemantik api','Karpet','Toolkit','Dongkrak','Kotak P3K','Ban serep'].forEach((v,i)=>this.checkbox(v,MARGIN+267+(i>=4?126:0),top+26+(i%4)*18,8));
        this.text('Bahan bakar    E',MARGIN+267,top+108,8);
        this.line(MARGIN+351,top+115,MARGIN+WIDTH-25,top+115,MUTED);
        for(let i=0;i<=4;i++){const x=MARGIN+351+i*(WIDTH-376)/4;this.line(x,top+111,x,top+119,MUTED);}
        this.text('F',MARGIN+WIDTH-14,top+108,8,true);
        this.y+=145;
        const consent=this.wrap('Pelanggan memberi izin kepada bengkel untuk mengerjakan pekerjaan yang tercantum pada SPK ini dan mencoba kendaraan di luar bengkel.',WIDTH,8);
        consent.forEach((v,i)=>this.text(v,MARGIN,this.y+i*10,8));
        this.y+=consent.length*10+23;
        this.line(MARGIN+10,this.y,MARGIN+220,this.y,MUTED);
        this.line(MARGIN+300,this.y,MARGIN+WIDTH-10,this.y,MUTED);
        this.text('Tanda tangan pelanggan',MARGIN+35,this.y+5,8);
        this.text('Tanda tangan service advisor',MARGIN+320,this.y+5,8);
    }

    async build() {
        this.newPage();
        const statuses={draft:'Draft',in_progress:'Dikerjakan',completed:'Selesai',cancelled:'Dibatalkan'};
        this.facts([
            ['Nama pelanggan',this.data.customer_name,'No. polisi',this.data.license_plate],
            ['No. telepon',this.data.customer_phone,'Tipe / model',[this.data.brand,this.data.model].filter(Boolean).join(' ')],
            ['Tanggal masuk',this.date(this.data.tanggal_masuk),'Tahun / kilometer',`${this.data.year ?? '-'} / ${this.data.kilometer ?? '-'} km`],
            ['Status SPK',statuses[this.data.status] || this.data.status || '-','Warna / mesin',[this.data.color,this.data.engine_type].filter(Boolean).join(' / ') || '-']
        ]);
        const workNotes = [
            ['Alamat pelanggan',this.data.customer_address],
            ['Deskripsi servis',this.data.service_description],
            ['Keluhan pelanggan',this.data.keluhan],
            ['Catatan tambahan',this.data.notes]
        ];
        for(const [label,value] of workNotes){
            const lines=this.wrap(value || '-',WIDTH-130,8.5);
            lines.forEach((line,i)=>{
                this.ensure(15);
                if(i===0)this.text(label,MARGIN+8,this.y,8.5,true);
                this.text(line,MARGIN+130,this.y,8.5);
                this.y+=12;
            });
            this.y+=5;
        }
        this.y+=5;
        this.intake();
        const pages=this.doc.getPages();
        pages.forEach((page,index)=>{
            this.page=page;
            this.line(MARGIN,A4[1]-37,A4[0]-MARGIN,A4[1]-37);
            const number=this.wrap(this.data.spk_number || 'SST Bengkel',WIDTH-135,7.5)[0];
            this.text(number,MARGIN,A4[1]-28,7.5,false,MUTED);
            this.right(`Halaman ${index+1} dari ${pages.length}`,A4[0]-MARGIN,A4[1]-28,7.5,false,MUTED);
        });
        return Buffer.from(await this.doc.save());
    }
}

class PdfService {
    public async generateSpkPdf(spkData: any): Promise<Buffer> {
        const doc=await PDFDocument.create();
        doc.setTitle(`Surat Perintah Kerja ${spkData.spk_number || ''}`);
        doc.setAuthor('SST Bengkel');
        doc.setSubject('Pekerjaan, penerimaan kendaraan, dan persetujuan pelanggan');
        const [regular,bold,logo,inspectionImage]=await Promise.all([
            doc.embedFont(StandardFonts.Helvetica),
            doc.embedFont(StandardFonts.HelveticaBold),
            doc.embedPng(fs.readFileSync(path.join(process.cwd(),'public/images/sst-bengkel-logo.png'))),
            doc.embedPng(fs.readFileSync(path.join(process.cwd(),'public/images/spk-inspeksi-mobil.png')))
        ]);
        return new SpkPdfLayout(doc,regular,bold,logo,inspectionImage,spkData).build();
    }
}

export default new PdfService();
