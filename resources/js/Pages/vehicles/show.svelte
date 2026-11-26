<script>
  import { fly } from 'svelte/transition'

  import { Toast } from '../../Components/helper.js'
  
  export let vehicle = {}
  export let serviceRecords = []
  export let spkRecords = []
  
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  async function deleteVehicle() {
    let confirmMessage = `Apakah Anda yakin ingin menghapus kendaraan "${vehicle.license_plate}"?`;

    if (serviceRecords && serviceRecords.length > 0) {
      confirmMessage = `Apakah Anda yakin ingin menghapus kendaraan "${vehicle.license_plate}" beserta ${serviceRecords.length} riwayat service yang terkait?\n\nPeringatan: Semua data service record, SPK, dan invoice yang terkait akan ikut terhapus secara permanen.`;
    }

    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/vehicles/${vehicle.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()

        if (response.ok) {
          // Show success toast
          Toast(data.message || 'Kendaraan berhasil dihapus', 'success')

          // Redirect to vehicles list after successful deletion
          setTimeout(() => {
            window.location.href = '/vehicles'
          }, 1500)
        } else {
          // Show error toast
          Toast(data.error || 'Terjadi kesalahan saat menghapus kendaraan', 'error')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        Toast('Terjadi kesalahan jaringan', 'error')
      }
    }
  }
</script>

<svelte:head>
  <title>{vehicle.license_plate} - Detail Kendaraan - SST Bengkel</title>
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
                <a href="/vehicles" class="text-gray-400 hover:text-gray-500">
                  Kendaraan
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">{vehicle.license_plate}</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">{vehicle.license_plate}</h1>
          <p class="mt-1 text-sm text-gray-600">Detail informasi kendaraan</p>
        </div>
        <div class="flex space-x-3">
          <a
            href="/vehicles/{vehicle.id}/edit"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </a>
          <button
            on:click={deleteVehicle}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title={serviceRecords && serviceRecords.length > 0 ? `Hapus kendaraan beserta ${serviceRecords.length} riwayat service yang terkait` : 'Hapus kendaraan'}
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
            {#if serviceRecords && serviceRecords.length > 0}
              <span class="ml-1 text-xs opacity-75">({serviceRecords.length})</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Vehicle Information -->
      <div class="lg:col-span-1">
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{vehicle.license_plate}</h3>
                <p class="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</p>
              </div>
            </div>
            
            <div class="mt-6 border-t border-gray-200 pt-6">
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Pemilik</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <a href="/customers/{vehicle.customer_id}" class="text-blue-600 hover:text-blue-500">
                      {vehicle.customer_name}
                    </a>
                  </dd>
                </div>
                
                {#if vehicle.customer_phone}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Telepon Pemilik</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <a href="tel:{vehicle.customer_phone}" class="text-blue-600 hover:text-blue-500">
                        {vehicle.customer_phone}
                      </a>
                    </dd>
                  </div>
                {/if}
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Merk & Model</dt>
                  <dd class="mt-1 text-sm text-gray-900">{vehicle.brand} {vehicle.model}</dd>
                </div>
                
                {#if vehicle.year}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Tahun</dt>
                    <dd class="mt-1 text-sm text-gray-900">{vehicle.year}</dd>
                  </div>
                {/if}
                
                {#if vehicle.engine_type}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Jenis Mesin</dt>
                    <dd class="mt-1 text-sm text-gray-900">{vehicle.engine_type}</dd>
                  </div>
                {/if}
                
                {#if vehicle.color}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Warna</dt>
                    <dd class="mt-1 text-sm text-gray-900">{vehicle.color}</dd>
                  </div>
                {/if}
                
                {#if vehicle.notes}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Catatan</dt>
                    <dd class="mt-1 text-sm text-gray-900">{vehicle.notes}</dd>
                  </div>
                {/if}
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Jumlah SPK</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {#if spkRecords && spkRecords.length > 0}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {spkRecords.length} SPK tercatat
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Belum ada SPK
                      </span>
                    {/if}
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Jumlah Service</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {#if serviceRecords && serviceRecords.length > 0}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {serviceRecords.length} service tercatat
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Belum ada service
                      </span>
                    {/if}
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Terdaftar</dt>
                  <dd class="mt-1 text-sm text-gray-900">{formatDate(vehicle.created_at)}</dd>
                </div>
                
                {#if vehicle.updated_at !== vehicle.created_at}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Terakhir Diperbarui</dt>
                    <dd class="mt-1 text-sm text-gray-900">{formatDate(vehicle.updated_at)}</dd>
                  </div>
                {/if}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- SPK Records List -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">SPK (Surat Perintah Kerja)</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Daftar SPK yang sudah dibuat ({spkRecords.length} SPK)
                </p>
              </div>
              <a
                href="/spk/create?vehicle_id={vehicle.id}"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buat SPK Baru
              </a>
            </div>

            {#if spkRecords.length > 0}
              <div class="space-y-4">
                {#each spkRecords as spk, index (spk.id)}
                  <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <div class="h-10 w-10 rounded-full {spk.status === 'completed' ? 'bg-green-500' : spk.status === 'in_progress' ? 'bg-blue-500' : spk.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'} flex items-center justify-center">
                              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {#if spk.status === 'completed'}
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                {:else if spk.status === 'in_progress'}
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                {:else if spk.status === 'cancelled'}
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                {:else}
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                {/if}
                              </svg>
                            </div>
                          </div>
                          <div class="ml-4">
                            <h4 class="text-sm font-medium text-gray-900">
                              {spk.spk_number}
                            </h4>
                            <p class="text-sm text-gray-500">
                              {formatDate(spk.created_at)}
                            </p>
                            <p class="text-xs text-gray-600 mt-1">
                              {spk.service_description}
                            </p>
                            <div class="flex items-center mt-2 space-x-4">
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                {spk.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                 spk.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                 spk.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                 'bg-gray-100 text-gray-800'}">
                                {spk.status === 'completed' ? 'Selesai' : 
                                 spk.status === 'in_progress' ? 'Sedang Dikerjakan' : 
                                 spk.status === 'cancelled' ? 'Dibatalkan' : 
                                 'Draft'}
                              </span>
                              {#if spk.estimated_cost}
                                <p class="text-xs text-blue-600 font-medium">
                                  Est: {formatCurrency(spk.estimated_cost)}
                                </p>
                              {/if}
                              {#if spk.actual_cost}
                                <p class="text-xs text-green-600 font-medium">
                                  Aktual: {formatCurrency(spk.actual_cost)}
                                </p>
                              {/if}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <a
                          href="/spk/{spk.id}"
                          class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Lihat
                        </a>
                        <a
                          href="/spk/{spk.id}/edit"
                          class="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada SPK</h3>
                <p class="mt-1 text-sm text-gray-500">Kendaraan ini belum memiliki SPK yang dibuat.</p>
                <div class="mt-6">
                  <a
                    href="/spk/create?vehicle_id={vehicle.id}"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat SPK Pertama
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Service Records List -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Riwayat Service</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Daftar service yang pernah dilakukan ({serviceRecords.length} service)
                </p>
              </div>
            </div>

            {#if serviceRecords.length > 0}
              <div class="space-y-4">
                {#each serviceRecords as service, index (service.id)}
                  <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50" transition:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div class="ml-4">
                            <h4 class="text-sm font-medium text-gray-900">
                              Service #{service.id.substring(0, 8)}
                            </h4>
                            <p class="text-sm text-gray-500">
                              {formatDate(service.service_date)}
                            </p>
                            {#if service.total_cost}
                              <p class="text-xs text-green-600 font-medium">
                                {formatCurrency(service.total_cost)}
                              </p>
                            {/if}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <a
                          href="/service-records/{service.id}"
                          class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Lihat
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
                <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada service</h3>
                <p class="mt-1 text-sm text-gray-500">Kendaraan ini belum pernah melakukan service.</p>
                <div class="mt-6">
                  <a
                    href="/spk/create?vehicle_id={vehicle.id}"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat SPK Pertama
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
