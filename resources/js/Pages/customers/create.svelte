<script>
  import { router } from '@inertiajs/svelte'
  import { fly } from 'svelte/transition'


  let form = {
    name: '',
    phone: '',
    address: ''
  }

  let errors = {}
  let loading = false

  function handleSubmit() {
    if (!validateForm()) {
      return
    }

    loading = true
    errors = {}

    router.post('/customers', form, {
      onSuccess: () => {
        router.visit('/customers', {
          data: { success: 'Pelanggan berhasil ditambahkan' }
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
    
    if (!form.name.trim()) {
      newErrors.name = 'Nama pelanggan wajib diisi'
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi'
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
</script>

<svelte:head>
  <title>Tambah Pelanggan - SST Bengkel</title>
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
                  <span class="sr-only">Pelanggan</span>
                  Pelanggan
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">Tambah Pelanggan</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">Tambah Pelanggan Baru</h1>
          <p class="mt-1 text-sm text-gray-600">Masukkan informasi pelanggan baru</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div class="grid grid-cols-1 gap-6">
            <!-- Name Field -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Nama Pelanggan <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <input
                  id="name"
                  type="text"
                  bind:value={form.name}
                  on:input={handleInputChange}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.name ? 'border-red-300' : ''}"
                  placeholder="Masukkan nama lengkap pelanggan"
                />
              </div>
              {#if errors.name}
                <p class="mt-2 text-sm text-red-600">{errors.name}</p>
              {/if}
            </div>

            <!-- Phone Field -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Nomor Telepon <span class="text-red-500">*</span>
              </label>
              <div class="mt-1">
                <input
                  id="phone"
                  type="tel"
                  bind:value={form.phone}
                  on:input={handleInputChange}
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md {errors.phone ? 'border-red-300' : ''}"
                  placeholder="Contoh: 08123456789"
                />
              </div>
              {#if errors.phone}
                <p class="mt-2 text-sm text-red-600">{errors.phone}</p>
              {/if}
              <p class="mt-2 text-sm text-gray-500">Nomor telepon yang dapat dihubungi</p>
            </div>


            <!-- Address Field -->
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <div class="mt-1">
                <textarea
                  id="address"
                  rows="3"
                  bind:value={form.address}
                  on:input={handleInputChange}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Masukkan alamat lengkap pelanggan"
                ></textarea>
              </div>
              <p class="mt-2 text-sm text-gray-500">Alamat rumah atau kantor pelanggan</p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="mt-8 flex justify-end space-x-3">
            <a
              href="/customers"
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
                Simpan Pelanggan
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
