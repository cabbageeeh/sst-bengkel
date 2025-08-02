<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { fly } from 'svelte/transition'
  import SSTHeader from '../../Components/SSTHeader.svelte'

  export let vehicles = []

  let form = {
    vehicle_id: '',
    service_description: '',
    estimated_cost: '',
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

    router.post('/spk', form, {
      onSuccess: () => {
        router.visit('/spk', {
          data: { success: 'SPK berhasil dibuat' }
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
    
    if (!form.vehicle_id) {
      newErrors.vehicle_id = 'Kendaraan wajib dipilih'
    }
    
    if (!form.service_description.trim()) {
      newErrors.service_description = 'Deskripsi servis wajib diisi'
    }
    
    if (form.estimated_cost && isNaN(parseFloat(form.estimated_cost))) {
      newErrors.estimated_cost = 'Estimasi biaya harus berupa angka'
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

  function formatCurrency(value) {
    if (!value) return ''
    return new Intl.NumberFormat('id-ID').format(value)
  }

  function handleCostInput(event) {
    const value = event.target.value.replace(/[^\d]/g, '')
    form.estimated_cost = value
    event.target.value = formatCurrency(value)
  }
</script>

<svelte:head>
  <title>Buat SPK Baru - SST Bengkel</title>
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
                  <span class="ml-4 text-sm font-medium text-gray-500">Buat SPK Baru</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">Buat SPK Baru</h1>
          <p class="mt-1 text-sm text-gray-600">Buat Surat Perintah Kerja digital untuk kendaraan pelanggan</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Form Content -->
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
      <form on:submit|preventDefault={handleSubmit} class="space-y-6 p-6">
        <!-- General Error -->
        {#if errors.general}
          <div class="rounded-md bg-red-50 p-4">
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

        <!-- Vehicle Selection -->
        <div>
          <label for="vehicle_id" class="block text-sm font-medium text-gray-700 mb-2">
            Kendaraan <span class="text-red-500">*</span>
          </label>
          <select
            id="vehicle_id"
            bind:value={form.vehicle_id}
            on:change={handleInputChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.vehicle_id ? 'border-red-300' : ''}"
          >
            <option value="">Pilih Kendaraan</option>
            {#each vehicles as vehicle}
              <option value={vehicle.id}>
                {vehicle.license_plate} - {vehicle.brand} {vehicle.model} ({vehicle.customer_name})
              </option>
            {/each}
          </select>
          {#if errors.vehicle_id}
            <p class="mt-1 text-sm text-red-600">{errors.vehicle_id}</p>
          {/if}
        </div>

        <!-- Service Description -->
        <div>
          <label for="service_description" class="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Servis <span class="text-red-500">*</span>
          </label>
          <textarea
            id="service_description"
            bind:value={form.service_description}
            on:input={handleInputChange}
            rows="4"
            placeholder="Jelaskan detail pekerjaan yang akan dilakukan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.service_description ? 'border-red-300' : ''}"
          ></textarea>
          {#if errors.service_description}
            <p class="mt-1 text-sm text-red-600">{errors.service_description}</p>
          {/if}
        </div>

        <!-- Estimated Cost -->
        <div>
          <label for="estimated_cost" class="block text-sm font-medium text-gray-700 mb-2">
            Estimasi Biaya
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="text"
              id="estimated_cost"
              on:input={handleCostInput}
              on:change={handleInputChange}
              placeholder="0"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.estimated_cost ? 'border-red-300' : ''}"
            />
          </div>
          {#if errors.estimated_cost}
            <p class="mt-1 text-sm text-red-600">{errors.estimated_cost}</p>
          {/if}
          <p class="mt-1 text-sm text-gray-500">Estimasi biaya dapat diubah nanti saat SPK dikerjakan</p>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Catatan Tambahan
          </label>
          <textarea
            id="notes"
            bind:value={form.notes}
            on:input={handleInputChange}
            rows="3"
            placeholder="Catatan atau instruksi khusus..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <a
            href="/spk"
            use:inertia
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Batal
          </a>
          <button
            type="submit"
            disabled={loading}
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            {:else}
              Buat SPK
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
