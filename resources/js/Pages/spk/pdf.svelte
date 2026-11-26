<script>
    import { onMount } from 'svelte';
    import { printWhenReady } from '../../Components/printWhenReady.js';
    import BrandLogo from '../../Components/BrandLogo.svelte';
    
    export let spk;
    export let spkItems = [];
    
    // Helper function to format date
    function formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    }
    
    // Helper function to format time
    function formatTime(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Helper function to format currency
    function formatCurrency(amount) {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    // Calculate total from SPK items
    let totalItems = 0;
    if (spkItems && spkItems.length > 0) {
        totalItems = spkItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }
    
    onMount(printWhenReady);
</script>

<svelte:head>
    <title>SPK {spk?.spk_number || ''} - PDF</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
    </style>
</svelte:head>

<div class="pdf-container">
    <!-- Print Controls -->
    <div class="no-print mb-4 p-4 bg-gray-100 rounded">
        <button on:click={() => window.print()} class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
            🖨️ Print PDF
        </button>
        <button on:click={() => window.close()} class="bg-gray-500 text-white px-4 py-2 rounded">
            ✕ Tutup
        </button>
    </div>

    <!-- PDF Content -->
    <div class="spk-pdf">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <BrandLogo width={180} />
                <p>Specialist Suzuki Technology</p>
                <p>Telp: 081235295993</p>
            </div>
            <div class="document-title">
                <h2>SURAT PERINTAH KERJA</h2>
                <p><strong>No: {spk?.spk_number || '-'}</strong></p>
            </div>
        </div>

        <!-- Customer & Vehicle Info -->
        <div class="info-section">
            <div class="customer-info">
                <h3>INFORMASI PELANGGAN</h3>
                <table>
                    <tbody>
                    <tr>
                        <td><strong>Nama:</strong></td>
                        <td>{spk?.customer_name || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Alamat:</strong></td>
                        <td>{spk?.customer_address || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>No. Telp:</strong></td>
                        <td>{spk?.customer_phone || '-'}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="vehicle-info">
                <h3>INFORMASI KENDARAAN</h3>
                <table>
                    <tbody>
                    <tr>
                        <td><strong>No. Polisi:</strong></td>
                        <td>{spk?.license_plate || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Type/Model:</strong></td>
                        <td>{spk?.brand || ''} {spk?.model || ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Tahun:</strong></td>
                        <td>{spk?.year || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Kilometer:</strong></td>
                        <td>{spk?.kilometer ? spk.kilometer.toLocaleString('id-ID') + ' km' : '-'}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Service Details -->
        <div class="service-section">
            <h3>DETAIL SERVIS</h3>
            <div class="service-details">
                <div class="detail-row">
                    <span><strong>Tanggal Masuk:</strong></span>
                    <span>{formatDate(spk?.tanggal_masuk)} - {formatTime(spk?.tanggal_masuk)}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Jam Janji Selesai:</strong></span>
                    <span>{formatDate(spk?.tanggal_keluar)} - {formatTime(spk?.tanggal_keluar)}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Keluhan:</strong></span>
                    <span>{spk?.keluhan || '-'}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Deskripsi Servis:</strong></span>
                    <span>{spk?.service_description || '-'}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Status:</strong></span>
                    <span class="status-{spk?.status}">{spk?.status || '-'}</span>
                </div>
            </div>
        </div>

        <!-- Service Items (if any) -->
        {#if spkItems && spkItems.length > 0}
        <div class="items-section">
            <h3>DETAIL ITEM SERVIS</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Item</th>
                        <th>Tipe</th>
                        <th>Qty</th>
                        <th>Harga Satuan</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {#each spkItems as item, index}
                    <tr>
                        <td>{index + 1}</td>
                        <td>{item.item_name || '-'}</td>
                        <td>{item.type || '-'}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{formatCurrency(item.unit_price)}</td>
                        <td>{formatCurrency(item.total_price)}</td>
                    </tr>
                    {/each}
                    <tr class="total-row">
                        <td colspan="5"><strong>TOTAL</strong></td>
                        <td><strong>{formatCurrency(totalItems)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        {/if}

        <!-- Cost Information -->
        <div class="cost-section">
            <h3>ESTIMASI BIAYA</h3>
            <div class="cost-details">
                <div class="cost-row">
                    <span><strong>Estimasi Biaya Servis:</strong></span>
                    <span>{formatCurrency(spk?.estimated_cost)}</span>
                </div>
                {#if spk?.actual_cost}
                <div class="cost-row">
                    <span><strong>Biaya Aktual:</strong></span>
                    <span>{formatCurrency(spk?.actual_cost)}</span>
                </div>
                {/if}
            </div>
        </div>

        <!-- Notes -->
        {#if spk?.notes}
        <div class="notes-section">
            <h3>CATATAN</h3>
            <p>{spk.notes}</p>
        </div>
        {/if}

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <p><strong>Tanda Tangan Pelanggan</strong></p>
                <div class="signature-space"></div>
                <p>({spk?.customer_name || '_______________'})</p>
            </div>
            
            <div class="signature-box">
                <p><strong>Tanda Tangan Teknisi</strong></p>
                <div class="signature-space"></div>
                <p>(_______________)</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dicetak pada: {formatDate(Date.now())} - {formatTime(Date.now())}</p>
            <p>Terima kasih atas kepercayaan Anda kepada SST Dani Motor</p>
        </div>
    </div>
</div>

<style>
    .pdf-container {
        max-width: 21cm;
        margin: 0 auto;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
    }

    .spk-pdf {
        padding: 20px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
        margin-bottom: 20px;
    }

    .company-info p {
        margin: 2px 0;
        color: #666;
    }

    .document-title {
        text-align: right;
    }

    .document-title h2 {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
        color: #333;
    }

    .info-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .customer-info, .vehicle-info {
        border: 1px solid #ddd;
        padding: 15px;
        border-radius: 5px;
    }

    .customer-info h3, .vehicle-info h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }

    .customer-info table, .vehicle-info table {
        width: 100%;
        border-collapse: collapse;
    }

    .customer-info tbody td, .vehicle-info tbody td {
        padding: 3px 5px;
        vertical-align: top;
    }

    .customer-info tbody td:first-child, .vehicle-info tbody td:first-child {
        width: 35%;
    }

    .service-section, .items-section, .cost-section, .notes-section {
        margin-bottom: 20px;
        border: 1px solid #ddd;
        padding: 15px;
        border-radius: 5px;
    }

    .service-section h3, .items-section h3, .cost-section h3, .notes-section h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }

    .detail-row, .cost-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px dotted #ddd;
    }

    .detail-row:last-child, .cost-row:last-child {
        border-bottom: none;
    }

    .status-draft { color: #f59e0b; }
    .status-in_progress { color: #3b82f6; }
    .status-completed { color: #10b981; }
    .status-cancelled { color: #ef4444; }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }

    .items-table th, .items-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .items-table th {
        background-color: #f5f5f5;
        font-weight: bold;
    }

    .items-table .total-row {
        background-color: #f9f9f9;
        font-weight: bold;
    }

    .signature-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin: 30px 0;
    }

    .signature-box {
        text-align: center;
    }

    .signature-space {
        height: 60px;
        border-bottom: 1px solid #333;
        margin: 20px 0;
    }

    .footer {
        text-align: center;
        border-top: 1px solid #ddd;
        padding-top: 15px;
        margin-top: 30px;
        color: #666;
        font-size: 11px;
    }

    @media print {
        .pdf-container {
            max-width: none;
            margin: 0;
        }
        
        .spk-pdf {
            padding: 15px;
        }
        
        @page {
            margin: 1cm;
            size: A4;
        }
    }
</style>
