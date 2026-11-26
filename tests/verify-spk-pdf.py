"""Optional visual-layout regression check. Requires pypdf and pdfplumber.

First run: node -r ts-node/register tests/spk-pdf.cjs
Then run: python tests/verify-spk-pdf.py
"""
import json
import re
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

directory = Path('tmp/pdfs/spk-regression')
fixtures = json.loads((directory / 'fixtures.json').read_text(encoding='utf-8'))
normalize = lambda value: re.sub(r'\s+', '', unicodedata.normalize('NFKC', str(value)))
required = ['Part bekas', 'STNK', 'Barang titipan', 'Prioritas',
            'Pekerjaan', 'Cuci', 'Jam masuk', 'Janji selesai',
            'Penerimaan & pemeriksaan kendaraan', 'Headrest', 'Dashboard', 'Pemantik api', 'Karpet',
            'Toolkit', 'Dongkrak', 'Kotak P3K', 'Ban serep', 'Bahan bakar',
            'Tanda tangan pelanggan', 'Tanda tangan service advisor']

for name, fixture in fixtures.items():
    filename = directory / f'{name}.pdf'
    reader = PdfReader(filename)
    page_texts = [page.extract_text() or '' for page in reader.pages]
    text = normalize('\n'.join(page_texts))
    # Repeated page furniture is inserted between chunks of a long paragraph.
    # Exclude it before checking that every paragraph survives pagination.
    furniture = {'SURAT PERINTAH KERJA', 'Lembar kerja & pemeriksaan kendaraan',
                 'Lembar penerimaan & persetujuan', fixture['spk_number'],
                 'No.', 'Uraian', 'Qty', 'Harga satuan', 'Jumlah'}
    content_lines = []
    for content in page_texts:
        for line in content.splitlines():
            if line in furniture or re.fullmatch(r'Halaman \d+ dari \d+', line):
                continue
            if line.endswith(' (lanjutan)') or line == 'No. Uraian Qty Harga satuan Jumlah':
                continue
            content_lines.append(line)
    continuous_text = normalize('\n'.join(content_lines))
    for field in ['customer_name', 'customer_address', 'service_description', 'keluhan', 'notes']:
        if field == 'customer_name' and name == 'longIdentity':
            for word in fixture[field].split():
                assert continuous_text.count(word) >= fixture[field].split().count(word)
        else:
            assert normalize(fixture[field]) in continuous_text, f'{name}: missing or truncated {field}'
    for label in required:
        assert normalize(label) in normalize(page_texts[-1]), f'{name}: last sheet missing {label}'
    for label in ['Harga satuan', 'Ringkasan biaya', 'Total biaya', 'Estimasi biaya servis']:
        assert normalize(label) not in text, f'{name}: financial detail must stay in invoice'
    for index, content in enumerate(page_texts):
        assert f'Halaman {index+1} dari {len(page_texts)}' in content, f'{name}: page footer'
    with pdfplumber.open(filename) as pdf:
        for number, page in enumerate(pdf.pages, 1):
            for word in page.extract_words():
                assert word['x0'] >= 35.5, (name, number, 'left overflow', word)
                assert word['x1'] <= 559.8, (name, number, 'right overflow', word)
                assert 20 <= word['top'] < word['bottom'] <= 824, (name, number, 'vertical overflow', word)
    print(f'{name}: {len(page_texts)} A4 pages; all text, fields and page bounds verified')
