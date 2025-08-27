<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';

    export let invoice = {};
    export let invoiceItems = [];

    function formatCurrency(amount) {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    onMount(() => {
        // Auto-trigger print dialog when page loads
        window.print();
    });
</script>

<svelte:head>
    <title>Invoice {invoice?.invoice_number || ''} - PDF</title>
    <style>
        @media print {
            body { 
                margin: 0; 
                padding: 0;
                font-family: 'Arial', sans-serif;
            }
            .no-print { display: none !important; }
            
            /* Ukuran nota 89x89mm */
            @page {
                size: 89mm 120mm; /* Sedikit lebih tinggi untuk konten */
                margin: 2mm;
            }
            
            .receipt-container {
                width: 85mm;
                font-size: 8px;
                line-height: 1.2;
                color: #000;
            }
            
            .receipt-header {
                text-align: center;
                margin-bottom: 4mm;
                border-bottom: 1px dashed #000;
                padding-bottom: 2mm;
            }
            
            .shop-name {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 1mm;
            }
            
            .shop-info {
                font-size: 7px;
                line-height: 1.1;
            }
            
            .invoice-info {
                margin: 3mm 0;
                font-size: 8px;
            }
            
            .customer-info {
                margin: 3mm 0;
                font-size: 8px;
                border-bottom: 1px dashed #000;
                padding-bottom: 2mm;
            }
            
            .items-table {
                width: 100%;
                font-size: 7px;
                margin: 2mm 0;
            }
            
            .items-table td {
                padding: 0.5mm 0;
                vertical-align: top;
            }
            
            .item-name {
                font-weight: bold;
            }
            
            .totals {
                margin-top: 2mm;
                padding-top: 2mm;
                border-top: 1px dashed #000;
                font-size: 8px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 1mm 0;
            }
            
            .grand-total {
                font-weight: bold;
                font-size: 10px;
                border-top: 1px solid #000;
                padding-top: 1mm;
                margin-top: 2mm;
            }
            
            .footer {
                margin-top: 4mm;
                text-align: center;
                font-size: 7px;
                border-top: 1px dashed #000;
                padding-top: 2mm;
            }
        }
        
        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
                font-family: 'Arial', sans-serif;
            }
            
            .receipt-container {
                background: white;
                max-width: 89mm;
                margin: 0 auto;
                padding: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 1px solid #ddd;
            }
        }
    </style>
</svelte:head>

<!-- Tombol untuk screen view -->
<div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button on:click={() => window.print()} style="background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
        Print Invoice
    </button>
    <button on:click={() => window.close()} style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
        Tutup
    </button>
</div>

<!-- Invoice Content -->
<div class="receipt-container">
    <!-- Header -->
    <div class="receipt-header">
        <div class="shop-name">SST BENGKEL</div>
        <div class="shop-info">
            Jl. Contoh No. 123, Jakarta<br>
            Telp: (021) 1234-5678<br>
            WhatsApp: 0812-3456-7890
        </div>
    </div>

    <!-- Invoice Info -->
    <div class="invoice-info">
        <div style="display: flex; justify-content: space-between;">
            <span>No Invoice:</span>
            <span><strong>{invoice.invoice_number}</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>Tanggal:</span>
            <span>{formatDate(invoice.invoice_date)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>SPK:</span>
            <span>{invoice.spk_number}</span>
        </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
        <div><strong>Pelanggan:</strong></div>
        <div>{invoice.customer_name}</div>
        {#if invoice.customer_phone}
            <div>Telp: {invoice.customer_phone}</div>
        {/if}
        <div><strong>Kendaraan:</strong></div>
        <div>{invoice.license_plate} - {invoice.brand} {invoice.model}</div>
    </div>

    <!-- Service Description -->
    {#if invoice.service_description}
        <div style="margin: 3mm 0; font-size: 8px;">
            <div><strong>Layanan:</strong></div>
            <div>{invoice.service_description}</div>
        </div>
    {/if}

    <!-- Items (jika ada) -->
    {#if invoiceItems && invoiceItems.length > 0}
        <table class="items-table">
            <tbody>
                {#each invoiceItems as item}
                    <tr>
                        <td class="item-name">{item.description}</td>
                        <td style="text-align: right; width: 20mm;">{formatCurrency(item.amount)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}

    <!-- Totals -->
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        
        {#if invoice.tax_amount > 0}
            <div class="total-row">
                <span>Pajak:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
        {/if}
        
        {#if invoice.discount_amount > 0}
            <div class="total-row">
                <span>Diskon:</span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
            </div>
        {/if}
        
        <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
        </div>
    </div>

    <!-- Payment Status -->
    <div style="margin: 3mm 0; text-align: center; font-size: 8px;">
        <div style="background: #10b981; color: white; padding: 1mm; border-radius: 2px;">
            <strong>✓ LUNAS</strong>
        </div>
        {#if invoice.paid_date}
            <div style="margin-top: 1mm;">
                Dibayar: {formatDate(invoice.paid_date)}
            </div>
        {/if}
    </div>

    <!-- Notes -->
    {#if invoice.notes}
        <div style="margin: 3mm 0; font-size: 7px;">
            <div><strong>Catatan:</strong></div>
            <div>{invoice.notes}</div>
        </div>
    {/if}

    <!-- Footer -->
    <div class="footer">
        <div>Terima kasih atas kepercayaan Anda</div>
        <div>Garansi sesuai ketentuan bengkel</div>
        <div style="margin-top: 1mm;">
            Jam operasional: 08:00 - 17:00 WIB
        </div>
    </div>
</div>