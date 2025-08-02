<script>
  import { inertia } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'
  
  export let stats = {}
  export let recentActivities = []
  export let revenueData = []
  export let serviceStats = []
  export let period = 'month'
  export let year = new Date().getFullYear()
  export let month = new Date().getMonth() + 1
  
  function formatCurrency(amount) {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }
  
  function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  function getServiceStatusColor(status) {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  
  function getServiceStatusText(status) {
    const texts = {
      'draft': 'Draft',
      'in_progress': 'Sedang Dikerjakan',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    }
    return texts[status] || status
  }
</script>

<svelte:head>
  <title>Laporan Real-time - SST Bengkel</title>
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
          <h1 class="text-3xl font-bold text-gray-900">Laporan Real-time</h1>
          <p class="mt-1 text-sm text-gray-600">Dashboard dan analytics bengkel</p>
        </div>
        <div class="flex space-x-3">
          <a
            href="/reports/revenue"
            use:inertia
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Laporan Pendapatan
          </a>
          <a
            href="/reports/services"
            use:inertia
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Laporan Servis
          </a>
          <a
            href="/reports/customers"
            use:inertia
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Laporan Pelanggan
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <!-- Total Customers -->
      <div class="bg-white overflow-hidden shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 0 }}>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Pelanggan</dt>
                <dd class="text-lg font-medium text-gray-900">{stats.totalCustomers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Vehicles -->
      <div class="bg-white overflow-hidden shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Kendaraan</dt>
                <dd class="text-lg font-medium text-gray-900">{stats.totalVehicles || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Active SPKs -->
      <div class="bg-white overflow-hidden shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">SPK Aktif</dt>
                <dd class="text-lg font-medium text-gray-900">{stats.activeSPKs || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="bg-white overflow-hidden shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 300 }}>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pendapatan Bulan Ini</dt>
                <dd class="text-lg font-medium text-gray-900">{formatCurrency(stats.revenue)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Services -->
      <div class="bg-white overflow-hidden shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 400 }}>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Servis Selesai</dt>
                <dd class="text-lg font-medium text-gray-900">{stats.completedServices || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts and Recent Activities -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Service Statistics -->
      <div class="bg-white shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 500 }}>
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Statistik Servis</h3>
          {#if serviceStats.length > 0}
            <div class="space-y-3">
              {#each serviceStats as stat}
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getServiceStatusColor(stat.status)}">
                      {getServiceStatusText(stat.status)}
                    </span>
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {stat.count} SPK
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-gray-500">Belum ada data servis</p>
          {/if}
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="bg-white shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 600 }}>
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>
          {#if recentActivities.length > 0}
            <div class="flow-root">
              <ul class="-mb-8">
                {#each recentActivities as activity, i}
                  <li>
                    <div class="relative pb-8">
                      {#if i !== recentActivities.length - 1}
                        <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      {/if}
                      <div class="relative flex space-x-3">
                        <div>
                          <span class="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(activity.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {:else}
            <p class="text-sm text-gray-500">Belum ada aktivitas terbaru</p>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <div class="bg-white shadow rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 700 }}>
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Aksi Cepat</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/customers/create"
            use:inertia
            class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors"
          >
            <div>
              <span class="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </span>
            </div>
            <div class="mt-8">
              <h3 class="text-lg font-medium">
                <span class="absolute inset-0" aria-hidden="true"></span>
                Tambah Pelanggan
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Daftarkan pelanggan baru ke sistem
              </p>
            </div>
          </a>

          <a
            href="/vehicles/create"
            use:inertia
            class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-green-500 transition-colors"
          >
            <div>
              <span class="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </span>
            </div>
            <div class="mt-8">
              <h3 class="text-lg font-medium">
                <span class="absolute inset-0" aria-hidden="true"></span>
                Tambah Kendaraan
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Daftarkan kendaraan baru
              </p>
            </div>
          </a>

          <a
            href="/spk/create"
            use:inertia
            class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-purple-500 transition-colors"
          >
            <div>
              <span class="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </span>
            </div>
            <div class="mt-8">
              <h3 class="text-lg font-medium">
                <span class="absolute inset-0" aria-hidden="true"></span>
                Buat SPK
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Buat Surat Perintah Kerja baru
              </p>
            </div>
          </a>

          <a
            href="/invoices/create"
            use:inertia
            class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-lg border border-gray-300 hover:border-orange-500 transition-colors"
          >
            <div>
              <span class="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </span>
            </div>
            <div class="mt-8">
              <h3 class="text-lg font-medium">
                <span class="absolute inset-0" aria-hidden="true"></span>
                Buat Invoice
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Generate invoice otomatis
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
