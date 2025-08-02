<script>
  import { inertia } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'
  
  export let invoices = []
  export let pagination = {}
  export let search = ''
  export let status = ''
  export let success = null
  
  let searchInput = search
  let statusFilter = status
  let showSuccess = !!success
  
  function handleSearch() {
    const url = new URL(window.location)
    if (searchInput.trim()) {
      url.searchParams.set('search', searchInput.trim())
    } else {
      url.searchParams.delete('search')
    }
    if (statusFilter) {
      url.searchParams.set('status', statusFilter)
    } else {
      url.searchParams.delete('status')
    }
    url.searchParams.delete('page')
    window.location.href = url.toString()
  }
  
  function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
  
  // Auto hide success message
  if (showSuccess) {
    setTimeout(() => {
      showSuccess = false
    }, 5000)
  }
</script>

<svelte:head>
  <title>Invoice Otomatis - SST Bengkel</title>
</svelte:head>

<!-- SST Header -->
<div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Inter']">
  <SSTHeader showBackground={false} position="relative" />
</div>

<div class="min-h-screen bg-gray-50">
  <!-- Page Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Invoice Otomatis</h1>
          <p class="mt-1 text-sm text-gray-600">Kelola invoice dan pembayaran</p>
        </div>
        <a
          href="/invoices/create"
          use:inertia
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buat Invoice Baru
        </a>
      </div>
    </div>
  </div>

  <!-- Success Message -->
  {#if showSuccess}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" transition:fade>
      <div class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">{success}</p>
          </div>
          <div class="ml-auto pl-3">
            <button
              on:click={() => showSuccess = false}
              class="inline-flex text-green-400 hover:text-green-600"
              aria-label="Tutup pesan"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Filters and Search -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Cari Invoice</label>
          <input
            type="text"
            id="search"
            bind:value={searchInput}
            placeholder="Nomor invoice, SPK, atau nama pelanggan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            id="status"
            bind:value={statusFilter}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Terkirim</option>
            <option value="paid">Lunas</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            on:click={handleSearch}
            class="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Invoice List -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      {#if invoices.length > 0}
        <ul class="divide-y divide-gray-200">
          {#each invoices as invoice, i}
            <li transition:fly={{ y: 20, duration: 300, delay: i * 50 }}>
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="text-lg font-semibold text-orange-600 truncate">
                        {invoice.invoice_number}
                      </p>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(invoice.status)}">
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="flex items-center text-sm text-gray-500">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          SPK: {invoice.spk_number}
                        </p>
                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {invoice.license_plate}
                        </p>
                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {invoice.customer_name}
                        </p>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6"></path>
                        </svg>
                        {formatDate(invoice.invoice_date)}
                      </div>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                      <div class="text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                      {#if invoice.paid_date}
                        <div class="text-sm text-green-600">
                          Dibayar: {formatDate(invoice.paid_date)}
                        </div>
                      {/if}
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0 flex space-x-2">
                    <a
                      href="/invoices/{invoice.id}"
                      use:inertia
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Lihat
                    </a>
                    <a
                      href="/invoices/{invoice.id}/edit"
                      use:inertia
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada invoice</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat invoice pertama Anda.</p>
          <div class="mt-6">
            <a
              href="/invoices/create"
              use:inertia
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Invoice Baru
            </a>
          </div>
        </div>
      {/if}
    </div>

    <!-- Pagination -->
    {#if pagination.total_pages > 1}
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
        <div class="flex-1 flex justify-between sm:hidden">
          {#if pagination.current_page > 1}
            <a href="?page={pagination.current_page - 1}&search={search}&status={status}" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </a>
          {/if}
          {#if pagination.current_page < pagination.total_pages}
            <a href="?page={pagination.current_page + 1}&search={search}&status={status}" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </a>
          {/if}
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Menampilkan <span class="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span>
              sampai <span class="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total_items)}</span>
              dari <span class="font-medium">{pagination.total_items}</span> hasil
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {#if pagination.current_page > 1}
                <a href="?page={pagination.current_page - 1}&search={search}&status={status}" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              {/if}
              
              {#each Array(pagination.total_pages) as _, i}
                {#if i + 1 === pagination.current_page}
                  <span class="relative inline-flex items-center px-4 py-2 border border-orange-500 bg-orange-50 text-sm font-medium text-orange-600">
                    {i + 1}
                  </span>
                {:else}
                  <a href="?page={i + 1}&search={search}&status={status}" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {i + 1}
                  </a>
                {/if}
              {/each}
              
              {#if pagination.current_page < pagination.total_pages}
                <a href="?page={pagination.current_page + 1}&search={search}&status={status}" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              {/if}
            </nav>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
