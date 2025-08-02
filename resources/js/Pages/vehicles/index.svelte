<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'
  import { Toast } from '../../Components/helper.js'

  export let vehicles = []
  export let customers = []
  export let pagination = {}
  export let search = ''
  export let customer_id = ''
  export let success = null

  let searchInput = search
  let customerFilter = customer_id
  let showSuccess = !!success

  function handleSearch() {
    const params = {}
    if (searchInput.trim()) {
      params.search = searchInput.trim()
    }
    if (customerFilter) {
      params.customer_id = customerFilter
    }

    router.get('/vehicles', params, {
      preserveState: true,
      preserveScroll: true
    })
  }

  function handleCustomerFilter() {
    handleSearch()
  }
  
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  async function deleteVehicle(id, licensePlate) {
    if (confirm(`Apakah Anda yakin ingin menghapus kendaraan "${licensePlate}"?`)) {
      try {
        const response = await fetch(`/vehicles/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          // Show success toast
          Toast('Kendaraan berhasil dihapus', 'success')

          // Reload the page to refresh the list
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          const data = await response.json()
          // Show error toast
          Toast(data.error || 'Terjadi kesalahan saat menghapus kendaraan', 'error')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        Toast('Terjadi kesalahan jaringan', 'error')
      }
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
  <title>Manajemen Kendaraan - SST Bengkel</title>
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
          <h1 class="text-3xl font-bold text-gray-900">Manajemen Kendaraan</h1>
          <p class="mt-1 text-sm text-gray-600">Kelola data kendaraan pelanggan</p>
        </div>
        <a
          href="/vehicles/create"
          use:inertia
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Kendaraan
        </a>
      </div>
    </div>
  </div>

  <!-- Success Message -->
  {#if showSuccess}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" transition:fade>
      <div class="bg-green-50 border border-green-200 rounded-md p-4">
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

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Search Bar -->
      <div>
        <label for="search" class="sr-only">Cari kendaraan</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            bind:value={searchInput}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cari plat nomor, merk, model, atau nama pelanggan..."
          />
        </div>
      </div>
      
      <!-- Customer Filter -->
      <div>
        <label for="customer_filter" class="sr-only">Filter pelanggan</label>
        <select
          id="customer_filter"
          bind:value={customerFilter}
          on:change={handleCustomerFilter}
          class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Semua Pelanggan</option>
          {#each customers as customer}
            <option value={customer.id}>{customer.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Vehicle Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      {#if vehicles.length > 0}
        <ul class="divide-y divide-gray-200">
          {#each vehicles as vehicle, index (vehicle.id)}
            <li transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4 flex-1 min-w-0">
                        <div class="flex items-center">
                          <p class="text-lg font-bold text-gray-900">
                            {vehicle.license_plate}
                          </p>
                          <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {vehicle.year || 'N/A'}
                          </span>
                        </div>
                        <p class="text-sm font-medium text-gray-700">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <div class="mt-1 flex items-center text-sm text-gray-500">
                          <span class="mr-4">👤 {vehicle.customer_name}</span>
                          {#if vehicle.customer_phone}
                            <span class="mr-4">📞 {vehicle.customer_phone}</span>
                          {/if}
                          {#if vehicle.color}
                            <span class="mr-4">🎨 {vehicle.color}</span>
                          {/if}
                          {#if vehicle.engine_type}
                            <span>⚙️ {vehicle.engine_type}</span>
                          {/if}
                        </div>
                        <p class="mt-1 text-xs text-gray-400">
                          Terdaftar: {formatDate(vehicle.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a
                      href="/vehicles/{vehicle.id}"
                      use:inertia
                      class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Lihat
                    </a>
                    <a
                      href="/vehicles/{vehicle.id}/edit"
                      use:inertia
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </a>
                    <button
                      on:click={() => deleteVehicle(vehicle.id, vehicle.license_plate)}
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada kendaraan</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan kendaraan pertama.</p>
          <div class="mt-6">
            <a
              href="/vehicles/create"
              use:inertia
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Kendaraan
            </a>
          </div>
        </div>
      {/if}
    </div>

    <!-- Pagination -->
    {#if pagination.total_pages > 1}
      <div class="mt-6 flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          {#if pagination.current_page > 1}
            <a
              href="?page={pagination.current_page - 1}{search ? '&search=' + encodeURIComponent(search) : ''}{customer_id ? '&customer_id=' + customer_id : ''}"
              use:inertia
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </a>
          {/if}
          {#if pagination.current_page < pagination.total_pages}
            <a
              href="?page={pagination.current_page + 1}{search ? '&search=' + encodeURIComponent(search) : ''}{customer_id ? '&customer_id=' + customer_id : ''}"
              use:inertia
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </a>
          {/if}
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Menampilkan
              <span class="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span>
              sampai
              <span class="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total_items)}</span>
              dari
              <span class="font-medium">{pagination.total_items}</span>
              hasil
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {#if pagination.current_page > 1}
                <a
                  href="?page={pagination.current_page - 1}{search ? '&search=' + encodeURIComponent(search) : ''}{customer_id ? '&customer_id=' + customer_id : ''}"
                  use:inertia
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              {/if}

              {#each Array(pagination.total_pages) as _, i}
                {#if i + 1 === pagination.current_page}
                  <span class="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                    {i + 1}
                  </span>
                {:else}
                  <a
                    href="?page={i + 1}{search ? '&search=' + encodeURIComponent(search) : ''}{customer_id ? '&customer_id=' + customer_id : ''}"
                    use:inertia
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {i + 1}
                  </a>
                {/if}
              {/each}

              {#if pagination.current_page < pagination.total_pages}
                <a
                  href="?page={pagination.current_page + 1}{search ? '&search=' + encodeURIComponent(search) : ''}{customer_id ? '&customer_id=' + customer_id : ''}"
                  use:inertia
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
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
