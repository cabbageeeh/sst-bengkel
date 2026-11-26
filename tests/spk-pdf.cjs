// Run: node -r ts-node/register tests/spk-pdf.cjs
// All fixtures are synthetic; no workshop records are changed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PDFDocument } = require('pdf-lib');
const pdfService = require('../app/services/PdfService').default;

const directory = path.join(process.cwd(), 'tmp/pdfs/spk-regression');
fs.mkdirSync(directory, { recursive: true });
const base = {
  spk_number: 'SPK-TEST-0001', customer_name: 'Pelanggan Uji', customer_address: 'Jalan Pengujian Nomor 10',
  customer_phone: '081200000000', license_plate: 'B 1234 SST', brand: 'Suzuki', model: 'Ertiga', year: 2020,
  kilometer: 60000, jarak: 60000, tanggal_masuk: 1795654800000, jam_masuk: '08:15', jam_janji_selesai: '16:30',
  service_description: 'Servis berkala dan pemeriksaan kendaraan.', keluhan: 'Bunyi pada kaki-kaki depan.',
  notes: 'Hubungi pelanggan sebelum mengganti komponen.', status: 'in_progress', estimated_cost: 750000,
  service_items: [], sparepart_items: [], service_total: 0, sparepart_total: 0, actual_cost: null
};

const fixtures = {
  short: { ...base, notes: 'CATATAN-AKHIR-SINGKAT' },
  long: {
    ...base, spk_number: 'SPK-TEST-LONG',
    service_description: Array.from({length:150}, (_,i) => `SERVIS-${String(i+1).padStart(3,'0')}: Pemeriksaan mesin, oli, transmisi, rem, dan komponen kaki-kaki kendaraan.`).join('\n')+'\nAKHIR-DESKRIPSI-SERVIS',
    keluhan: 'KELUHAN-AWAL\n'+('Keluhan pelanggan harus tetap terbaca di halaman lanjutan.\n'.repeat(30))+'AKHIR-KELUHAN',
    notes: Array.from({length:90},(_,i)=>`CATATAN-${String(i+1).padStart(3,'0')}: Konfirmasikan pekerjaan tambahan kepada pelanggan.`).join('\n')+'\nAKHIR-CATATAN',
    service_items: [{item_name:'Jasa servis',description:'Uraian jasa dengan baris baru.\nBaris kedua.',quantity:1,unit_price:500000,total_price:500000}],
    sparepart_items: Array.from({length:55},(_,i)=>({item_name:`Sparepart ${i+1}`,description:`Nomor komponen PART-${i+1}. Keterangan pemasangan dan garansi komponen.`,quantity:2,unit_price:12500,total_price:25000})),
    service_total:500000, sparepart_total:1375000, actual_cost:1875000
  },
  longItem: {
    ...base, spk_number:'SPK-TEST-LONG-ITEM',
    service_items:[{item_name:'Jasa dengan penjelasan sangat panjang',description:('Kalimat panjang di dalam satu item jasa harus lanjut ke halaman baru.\n'.repeat(110))+'AKHIR-SATU-ITEM',quantity:1,unit_price:125000,total_price:125000}],service_total:125000,actual_cost:125000,
    sparepart_items:[{item_name:'SPAREPARTTERAKHIR',description:'AKHIR-SEMUA-ITEM',quantity:1,unit_price:0,total_price:0}],
    notes:'Nomor komponen tanpa spasi: '+('ABCDEFGH12345678'.repeat(70))+'\nAKHIR-TOKEN-PANJANG'
  },
  longIdentity: { ...base, spk_number:'SPK-TEST-IDENTITY',customer_name:'Pelanggan dengan nama panjang '.repeat(20),model:'Keterangan model panjang '.repeat(20),customer_address:'Alamat panjang yang harus diteruskan dengan utuh.\n'.repeat(90)+'AKHIR-ALAMAT',notes:'AKHIR-CATATAN-IDENTITAS' },
  zero: {...base,spk_number:'SPK-TEST-ZERO',estimated_cost:0,actual_cost:0,service_description:'Baris pertama\r\nBaris kedua\n\nBaris keempat: café & résumé — pemeriksaan.',notes:'AKHIR-NOL'}
};

(async () => {
  const results = {};
  for (const [name,data] of Object.entries(fixtures)) {
    const buffer = await pdfService.generateSpkPdf(data);
    const doc = await PDFDocument.load(buffer);
    assert.ok(doc.getPageCount() >= 1, name+' must contain a work order');
    for (const page of doc.getPages()) {
      assert.ok(Math.abs(page.getWidth()-595.28)<.1, name+' must be A4 width');
      assert.ok(Math.abs(page.getHeight()-841.89)<.1, name+' must be A4 height');
    }
    assert.equal(doc.getAuthor(),'SST Bengkel');
    assert.ok(!doc.getCreator()?.includes('Canva'), 'must not use the old fixed template');
    fs.writeFileSync(path.join(directory,name+'.pdf'),buffer);
    results[name]=doc.getPageCount();
  }
  assert.equal(results.short,1);
  assert.ok(results.long>results.short);
  assert.ok(results.longItem>results.short);
  fs.writeFileSync(path.join(directory,'fixtures.json'),JSON.stringify(fixtures,null,2));
  console.log('SPK pagination checks passed:',results);
})().catch(error=>{console.error(error);process.exitCode=1;});
