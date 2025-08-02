<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly, fade } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'

  export let spk = {}
  export let spkItems = []

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

  function handleDelete() {
    router.delete(`/spk/${spk.id}`, {
      onSuccess: () => {
        router.visit('/spk', {
          data: { success: 'SPK berhasil dihapus' }
        })
      },
      onError: () => {
        alert('Terjadi kesalahan saat menghapus SPK')
      }
    })
  }

  function calculateItemsTotal() {
    return spkItems.reduce((total, item) => total + parseFloat(item.total_price || 0), 0)
  }
</script>

<svelte:head>
  <title>SPK {spk.spk_number} - SST Bengkel</title>
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
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <a href="/spk" use:inertia class="text-gray-400 hover:text-gray-500">
                  SPK Digital
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">{spk.spk_number}</span>
                </div>
              </li>
            </ol>
          </nav>
          <div class="mt-2 flex items-center space-x-4">
            <h1 class="text-3xl font-bold text-gray-900">{spk.spk_number}</h1>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusBadge(spk.status)}">
              {getStatusText(spk.status)}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-600">Detail Surat Perintah Kerja</p>
        </div>
        <div class="flex space-x-3">
          <a
            href="/spk/{spk.id}/edit"
            use:inertia
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit SPK
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

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- SPK Details -->
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Detail SPK</h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nomor SPK</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{spk.spk_number}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(spk.status)}">
                    {getStatusText(spk.status)}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Tanggal Dibuat</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatDate(spk.created_at)}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Tanggal Mulai</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatDate(spk.start_date)}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Tanggal Selesai</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatDate(spk.completion_date)}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Estimasi Biaya</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatCurrency(spk.estimated_cost)}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Biaya Aktual</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatCurrency(spk.actual_cost)}</dd>
              </div>
            </dl>
            
            <div class="mt-6">
              <dt class="text-sm font-medium text-gray-500">Deskripsi Servis</dt>
              <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{spk.service_description}</dd>
            </div>
            
            {#if spk.notes}
              <div class="mt-6">
                <dt class="text-sm font-medium text-gray-500">Catatan</dt>
                <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{spk.notes}</dd>
              </div>
            {/if}
          </div>
        </div>

        <!-- SPK Items -->
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Item Pekerjaan</h3>
              <span class="text-sm text-gray-500">{spkItems.length} item</span>
            </div>
            
            {#if spkItems.length > 0}
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each spkItems as item}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{item.item_name}</div>
                            {#if item.description}
                              <div class="text-sm text-gray-500">{item.description}</div>
                            {/if}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.total_price)}</td>
                      </tr>
                    {/each}
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="3" class="px-6 py-3 text-right text-sm font-medium text-gray-900">Total:</td>
                      <td class="px-6 py-3 text-sm font-bold text-gray-900">{formatCurrency(calculateItemsTotal())}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            {:else}
              <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada item</h3>
                <p class="mt-1 text-sm text-gray-500">Item pekerjaan akan ditambahkan saat SPK dikerjakan.</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Vehicle Info -->
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Kendaraan</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Plat Nomor</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{spk.license_plate}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Merk & Model</dt>
                <dd class="mt-1 text-sm text-gray-900">{spk.brand} {spk.model}</dd>
              </div>
              {#if spk.year}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Tahun</dt>
                  <dd class="mt-1 text-sm text-gray-900">{spk.year}</dd>
                </div>
              {/if}
            </dl>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 300 }}>
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Pelanggan</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nama</dt>
                <dd class="mt-1 text-sm text-gray-900">{spk.customer_name}</dd>
              </div>
              {#if spk.customer_phone}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Telepon</dt>
                  <dd class="mt-1 text-sm text-gray-900">{spk.customer_phone}</dd>
                </div>
              {/if}
              {#if spk.customer_email}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{spk.customer_email}</dd>
                </div>
              {/if}
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" transition:fade>
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mt-2">Hapus SPK</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            Apakah Anda yakin ingin menghapus SPK <strong>{spk.spk_number}</strong>? 
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
