<script>
  import { router } from '@inertiajs/svelte'
  import { fly } from 'svelte/transition'

  import { Toast } from '../../Components/helper.js'

  export let spk = {}
  export let vehicles = []

  let form = {
    vehicle_id: spk.vehicle_id || '',
    service_description: spk.service_description || '',
    estimated_cost: spk.estimated_cost || '',
    actual_cost: spk.actual_cost || '',
    kilometer: spk.kilometer || '',
    keluhan: spk.keluhan || '',
    jam_masuk: spk.jam_masuk || '',
    jam_janji_selesai: spk.jam_janji_selesai || '',
    jarak: spk.jarak || spk.kilometer || '',
    status: spk.status || 'draft',
    notes: spk.notes || ''
  }

  let errors = {}
  let loading = false

  async function handleSubmit() {
    if (!validateForm()) {
      return
    }

    loading = true
    errors = {}

    try {
      const response = await fetch(`/spk/${spk.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Show success toast
        Toast('SPK berhasil diperbarui', 'success')
        
        // Redirect to SPK list after a short delay
        setTimeout(() => {
          window.location.href = '/spk'
        }, 1000)
      } else {
        // Handle validation errors
        if (data.error) {
          errors.general = data.error
          Toast(data.error, 'error')
        } else {
          errors.general = 'Terjadi kesalahan saat memperbarui data'
          Toast('Terjadi kesalahan saat memperbarui data', 'error')
        }
      }
    } catch (error) {
      console.error('Error updating SPK:', error)
      errors.general = 'Terjadi kesalahan jaringan'
      Toast('Terjadi kesalahan jaringan', 'error')
    } finally {
      loading = false
    }
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
    
    if (form.actual_cost && isNaN(parseFloat(form.actual_cost))) {
      newErrors.actual_cost = 'Biaya aktual harus berupa angka'
    }
    
    if (form.kilometer && isNaN(parseInt(form.kilometer))) {
      newErrors.kilometer = 'Kilometer harus berupa angka'
    }
    
    if (form.jarak && isNaN(parseInt(form.jarak))) {
      newErrors.jarak = 'Jarak harus berupa angka'
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

  function handleCostInput(event, field) {
    const value = event.target.value.replace(/[^\d]/g, '')
    form[field] = value
    event.target.value = formatCurrency(value)
  }

  function handleKilometerInput(event) {
    const value = event.target.value.replace(/[^\d]/g, '')
    form.kilometer = value
    // Auto-fill jarak dengan nilai yang sama dengan kilometer
    form.jarak = value
    event.target.value = formatCurrency(value)
  }

  function handleJarakInput(event) {
    const value = event.target.value.replace(/[^\d]/g, '')
    form.jarak = value
    event.target.value = formatCurrency(value)
  }

  function formatTimeFromTimestamp(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toTimeString().slice(0, 5) // Format HH:MM
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

  // Format initial cost values
  function formatInitialCosts() {
    if (form.estimated_cost) {
      const estimatedInput = document.getElementById('estimated_cost')
      if (estimatedInput) estimatedInput.value = formatCurrency(form.estimated_cost)
    }
    if (form.actual_cost) {
      const actualInput = document.getElementById('actual_cost')
      if (actualInput) actualInput.value = formatCurrency(form.actual_cost)
    }
    if (form.kilometer) {
      const kilometerInput = document.getElementById('kilometer')
      if (kilometerInput) kilometerInput.value = formatCurrency(form.kilometer)
    }
    if (form.jarak) {
      const jarakInput = document.getElementById('jarak')
      if (jarakInput) jarakInput.value = formatCurrency(form.jarak)
    }
    // Format time fields if they are timestamps
    if (form.jam_masuk && typeof form.jam_masuk === 'number') {
      form.jam_masuk = formatTimeFromTimestamp(form.jam_masuk)
    }
    if (form.jam_janji_selesai && typeof form.jam_janji_selesai === 'number') {
      form.jam_janji_selesai = formatTimeFromTimestamp(form.jam_janji_selesai)
    }
  }

  // Format costs when component mounts
  import { onMount } from 'svelte'
  onMount(() => {
    setTimeout(formatInitialCosts, 100)
  })
</script>

<svelte:head>
  <title>Edit SPK {spk.spk_number} - SST Bengkel</title>
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
                <a href="/spk" class="text-gray-400 hover:text-gray-500">
                  SPK Digital
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <a href="/spk/{spk.id}" class="ml-4 text-gray-400 hover:text-gray-500">
                    {spk.spk_number}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">Edit</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">Edit SPK {spk.spk_number}</h1>
          <p class="mt-1 text-sm text-gray-600">Perbarui informasi Surat Perintah Kerja</p>
          {#if spk.license_plate}
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <svg class="flex-shrink-0 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              {spk.license_plate} - {spk.brand} {spk.model} ({spk.year}) | {spk.customer_name}
            </div>
          {/if}
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

        <!-- Keluhan Customer -->
        <div>
          <label for="keluhan" class="block text-sm font-medium text-gray-700 mb-2">
            Keluhan Customer
          </label>
          <textarea
            id="keluhan"
            bind:value={form.keluhan}
            on:input={handleInputChange}
            rows="3"
            placeholder="Keluhan atau masalah yang dilaporkan customer..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.keluhan ? 'border-red-300' : ''}"
          ></textarea>
          {#if errors.keluhan}
            <p class="mt-1 text-sm text-red-600">{errors.keluhan}</p>
          {/if}
        </div>

        <!-- Kilometer dan Jarak -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Kilometer -->
          <div>
            <label for="kilometer" class="block text-sm font-medium text-gray-700 mb-2">
              Kilometer Kendaraan
            </label>
            <div class="relative">
              <input
                type="text"
                id="kilometer"
                on:input={handleKilometerInput}
                on:change={handleInputChange}
                placeholder="0"
                class="w-full pr-12 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.kilometer ? 'border-red-300' : ''}"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">KM</span>
              </div>
            </div>
            {#if errors.kilometer}
              <p class="mt-1 text-sm text-red-600">{errors.kilometer}</p>
            {/if}
          </div>

          <!-- Jarak -->
          <div>
            <label for="jarak" class="block text-sm font-medium text-gray-700 mb-2">
              Jarak (KM)
            </label>
            <div class="relative">
              <input
                type="text"
                id="jarak"
                on:input={handleJarakInput}
                on:change={handleInputChange}
                placeholder="0"
                class="w-full pr-12 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.jarak ? 'border-red-300' : ''}"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">KM</span>
              </div>
            </div>
            {#if errors.jarak}
              <p class="mt-1 text-sm text-red-600">{errors.jarak}</p>
            {/if}
            <p class="mt-1 text-sm text-gray-500">Otomatis terisi dari kilometer, bisa diubah manual</p>
          </div>
        </div>

        <!-- Jam Masuk dan Jam Janji Selesai -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Jam Masuk -->
          <div>
            <label for="jam_masuk" class="block text-sm font-medium text-gray-700 mb-2">
              Jam Masuk
            </label>
            <input
              type="time"
              id="jam_masuk"
              bind:value={form.jam_masuk}
              on:change={handleInputChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.jam_masuk ? 'border-red-300' : ''}"
            />
            {#if errors.jam_masuk}
              <p class="mt-1 text-sm text-red-600">{errors.jam_masuk}</p>
            {/if}
            <p class="mt-1 text-sm text-gray-500">Waktu kendaraan masuk bengkel</p>
          </div>

          <!-- Jam Janji Selesai -->
          <div>
            <label for="jam_janji_selesai" class="block text-sm font-medium text-gray-700 mb-2">
              Jam Janji Selesai
            </label>
            <input
              type="time"
              id="jam_janji_selesai"
              bind:value={form.jam_janji_selesai}
              on:change={handleInputChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.jam_janji_selesai ? 'border-red-300' : ''}"
            />
            {#if errors.jam_janji_selesai}
              <p class="mt-1 text-sm text-red-600">{errors.jam_janji_selesai}</p>
            {/if}
            <p class="mt-1 text-sm text-gray-500">Estimasi waktu selesai pekerjaan</p>
          </div>
        </div>

        <!-- Cost Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                on:input={(e) => handleCostInput(e, 'estimated_cost')}
                on:change={handleInputChange}
                placeholder="0"
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.estimated_cost ? 'border-red-300' : ''}"
              />
            </div>
            {#if errors.estimated_cost}
              <p class="mt-1 text-sm text-red-600">{errors.estimated_cost}</p>
            {/if}
          </div>

          <!-- Actual Cost -->
          <div>
            <label for="actual_cost" class="block text-sm font-medium text-gray-700 mb-2">
              Biaya Aktual
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="text"
                id="actual_cost"
                on:input={(e) => handleCostInput(e, 'actual_cost')}
                on:change={handleInputChange}
                placeholder="0"
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent {errors.actual_cost ? 'border-red-300' : ''}"
              />
            </div>
            {#if errors.actual_cost}
              <p class="mt-1 text-sm text-red-600">{errors.actual_cost}</p>
            {/if}
            <p class="mt-1 text-sm text-gray-500">Biaya aktual setelah pekerjaan selesai</p>
          </div>
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
            Status SPK
          </label>
          <select
            id="status"
            bind:value={form.status}
            on:change={handleInputChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <p class="mt-1 text-sm text-gray-500">Status: {getStatusText(form.status)}</p>
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
            href="/spk/{spk.id}"
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
              Simpan Perubahan
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
