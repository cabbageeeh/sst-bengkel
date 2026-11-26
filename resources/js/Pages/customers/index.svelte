<script>
  import { router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'

  import { Toast } from '../../Components/helper.js'

  export let customers = []
  export let pagination = {}
  export let search = ''
  export let success = null

  let searchInput = search
  let showSuccess = !!success

  function handleSearch() {
    const params = {}
    if (searchInput.trim()) {
      params.search = searchInput.trim()
    }

    router.get('/customers', params, {
      preserveState: true,
      preserveScroll: true
    })
  }
  
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  async function deleteCustomer(id, name, vehicleCount = 0) {
    let confirmMessage = `Apakah Anda yakin ingin menghapus pelanggan "${name}"?`;

    if (vehicleCount > 0) {
      confirmMessage = `Apakah Anda yakin ingin menghapus pelanggan "${name}" beserta ${vehicleCount} kendaraan yang terkait?\n\nPeringatan: Semua data kendaraan, service record, SPK, dan invoice yang terkait akan ikut terhapus secara permanen.`;
    }

    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/customers/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()

        if (response.ok) {
          // Show success toast
          Toast(data.message || 'Pelanggan berhasil dihapus', 'success')

          // Remove customer from UI
          customers = customers.filter(customer => customer.id !== id)
        } else {
          // Show error toast
          Toast(data.error || 'Terjadi kesalahan saat menghapus pelanggan', 'error')
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
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
  <title>Manajemen Pelanggan - SST Bengkel</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Page Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Manajemen Pelanggan</h1>
          <p class="mt-1 text-sm text-gray-600">Kelola data pelanggan bengkel Anda</p>
        </div>
        <a
          href="/customers/create"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Pelanggan
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
              aria-label="Tutup pesan" on:click={() => showSuccess = false}
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
    <!-- Search Bar -->
    <div class="mb-6">
      <div class="max-w-md">
        <label for="search" class="sr-only">Cari pelanggan</label>
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
            placeholder="Cari nama, telepon, atau email..."
          />
        </div>
      </div>
    </div>

    <!-- Customer Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      {#if customers.length > 0}
        <div class="management-table-scroll"><table class="management-table"><thead><tr><th>Pelanggan</th><th>Kontak</th><th>Alamat</th><th>Kendaraan</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>
{#each customers as customer (customer.id)}<tr><td><a class="primary-text" href="/customers/{customer.id}">{customer.name}</a><div class="secondary-text">Terdaftar {formatDate(customer.created_at)}</div></td><td><div>{customer.phone || '—'}</div><div class="secondary-text">{customer.email || 'Email belum diisi'}</div></td><td><span class="secondary-text">{customer.address || 'Belum diisi'}</span></td><td><span class="count-badge">{customer.vehicle_count || 0} kendaraan</span></td><td><div class="table-actions"><a class="action-link" href="/customers/{customer.id}">Lihat</a><a class="action-link" href="/customers/{customer.id}/edit">Edit</a><button class="action-link action-delete" on:click={() => deleteCustomer(customer.id, customer.name, customer.vehicle_count)}>Hapus</button></div></td></tr>{/each}
</tbody></table></div>
      {:else}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pelanggan</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pelanggan pertama Anda.</p>
          <div class="mt-6">
            <a
              href="/customers/create"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Pelanggan
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
              href="?page={pagination.current_page - 1}{search ? '&search=' + encodeURIComponent(search) : ''}"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </a>
          {/if}
          {#if pagination.current_page < pagination.total_pages}
            <a
              href="?page={pagination.current_page + 1}{search ? '&search=' + encodeURIComponent(search) : ''}"
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
                  href="?page={pagination.current_page - 1}{search ? '&search=' + encodeURIComponent(search) : ''}"
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
                    href="?page={i + 1}{search ? '&search=' + encodeURIComponent(search) : ''}"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {i + 1}
                  </a>
                {/if}
              {/each}

              {#if pagination.current_page < pagination.total_pages}
                <a
                  href="?page={pagination.current_page + 1}{search ? '&search=' + encodeURIComponent(search) : ''}"
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
