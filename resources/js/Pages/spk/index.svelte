<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'
  import { Toast } from '../../Components/helper.js'

  export let spks = []
  export let pagination = {}
  export let search = ''
  export let status = ''
  export let success = null

  let searchInput = search
  let statusFilter = status
  let showSuccess = !!success
  
  // Modal state for completing SPK
  let showCompleteModal = false
  let selectedSPK = null
  let serviceCost = ''
  let serviceCostDisplay = ''
  let sparepartItems = []
  let isSubmitting = false

  function handleSearch() {
    const params = {}
    if (searchInput.trim()) {
      params.search = searchInput.trim()
    }
    if (statusFilter) {
      params.status = statusFilter
    }

    router.get('/spk', params, {
      preserveState: true,
      preserveScroll: true
    })
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
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }
  
  function getStatusText(status) {
    const texts = {
      'draft': 'Draft',
      'in_progress': 'Sedang Dikerjakan',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    }
    return texts[status] || status
  }
  
  function formatNumberInput(value) {
    // Remove all non-digits
    const numbersOnly = value.replace(/\D/g, '')
    
    // Format with thousand separators
    if (numbersOnly === '') return ''
    
    return new Intl.NumberFormat('id-ID').format(parseInt(numbersOnly))
  }
  
  function parseNumberInput(value) {
    // Remove all non-digits and return as string
    return value.replace(/\D/g, '')
  }
  
  function handleServiceCostInput(event) {
    const value = event.target.value
    serviceCost = parseNumberInput(value)
    serviceCostDisplay = formatNumberInput(value)
  }

  function addSparepartItem() {
    sparepartItems = [...sparepartItems, {
      item_name: '',
      quantity: 1,
      unit_price: '',
      unit_price_display: '',
      total_price: 0
    }]
  }

  function removeSparepartItem(index) {
    sparepartItems = sparepartItems.filter((_, i) => i !== index)
  }

  function handleSparepartInput(index, field, event) {
    const value = event.target.value
    const updatedItems = [...sparepartItems]
    
    if (field === 'unit_price') {
      updatedItems[index].unit_price = parseNumberInput(value)
      updatedItems[index].unit_price_display = formatNumberInput(value)
    } else if (field === 'quantity') {
      updatedItems[index].quantity = parseInt(value) || 1
    } else {
      updatedItems[index][field] = value
    }
    
    // Calculate total price
    const quantity = updatedItems[index].quantity || 1
    const unitPrice = parseFloat(updatedItems[index].unit_price) || 0
    updatedItems[index].total_price = quantity * unitPrice
    
    sparepartItems = updatedItems
  }

  function calculateTotalCost() {
    const serviceTotal = parseFloat(serviceCost) || 0
    const sparepartTotal = sparepartItems.reduce((total, item) => {
      return total + (item.total_price || 0)
    }, 0)
    return serviceTotal + sparepartTotal
  }
  
  async function deleteSPK(spk) {
    let confirmMessage = `Apakah Anda yakin ingin menghapus SPK "${spk.spk_number}"?`;
    
    // Note: We could add invoice count check here in the future
    // For now, we'll show a general warning about related data
    confirmMessage += '\n\nPeringatan: Semua data SPK items dan invoice yang terkait akan ikut terhapus secara permanen.';
    
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/spk/${spk.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (response.ok) {
          // Show success toast
          Toast(data.message || 'SPK berhasil dihapus', 'success')
          
          // Refresh the page to update the list
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          // Show error toast
          Toast(data.error || 'Terjadi kesalahan saat menghapus SPK', 'error')
        }
      } catch (error) {
        console.error('Error deleting SPK:', error)
        Toast('Terjadi kesalahan jaringan', 'error')
      }
    }
  }
  
  function openCompleteModal(spk) {
    selectedSPK = spk
    // Initialize with estimated cost as service cost if available
    if (spk.estimated_cost) {
      serviceCost = spk.estimated_cost.toString()
      serviceCostDisplay = formatNumberInput(serviceCost)
    } else {
      serviceCost = ''
      serviceCostDisplay = ''
    }
    // Initialize with one empty sparepart item
    sparepartItems = [{
      item_name: '',
      quantity: 1,
      unit_price: '',
      unit_price_display: '',
      total_price: 0
    }]
    showCompleteModal = true
  }
  
  function closeCompleteModal() {
    showCompleteModal = false
    selectedSPK = null
    serviceCost = ''
    serviceCostDisplay = ''
    sparepartItems = []
    isSubmitting = false
  }
  
  async function completeSPK() {
    // Validate service cost
    if (!selectedSPK || !serviceCost.trim()) {
      Toast('Biaya service harus diisi', 'error')
      return
    }
    
    if (isNaN(parseFloat(serviceCost))) {
      Toast('Biaya service harus berupa angka yang valid', 'error')
      return
    }

    // Validate sparepart items
    const validSparepartItems = sparepartItems.filter(item => item.item_name.trim())
    
    for (const item of validSparepartItems) {
      if (!item.item_name.trim()) {
        Toast('Nama sparepart harus diisi', 'error')
        return
      }
      if (!item.quantity || item.quantity <= 0) {
        Toast('Quantity sparepart harus lebih dari 0', 'error')
        return
      }
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        Toast('Harga satuan sparepart harus lebih dari 0', 'error')
        return
      }
    }
    
    isSubmitting = true
    
    try {
      const response = await fetch(`/spk/${selectedSPK.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          service_cost: parseFloat(serviceCost),
          sparepart_items: validSparepartItems.map(item => ({
            item_name: item.item_name.trim(),
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            description: item.description || ''
          }))
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        Toast(data.message || 'SPK berhasil diselesaikan', 'success')
        closeCompleteModal()
        
        // Refresh the page to update the list
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        Toast(data.error || 'Terjadi kesalahan saat menyelesaikan SPK', 'error')
      }
    } catch (error) {
      console.error('Error completing SPK:', error)
      Toast('Terjadi kesalahan jaringan', 'error')
    } finally {
      isSubmitting = false
    }
  }
  
  // Auto hide success message
  if (showSuccess) {
    setTimeout(() => {
      showSuccess = false
    }, 5000)
  }
</script>

<svelte:head>
  <title>SPK Digital - SST Bengkel</title>
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
          <h1 class="text-3xl font-bold text-gray-900">SPK Digital</h1>
          <p class="mt-1 text-sm text-gray-600">Kelola Surat Perintah Kerja digital</p>
        </div>
        <a
          href="/spk/create"
          use:inertia
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buat SPK Baru
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
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Cari SPK</label>
          <input
            type="text"
            id="search"
            bind:value={searchInput}
            placeholder="Nomor SPK, plat nomor, atau nama pelanggan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            id="status"
            bind:value={statusFilter}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            on:click={handleSearch}
            class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- SPK List -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      {#if spks.length > 0}
        <ul class="divide-y divide-gray-200">
          {#each spks as spk, i}
            <li transition:fly={{ y: 20, duration: 300, delay: i * 50 }}>
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="text-lg font-semibold text-purple-600 truncate">
                        {spk.spk_number}
                      </p>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(spk.status)}">
                        {getStatusText(spk.status)}
                      </span>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="flex items-center text-sm text-gray-500">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {spk.license_plate} - {spk.brand} {spk.model}
                        </p>
                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {spk.customer_name}
                        </p>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        {formatCurrency(spk.estimated_cost)}
                      </div>
                    </div>
                    <div class="mt-2">
                      <p class="text-sm text-gray-600 line-clamp-2">
                        {spk.service_description}
                      </p>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0 flex space-x-2">
                    <a
                      href="/spk/{spk.id}"
                      use:inertia
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Lihat
                    </a>
                    <a
                      href="/spk/{spk.id}/pdf"
                      target="_blank"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </a>
                    {#if spk.status === 'in_progress'}
                      <button
                        on:click={() => openCompleteModal(spk)}
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Selesai
                      </button>
                    {/if}
                    <a
                      href="/spk/{spk.id}/edit"
                      use:inertia
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Edit
                    </a>
                    <button
                      on:click={() => deleteSPK(spk)}
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Hapus
                    </button>
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada SPK</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat SPK pertama Anda.</p>
          <div class="mt-6">
            <a
              href="/spk/create"
              use:inertia
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat SPK Baru
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
            <a href="?page={pagination.current_page - 1}&search={search}&status={status}" use:inertia class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </a>
          {/if}
          {#if pagination.current_page < pagination.total_pages}
            <a href="?page={pagination.current_page + 1}&search={search}&status={status}" use:inertia class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
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
                <a href="?page={pagination.current_page - 1}&search={search}&status={status}" use:inertia class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              {/if}

              {#each Array(pagination.total_pages) as _, i}
                {#if i + 1 === pagination.current_page}
                  <span class="relative inline-flex items-center px-4 py-2 border border-purple-500 bg-purple-50 text-sm font-medium text-purple-600">
                    {i + 1}
                  </span>
                {:else}
                  <a href="?page={i + 1}&search={search}&status={status}" use:inertia class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {i + 1}
                  </a>
                {/if}
              {/each}

              {#if pagination.current_page < pagination.total_pages}
                <a href="?page={pagination.current_page + 1}&search={search}&status={status}" use:inertia class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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

<!-- Modal Selesai SPK -->
{#if showCompleteModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" transition:fade>
    <div class="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Selesaikan SPK</h3>
          {#if selectedSPK}
            <div class="mt-2 mb-6">
              <p class="text-sm text-gray-500">SPK: <span class="font-semibold">{selectedSPK.spk_number}</span></p>
              <p class="text-sm text-gray-500">{selectedSPK.license_plate} - {selectedSPK.customer_name}</p>
              <p class="text-sm text-gray-500">Estimasi: {formatCurrency(selectedSPK.estimated_cost)}</p>
            </div>
            
            <!-- Service Cost Section -->
            <div class="mb-6 text-left">
              <h4 class="text-md font-medium text-gray-900 mb-3">Biaya Service</h4>
              <div class="mb-4">
                <label for="serviceCost" class="block text-sm font-medium text-gray-700 mb-2">
                  Biaya Service (Rp)
                </label>
                <input
                  type="text"
                  id="serviceCost"
                  value={serviceCostDisplay}
                  on:input={handleServiceCostInput}
                  placeholder="Masukkan biaya service"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <!-- Sparepart Section -->
            <div class="mb-6 text-left">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-md font-medium text-gray-900">Sparepart</h4>
                <button 
                  type="button" 
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  on:click={addSparepartItem} 
                  disabled={isSubmitting}
                >
                  + Tambah Item
                </button>
              </div>
              
              {#if sparepartItems.length > 0}
                <div class="border border-gray-300 rounded-md overflow-hidden">
                  <div class="bg-gray-50 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
                    <div class="col-span-4">Nama Item</div>
                    <div class="col-span-2">Qty</div>
                    <div class="col-span-3">Harga Satuan</div>
                    <div class="col-span-2">Total</div>
                    <div class="col-span-1">Aksi</div>
                  </div>
                  
                  {#each sparepartItems as item, index}
                    <div class="grid grid-cols-12 gap-2 p-3 border-t border-gray-200">
                      <div class="col-span-4">
                        <input 
                          type="text" 
                          bind:value={item.item_name}
                          on:input={(e) => handleSparepartInput(index, 'item_name', e)}
                          placeholder="Nama sparepart"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-2">
                        <input 
                          type="number" 
                          bind:value={item.quantity}
                          on:input={(e) => handleSparepartInput(index, 'quantity', e)}
                          min="1"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-3">
                        <input 
                          type="text" 
                          bind:value={item.unit_price_display}
                          on:input={(e) => handleSparepartInput(index, 'unit_price', e)}
                          placeholder="0"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-2 flex items-center">
                        <span class="text-sm">{formatCurrency(item.total_price)}</span>
                      </div>
                      <div class="col-span-1">
                        <button 
                          type="button" 
                          class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500" 
                          on:click={() => removeSparepartItem(index)}
                          disabled={isSubmitting || sparepartItems.length === 1}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Total Cost Summary -->
            <div class="mb-6 bg-gray-50 p-4 rounded-md">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Total Biaya Service:</span>
                  <span>{formatCurrency(parseFloat(serviceCost) || 0)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Total Biaya Sparepart:</span>
                  <span>{formatCurrency(sparepartItems.reduce((total, item) => total + (item.total_price || 0), 0))}</span>
                </div>
                <div class="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total Keseluruhan:</span>
                  <span>{formatCurrency(calculateTotalCost())}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
        <div class="items-center px-4 py-3">
          <div class="flex justify-end space-x-3">
            <button
              on:click={closeCompleteModal}
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              on:click={completeSPK}
              class="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !serviceCost.trim()}
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              {:else}
                Selesaikan SPK
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
