<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'

  export let invoice = {}

  let showDeleteModal = false

  function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  function formatCurrency(amount) {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }
  
  function getStatusBadge(status) {
    const badges = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }
  
  function getStatusText(status) {
    const texts = {
      'draft': 'Draft',
      'sent': 'Terkirim',
      'paid': 'Lunas',
      'cancelled': 'Dibatalkan'
    }
    return texts[status] || status
  }

  function handleDelete() {
    router.delete(`/invoices/${invoice.id}`, {
      onSuccess: () => {
        router.visit('/invoices', {
          data: { success: 'Invoice berhasil dihapus' }
        })
      },
      onError: () => {
        alert('Terjadi kesalahan saat menghapus invoice')
      }
    })
  }

  function handlePrint() {
    window.print()
  }
</script>

<svelte:head>
  <title>Invoice {invoice.invoice_number} - SST Bengkel</title>
</svelte:head>

<!-- SST Header -->
<div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Inter'] print:hidden">
  <SSTHeader showBackground={false} position="relative" />
</div>

<div class="min-h-screen bg-gray-50 print:bg-white">
  <!-- Page Header -->
  <div class="bg-white shadow print:shadow-none">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6 print:py-4">
        <div>
          <nav class="flex print:hidden" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <a href="/invoices" use:inertia class="text-gray-400 hover:text-gray-500">
                  Invoice Otomatis
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">{invoice.invoice_number}</span>
                </div>
              </li>
            </ol>
          </nav>
          <div class="mt-2 flex items-center space-x-4">
            <h1 class="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusBadge(invoice.status)}">
              {getStatusText(invoice.status)}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-600">Detail Invoice Pembayaran</p>
        </div>
        <div class="flex space-x-3 print:hidden">
          <button
            on:click={handlePrint}
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <a
            href="/invoices/{invoice.id}/edit"
            use:inertia
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Invoice
          </a>
          <button
            on:click={() => showDeleteModal = true}
            class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Invoice Content -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4">
    <!-- Invoice Header -->
    <div class="bg-white shadow sm:rounded-lg print:shadow-none print:rounded-none mb-8" transition:fly={{ y: 20, duration: 300 }}>
      <div class="px-6 py-8">
        <!-- Company Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">SST Bengkel</h2>
            <p class="text-sm text-gray-600 mt-1">Jl. Contoh No. 123, Jakarta</p>
            <p class="text-sm text-gray-600">Telp: (021) 1234-5678</p>
          </div>
          <div class="text-right">
            <h3 class="text-xl font-bold text-orange-600">INVOICE</h3>
            <p class="text-sm text-gray-600 mt-1">Tanggal: {formatDate(invoice.invoice_date)}</p>
            {#if invoice.due_date}
              <p class="text-sm text-gray-600">Jatuh Tempo: {formatDate(invoice.due_date)}</p>
            {/if}
          </div>
        </div>

        <!-- Customer & Invoice Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-2">Tagihan Kepada:</h4>
            <div class="text-sm text-gray-600">
              <p class="font-medium text-gray-900">{invoice.customer_name}</p>
              {#if invoice.customer_phone}
                <p>Telp: {invoice.customer_phone}</p>
              {/if}
              {#if invoice.customer_email}
                <p>Email: {invoice.customer_email}</p>
              {/if}
              {#if invoice.customer_address}
                <p class="mt-1">{invoice.customer_address}</p>
              {/if}
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-2">Detail Kendaraan:</h4>
            <div class="text-sm text-gray-600">
              <p><span class="font-medium">Plat Nomor:</span> {invoice.license_plate}</p>
              <p><span class="font-medium">Kendaraan:</span> {invoice.brand} {invoice.model}</p>
              <p><span class="font-medium">SPK:</span> {invoice.spk_number}</p>
            </div>
          </div>
        </div>

        <!-- Service Description -->
        <div class="mb-8">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Deskripsi Pekerjaan:</h4>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{invoice.service_description}</p>
          </div>
        </div>

        <!-- Invoice Calculation -->
        <div class="border-t border-gray-200 pt-6">
          <div class="flex justify-end">
            <div class="w-full max-w-md">
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">Subtotal</dt>
                  <dd class="text-sm text-gray-900">{formatCurrency(invoice.subtotal)}</dd>
                </div>
                {#if invoice.tax_amount > 0}
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-600">Pajak (PPN)</dt>
                    <dd class="text-sm text-gray-900">{formatCurrency(invoice.tax_amount)}</dd>
                  </div>
                {/if}
                {#if invoice.discount_amount > 0}
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-600">Diskon</dt>
                    <dd class="text-sm text-gray-900">-{formatCurrency(invoice.discount_amount)}</dd>
                  </div>
                {/if}
                <div class="flex justify-between pt-3 border-t border-gray-200">
                  <dt class="text-base font-medium text-gray-900">Total</dt>
                  <dd class="text-base font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Status Pembayaran:</h4>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusBadge(invoice.status)} mt-1">
                {getStatusText(invoice.status)}
              </span>
            </div>
            {#if invoice.paid_date}
              <div class="text-right">
                <p class="text-sm text-gray-600">Dibayar pada:</p>
                <p class="text-sm font-medium text-green-600">{formatDate(invoice.paid_date)}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Notes -->
        {#if invoice.notes}
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Catatan:</h4>
            <p class="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        {/if}

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200 text-center">
          <p class="text-xs text-gray-500">Terima kasih atas kepercayaan Anda menggunakan layanan SST Bengkel</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 print:hidden" transition:fade>
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mt-2">Hapus Invoice</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            Apakah Anda yakin ingin menghapus invoice <strong>{invoice.invoice_number}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="flex justify-center space-x-3 mt-4">
          <button
            on:click={() => showDeleteModal = false}
            class="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Batal
          </button>
          <button
            on:click={handleDelete}
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @media print {
    .print\:hidden {
      display: none !important;
    }
    .print\:bg-white {
      background-color: white !important;
    }
    .print\:shadow-none {
      box-shadow: none !important;
    }
    .print\:rounded-none {
      border-radius: 0 !important;
    }
    .print\:py-4 {
      padding-top: 1rem !important;
      padding-bottom: 1rem !important;
    }
  }
</style>
