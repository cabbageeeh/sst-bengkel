<script>
  import { fly } from 'svelte/transition'

  import { Toast } from '../../Components/helper.js'
  
  export let customer = {}
  export let vehicles = []
  
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  async function deleteCustomer() {
    let confirmMessage = `Apakah Anda yakin ingin menghapus pelanggan "${customer.name}"?`;

    if (vehicles && vehicles.length > 0) {
      confirmMessage = `Apakah Anda yakin ingin menghapus pelanggan "${customer.name}" beserta ${vehicles.length} kendaraan yang terkait?\n\nPeringatan: Semua data kendaraan, service record, SPK, dan invoice yang terkait akan ikut terhapus secara permanen.`;
    }

    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/customers/${customer.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()

        if (response.ok) {
          // Show success toast
          Toast(data.message || 'Pelanggan berhasil dihapus', 'success')

          // Redirect to customers list after successful deletion
          setTimeout(() => {
            window.location.href = '/customers'
          }, 1500)
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
</script>

<svelte:head>
  <title>{customer.name} - Detail Pelanggan - SST Bengkel</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Page Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <a href="/customers" class="text-gray-400 hover:text-gray-500">
                  Pelanggan
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">{customer.name}</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p class="mt-1 text-sm text-gray-600">Detail informasi pelanggan</p>
        </div>
        <div class="flex space-x-3">
          <a
            href="/customers/{customer.id}/edit"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </a>
          <button
            on:click={deleteCustomer}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title={vehicles && vehicles.length > 0 ? `Hapus pelanggan beserta ${vehicles.length} kendaraan yang terkait` : 'Hapus pelanggan'}
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
            {#if vehicles && vehicles.length > 0}
              <span class="ml-1 text-xs opacity-75">({vehicles.length})</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Customer Information -->
      <div class="lg:col-span-1">
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-white font-bold text-xl">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{customer.name}</h3>
                <p class="text-sm text-gray-500">Pelanggan</p>
              </div>
            </div>
            
            <div class="mt-6 border-t border-gray-200 pt-6">
              <dl class="space-y-4">
                {#if customer.phone}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Telepon</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <a href="tel:{customer.phone}" class="text-blue-600 hover:text-blue-500">
                        {customer.phone}
                      </a>
                    </dd>
                  </div>
                {/if}
                
                {#if customer.address}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Alamat</dt>
                    <dd class="mt-1 text-sm text-gray-900">{customer.address}</dd>
                  </div>
                {/if}
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Jumlah Kendaraan</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {#if vehicles && vehicles.length > 0}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {vehicles.length} kendaraan terdaftar
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Belum ada kendaraan
                      </span>
                    {/if}
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Terdaftar</dt>
                  <dd class="mt-1 text-sm text-gray-900">{formatDate(customer.created_at)}</dd>
                </div>
                
                {#if customer.updated_at !== customer.created_at}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Terakhir Diperbarui</dt>
                    <dd class="mt-1 text-sm text-gray-900">{formatDate(customer.updated_at)}</dd>
                  </div>
                {/if}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicles List -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Kendaraan</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Daftar kendaraan yang dimiliki pelanggan ({vehicles.length} kendaraan)
                </p>
              </div>
              <a
                href="/vehicles/create?customer_id={customer.id}"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Kendaraan
              </a>
            </div>

            {#if vehicles.length > 0}
              <div class="space-y-4">
                {#each vehicles as vehicle, index (vehicle.id)}
                  <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center">
                              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div class="ml-4">
                            <h4 class="text-sm font-medium text-gray-900">
                              {vehicle.license_plate}
                            </h4>
                            <p class="text-sm text-gray-500">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </p>
                            {#if vehicle.color}
                              <p class="text-xs text-gray-400">Warna: {vehicle.color}</p>
                            {/if}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <a
                          href="/vehicles/{vehicle.id}"
                          class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Lihat
                        </a>
                        <a
                          href="/vehicles/{vehicle.id}/edit"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada kendaraan</h3>
                <p class="mt-1 text-sm text-gray-500">Pelanggan ini belum memiliki kendaraan yang terdaftar.</p>
                <div class="mt-6">
                  <a
                    href="/vehicles/create?customer_id={customer.id}"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Kendaraan Pertama
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
