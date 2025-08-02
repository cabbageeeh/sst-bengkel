<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'

  export let revenueData = []
  export let startDate = ''
  export let endDate = ''
  export let groupBy = 'day'

  let filterStartDate = startDate
  let filterEndDate = endDate
  let filterGroupBy = groupBy
  let sortField = 'date'
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

  function handleFilter() {
    const params = {
      start_date: filterStartDate,
      end_date: filterEndDate,
      group_by: filterGroupBy
    }

    router.get('/reports/revenue', params, {
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

  $: sortedData = [...revenueData].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    if (sortField === 'date') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  $: totalRevenue = revenueData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  $: totalInvoices = revenueData.reduce((sum, item) => sum + (item.invoice_count || 0), 0)
  $: maxAmount = Math.max(...revenueData.map(item => item.total_amount || 0))
</script>

<SSTHeader showBackground={true} />

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Laporan Pendapatan</h1>
      <p class="text-gray-600">Analisis pendapatan dan tren keuangan bengkel</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Filter Laporan</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
          <input
            type="date"
            id="start_date"
            bind:value={filterStartDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
          <input
            type="date"
            id="end_date"
            bind:value={filterEndDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="group_by" class="block text-sm font-medium text-gray-700 mb-2">Grup Berdasarkan</label>
          <select
            id="group_by"
            bind:value={filterGroupBy}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            on:click={handleFilter}
            class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm p-6" transition:fly={{ y: 20, duration: 300 }}>
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
              <dt class="text-sm font-medium text-gray-500 truncate">Total Pendapatan</dt>
              <dd class="text-lg font-medium text-gray-900">{formatCurrency(totalRevenue)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Invoice</dt>
              <dd class="text-lg font-medium text-gray-900">{totalInvoices}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Tren Pendapatan</h2>
      <div class="h-64 flex items-end space-x-2 overflow-x-auto">
        {#each sortedData as item, index (item.date)}
          <div class="flex flex-col items-center min-w-0 flex-1" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
            <div class="w-full bg-purple-100 rounded-t" style="height: {maxAmount > 0 ? (item.total_amount / maxAmount) * 200 : 0}px; min-height: 4px;">
              <div class="w-full bg-purple-600 rounded-t" style="height: 100%;"></div>
            </div>
            <div class="mt-2 text-xs text-gray-600 text-center">
              {formatDate(item.date)}
            </div>
            <div class="text-xs font-medium text-gray-900 text-center">
              {formatCurrency(item.total_amount)}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Detail Pendapatan</h2>
      </div>
      
      {#if sortedData.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('date')}
                >
                  Tanggal
                  {#if sortField === 'date'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('total_amount')}
                >
                  Total Pendapatan
                  {#if sortField === 'total_amount'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortData('invoice_count')}
                >
                  Jumlah Invoice
                  {#if sortField === 'invoice_count'}
                    <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  {/if}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each sortedData as item, index (item.date)}
                <tr class="hover:bg-gray-50" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.date)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.total_amount)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.invoice_count}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="px-6 py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p class="mt-1 text-sm text-gray-500">Belum ada data pendapatan untuk periode yang dipilih.</p>
        </div>
      {/if}
    </div>
  </div>
</div>