<script>
    import { onMount } from 'svelte';
    import { printWhenReady } from '../../Components/printWhenReady.js';
    import BrandLogo from '../../Components/BrandLogo.svelte';

    export let invoice = {};
    export let invoiceItems = [];

    $: serviceTotal = invoiceItems.filter(item => item.type === 'service').reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
    $: partTotal = invoiceItems.filter(item => item.type === 'part').reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);

    function formatCurrency(amount) {
        const value = Number(amount) || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatDate(timestamp) {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    function getStatusText(status) {
        const labels = {
            draft: 'Draft',
            sent: 'Terkirim',
            paid: 'Lunas',
            cancelled: 'Dibatalkan'
        };
        return labels[status] || status || '-';
    }

    onMount(printWhenReady);
</script>

<svelte:head>
    <title>Invoice {invoice?.invoice_number || ''} - SST Bengkel</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 14mm;
        }

        html, body {
            color-scheme: light;
        }

        #app {
            background: #eef2f7 !important;
        }

        @media screen {
            body {
                margin: 0;
                padding: 24px;
                background: #eef2f7;
                font-family: Arial, Helvetica, sans-serif;
                color: #172033;
            }

            .invoice-paper {
                box-sizing: border-box;
                width: min(210mm, 100%);
                min-height: 297mm;
                margin: 0 auto;
                padding: 14mm;
                background: #fff;
                box-shadow: 0 8px 30px rgba(15, 23, 42, .12);
            }
        }

        @media print {
            html, body, #app {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                color: #111827;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 10pt;
                line-height: 1.45;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            #app {
                min-height: 0 !important;
            }

            .no-print { display: none !important; }

            .invoice-paper {
                width: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
        }

        .invoice-paper {
            color-scheme: light;
            color: #172033;
            background: #fff !important;
        }
        .toolbar { margin: 0 auto 18px; text-align: center; }
        .toolbar button {
            border: 0;
            border-radius: 6px;
            padding: 10px 18px;
            color: #fff;
            background: #15803d;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }
        .toolbar button + button { margin-left: 8px; background: #475569; }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 18px;
            border-bottom: 2px solid #1f2937;
        }
        .shop-name { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .shop-contact { margin-top: 5px; color: #4b5563; font-size: 9pt; line-height: 1.5; }
        .invoice-heading { text-align: right; }
        .invoice-heading h2 { margin: 0 0 5px; color: #c2410c; font-size: 23px; letter-spacing: .08em; }
        .invoice-heading strong { font-size: 12pt; }
        .invoice-heading p { margin: 3px 0 0; color: #4b5563; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 20px 0; }
        .info-card h3, .section-title { margin: 0 0 7px; font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: .035em; }
        .info-card p { margin: 2px 0; overflow-wrap: anywhere; }
        .section { margin: 20px 0; }
        .description {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 10px 12px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }
        table { width: 100%; border-collapse: collapse; }
        .items-table { table-layout: fixed; }
        .items-table thead { display: table-header-group; }
        .items-table th {
            padding: 8px 7px;
            border-top: 1px solid #475569;
            border-bottom: 1px solid #475569;
            background: #f1f5f9;
            text-align: left;
            font-size: 9pt;
        }
        .items-table td { padding: 8px 7px; border-bottom: 1px solid #dbe1e8; vertical-align: top; }
        .items-table .number { width: 7%; }
        .items-table .item-column { width: 43%; }
        .items-table .qty-column { width: 10%; text-align: center; }
        .items-table .price-column { width: 20%; text-align: right; }
        .items-table .amount-column { width: 20%; text-align: right; }
        .item-name { font-weight: 600; overflow-wrap: anywhere; }
        .item-description { margin-top: 3px; color: #4b5563; white-space: pre-wrap; overflow-wrap: anywhere; }
        .items-table tr { break-inside: avoid; page-break-inside: avoid; }
        .items-table tr.long-item { break-inside: auto; page-break-inside: auto; }
        .items-table td { overflow-wrap: anywhere; }
        .invoice-header > div, .info-card { min-width: 0; }
        .invoice-heading { overflow-wrap: anywhere; }
        .total-row > span:last-child { text-align: right; overflow-wrap: anywhere; }
        .totals-wrap { display: flex; justify-content: flex-end; margin-top: 16px; break-inside: avoid; page-break-inside: avoid; }
        .totals { width: min(100%, 330px); }
        .total-row { display: flex; justify-content: space-between; gap: 20px; padding: 5px 0; }
        .grand-total { margin-top: 4px; padding-top: 9px; border-top: 2px solid #1f2937; font-size: 13pt; font-weight: 700; }
        .payment-notes { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-top: 22px; padding-top: 14px; border-top: 1px solid #cbd5e1; }
        .payment-status { font-weight: 700; }
        .notes { max-width: 55%; white-space: pre-wrap; overflow-wrap: anywhere; }
        .notes h3 { margin: 0 0 5px; font-size: 10pt; }
        .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #cbd5e1; text-align: center; color: #4b5563; font-size: 9pt; }

        @media print {
            .invoice-header, .info-grid, .totals-wrap, .footer {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .section-title { break-after: avoid; page-break-after: avoid; }
            p { orphans: 3; widows: 3; }
        }
    </style>
</svelte:head>

<div class="toolbar no-print">
    <button on:click={() => window.print()}>Cetak A4</button>
    <button on:click={() => window.close()}>Tutup</button>
</div>

<main class="invoice-paper">
    <header class="invoice-header">
        <div>
            <BrandLogo width={180} />
            <div class="shop-contact">
                Specialist Suzuki Technology<br />
                Telp: 081235295993
            </div>
        </div>
        <div class="invoice-heading">
            <h2>INVOICE</h2>
            <strong>#{invoice.invoice_number || '-'}</strong>
            <p>Tanggal: {formatDate(invoice.invoice_date)}</p>
            {#if invoice.due_date}<p>Jatuh tempo: {formatDate(invoice.due_date)}</p>{/if}
            {#if invoice.spk_number}<p>SPK: {invoice.spk_number}</p>{/if}
        </div>
    </header>

    <section class="info-grid">
        <div class="info-card">
            <h3>Tagihan kepada</h3>
            <p><strong>{invoice.customer_name || '-'}</strong></p>
            {#if invoice.customer_phone}<p>Telp: {invoice.customer_phone}</p>{/if}
            {#if invoice.customer_address}<p>{invoice.customer_address}</p>{/if}
        </div>
        <div class="info-card">
            <h3>Detail kendaraan</h3>
            <p><strong>Plat nomor:</strong> {invoice.license_plate || '-'}</p>
            <p><strong>Kendaraan:</strong> {[invoice.brand, invoice.model].filter(Boolean).join(' ') || '-'}</p>
        </div>
    </section>

    {#if invoice.service_description}
        <section class="section">
            <h3 class="section-title">Deskripsi pekerjaan</h3>
            <div class="description">{invoice.service_description}</div>
        </section>
    {/if}

    {#if invoiceItems && invoiceItems.length > 0}
        <section class="section">
            <h3 class="section-title">Rincian jasa dan sparepart</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="number">No.</th>
                        <th class="item-column">Uraian</th>
                        <th class="qty-column">Qty</th>
                        <th class="price-column">Harga satuan</th>
                        <th class="amount-column">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {#each invoiceItems as item, index}
                        <tr class:long-item={(item.description || '').length > 1200 || (item.description || '').split('\n').length > 25}>
                            <td>{index + 1}</td>
                            <td>
                                <div class="item-name">{item.item_name || 'Item invoice'}</div>
                                {#if item.description && item.description !== item.item_name}
                                    <div class="item-description">{item.description}</div>
                                {/if}
                                <div class="item-description">{item.type === 'service' ? 'Jasa' : item.type === 'part' ? 'Sparepart' : item.type || ''}</div>
                            </td>
                            <td class="qty-column">{item.quantity || 0}</td>
                            <td class="price-column">{formatCurrency(item.unit_price)}</td>
                            <td class="amount-column">{formatCurrency(item.total_price)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}

    <section class="totals-wrap">
        <div class="totals">
            <div class="total-row"><span>Total jasa</span><span>{formatCurrency(serviceTotal)}</span></div>
            <div class="total-row"><span>Total sparepart</span><span>{formatCurrency(partTotal)}</span></div>
            <div class="total-row"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {#if Number(invoice.tax_amount) > 0}
                <div class="total-row"><span>Pajak</span><span>{formatCurrency(invoice.tax_amount)}</span></div>
            {/if}
            {#if Number(invoice.discount_amount) > 0}
                <div class="total-row"><span>Diskon</span><span>-{formatCurrency(invoice.discount_amount)}</span></div>
            {/if}
            <div class="total-row grand-total"><span>TOTAL</span><span>{formatCurrency(invoice.total_amount)}</span></div>
        </div>
    </section>

    <section class="payment-notes">
        <div>
            <div>Status pembayaran</div>
            <div class="payment-status">{getStatusText(invoice.status)}</div>
            {#if invoice.paid_date}<div>Dibayar pada: {formatDate(invoice.paid_date)}</div>{/if}
        </div>
        {#if invoice.notes}
            <div class="notes">
                <h3>Catatan</h3>
                <div>{invoice.notes}</div>
            </div>
        {/if}
    </section>

    <footer class="footer">Terima kasih atas kepercayaan Anda menggunakan layanan SST Bengkel.</footer>
</main>
