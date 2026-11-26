<script>
  import { router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'


  export let serviceData = []
  export let serviceStats = []

  let searchInput = ''
  let statusFilter = ''
  let sortField = 'tanggal_masuk'
  let sortDirection = 'desc'

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

  function handleSearch() {
    const params = {}
    if (searchInput.trim()) {
      params.search = searchInput.trim()
    }
    if (statusFilter) {
      params.status = statusFilter
    }

    router.get('/reports/services', params, {
      preserveState: true,
      preserveScroll: true
    })
  }

  function sortData(field) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortField = field
      sortDirection = 'asc'
    }
  }

  $: filteredData = serviceData.filter(item => {
    const matchesSearch = !searchInput || 
      item.spk_number?.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.license_plate?.toLowerCase().includes(searchInput.toLowerCase())
    
    const matchesStatus = !statusFilter || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  $: sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    if (sortField === 'tanggal_masuk' || sortField === 'tanggal_keluar') {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  $: totalServices = serviceStats.reduce((sum, stat) => sum + (stat.count || 0), 0)
  $: totalCost = serviceStats.reduce((sum, stat) => sum + (stat.total_cost || 0), 0)
</script>



<div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Laporan Servis</h1>
      <p class="text-gray-600">Statistik dan analisis layanan servis bengkel</p>
    </div>

    <!-- Service Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {#each serviceStats as stat, index (stat.status)}
        <div class="bg-white rounded-lg shadow-sm p-6" transition:fly={{ y: 20, duration: 300, delay: index * 100 }}>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 {getStatusBadge(stat.status).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-100', '-200')} rounded-full flex items-center justify-center">
                {#if stat.status === 'completed'}
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                {:else if stat.status === 'in_progress'}
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                {:else if stat.status === 'cancelled'}
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                {:else}
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                {/if}
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{getStatusText(stat.status)}</dt>
                <dd class="text-lg font-medium text-gray-900">{stat.count || 0}</dd>
                <dd class="text-xs text-gray-500">{formatCurrency(stat.total_cost || 0)}</dd>
              </dl>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm p-6" transition:fly={{ y: 20, duration: 300 }}>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Servis</dt>
              <dd class="text-lg font-medium text-gray-900">{totalServices}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Nilai Servis</dt>
              <dd class="text-lg font-medium text-gray-900">{formatCurrency(totalCost)}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
          <input
            type="text"
            id="search"
            bind:value={searchInput}
            placeholder="Nomor SPK, pelanggan, atau plat nomor..."
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

    <!-- Services Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Daftar SPK</h2>
      </div>
      
      {#if sortedData.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('spk_number')}
                >
                  Nomor SPK
                  {#if sortField === 'spk_number'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('customer_name')}
                >
                  Pelanggan
                  {#if sortField === 'customer_name'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('status')}
                >
                  Status
                  {#if sortField === 'status'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('tanggal_masuk')}
                >
                  Tanggal Masuk
                  {#if sortField === 'tanggal_masuk'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('tanggal_keluar')}
                >
                  Tanggal Keluar
                  {#if sortField === 'tanggal_keluar'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('actual_cost')}
                >
                  Biaya
                  {#if sortField === 'actual_cost'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each sortedData as item, index (item.id)}
                <tr class="hover:bg-gray-50" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <a href="/spk/{item.id}" class="text-purple-600 hover:text-purple-900">
                      {item.spk_number}
                    </a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.customer_name}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div class="font-medium">{item.license_plate}</div>
                      <div class="text-gray-500">{item.brand} {item.model}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusBadge(item.status)}">
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.tanggal_masuk)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.tanggal_keluar)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.actual_cost || item.estimated_cost)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="px-6 py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p class="mt-1 text-sm text-gray-500">Belum ada data servis yang sesuai dengan filter yang dipilih.</p>
        </div>
      {/if}
    </div>
  </div>
</div>