<script>
  import { router } from '@inertiajs/svelte'
  import { fly } from 'svelte/transition'


  export let customers = []
  export let selectedCustomer = null

  let form = {
    customer_id: selectedCustomer?.id || '',
    license_plate: '',
    brand: '',
    model: '',
    year: '',
    engine_type: '',
    color: '',
    notes: ''
  }

  let errors = {}
  let loading = false

  function handleSubmit() {
    if (!validateForm()) {
      return
    }

    loading = true
    errors = {}

    router.post('/vehicles', form, {
      onSuccess: () => {
        router.visit('/vehicles', {
          data: { success: 'Kendaraan berhasil ditambahkan' }
        })
      },
      onError: (errors) => {
        if (errors.general) {
          errors.general = errors.general
        } else {
          errors.general = 'Terjadi kesalahan saat menyimpan data'
        }
      },
      onFinish: () => {
        loading = false
      }
    })
  }
  
  function validateForm() {
    const newErrors = {}
    
    if (!form.customer_id) {
      newErrors.customer_id = 'Pelanggan wajib dipilih'
    }
    
    if (!form.license_plate.trim()) {
      newErrors.license_plate = 'Plat nomor wajib diisi'
    }
    
    if (!form.brand.trim()) {
      newErrors.brand = 'Merk kendaraan wajib diisi'
    }
    
    if (!form.model.trim()) {
      newErrors.model = 'Model kendaraan wajib diisi'
    }
    
    if (form.year && (isNaN(form.year) || form.year < 1900 || form.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Tahun tidak valid'
    }
    
    errors = newErrors
    return Object.keys(newErrors).length === 0
  }
  
  function handleInputChange() {
    // Clear errors when user starts typing
    if (errors.general) {
      errors = { ...errors, general: null }
    }
  }
  
  function formatLicensePlate() {
    form.license_plate = form.license_plate.toUpperCase()
  }
</script>

<svelte:head>
  <title>Tambah Kendaraan - SST Bengkel</title>
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
                  <span class="ml-4 text-sm font-medium text-gray-500">Tambah Kendaraan</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">Tambah Kendaraan Baru</h1>
          <p class="mt-1 text-sm text-gray-600">Daftarkan kendaraan baru untuk pelanggan</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
      <div class="px-4 py-5 sm:p-6">
        <form on:submit|preventDefault={handleSubmit}>
          <!-- Error Message -->
          {#if errors.general}
            <div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          {/if}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Selection -->
            <div class="md:col-span-2">
              <label for="customer_id" class="block text-sm font-medium text-gray-700">
                Pelanggan <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <select
                  id="customer_id"
                  bind:value={form.customer_id}
                  on:change={handleInputChange}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.customer_id ? 'border-red-300' : ''}"
                >
                  <option value="">Pilih Pelanggan</option>
                  {#each customers as customer}
                    <option value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                    </option>
                  {/each}
                </select>
              </div>
              {#if errors.customer_id}
                <p class="mt-2 text-sm text-red-600">{errors.customer_id}</p>
              {/if}
              {#if customers.length === 0}
                <p class="mt-2 text-sm text-gray-500">
                  Belum ada pelanggan. 
                  <a href="/customers/create" class="text-blue-600 hover:text-blue-500">Tambah pelanggan baru</a>
                </p>
              {/if}
            </div>

            <!-- License Plate -->
            <div>
              <label for="license_plate" class="block text-sm font-medium text-gray-700">
                Plat Nomor <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <input
                  id="license_plate"
                  type="text"
                  bind:value={form.license_plate}
                  on:input={handleInputChange}
                  on:blur={formatLicensePlate}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.license_plate ? 'border-red-300' : ''}"
                  placeholder="Contoh: B 1234 ABC"
                />
              </div>
              {#if errors.license_plate}
                <p class="mt-2 text-sm text-red-600">{errors.license_plate}</p>
              {/if}
            </div>

            <!-- Year -->
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700">
                Tahun
              </label>
              <div class="mt-1">
                <input
                  id="year"
                  type="number"
                  bind:value={form.year}
                  on:input={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.year ? 'border-red-300' : ''}"
                  placeholder="Contoh: 2020"
                />
              </div>
              {#if errors.year}
                <p class="mt-2 text-sm text-red-600">{errors.year}</p>
              {/if}
            </div>

            <!-- Brand -->
            <div>
              <label for="brand" class="block text-sm font-medium text-gray-700">
                Merk <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <input
                  id="brand"
                  type="text"
                  bind:value={form.brand}
                  on:input={handleInputChange}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.brand ? 'border-red-300' : ''}"
                  placeholder="Contoh: Toyota, Honda, Suzuki"
                />
              </div>
              {#if errors.brand}
                <p class="mt-2 text-sm text-red-600">{errors.brand}</p>
              {/if}
            </div>

            <!-- Model -->
            <div>
              <label for="model" class="block text-sm font-medium text-gray-700">
                Model <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <input
                  id="model"
                  type="text"
                  bind:value={form.model}
                  on:input={handleInputChange}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.model ? 'border-red-300' : ''}"
                  placeholder="Contoh: Avanza, Civic, Ertiga"
                />
              </div>
              {#if errors.model}
                <p class="mt-2 text-sm text-red-600">{errors.model}</p>
              {/if}
            </div>

            <!-- Engine Type -->
            <div>
              <label for="engine_type" class="block text-sm font-medium text-gray-700">
                Jenis Mesin
              </label>
              <div class="mt-1">
                <input
                  id="engine_type"
                  type="text"
                  bind:value={form.engine_type}
                  on:input={handleInputChange}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Contoh: 1.5L VTEC, 1.3L, Diesel"
                />
              </div>
            </div>

            <!-- Color -->
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700">
                Warna
              </label>
              <div class="mt-1">
                <input
                  id="color"
                  type="text"
                  bind:value={form.color}
                  on:input={handleInputChange}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Contoh: Putih, Hitam, Silver"
                />
              </div>
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label for="notes" class="block text-sm font-medium text-gray-700">
                Catatan
              </label>
              <div class="mt-1">
                <textarea
                  id="notes"
                  rows="3"
                  bind:value={form.notes}
                  on:input={handleInputChange}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Catatan tambahan tentang kendaraan..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="mt-8 flex justify-end space-x-3">
            <a
              href="/vehicles"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </a>
            <button
              type="submit"
              disabled={loading}
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if loading}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              {:else}
                Simpan Kendaraan
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
