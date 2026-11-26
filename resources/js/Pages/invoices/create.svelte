<script>
  import { router } from '@inertiajs/svelte'
  import { fly } from 'svelte/transition'


  export let availableSPKs = []

  let form = {
    spk_id: '',
    tax_amount: '',
    discount_amount: '',
    notes: ''
  }

  let errors = {}
  let loading = false
  let selectedSPK = null

  // Reactive calculations
  $: {
    if (form.spk_id) {
      selectedSPK = availableSPKs.find(spk => spk.id === form.spk_id)
    } else {
      selectedSPK = null
    }
  }

  $: subtotal = selectedSPK ? parseFloat(selectedSPK.actual_cost || 0) : 0
  $: taxAmount = parseFloat(form.tax_amount || 0)
  $: discountAmount = parseFloat(form.discount_amount || 0)
  $: totalAmount = subtotal + taxAmount - discountAmount

  function handleSubmit() {
    if (!validateForm()) {
      return
    }

    loading = true
    errors = {}

    router.post('/invoices', form, {
      onSuccess: () => {
        router.visit('/invoices', {
          data: { success: 'Invoice berhasil dibuat' }
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
    
    if (!form.spk_id) {
      newErrors.spk_id = 'SPK wajib dipilih'
    }
    
    if (form.tax_amount && isNaN(parseFloat(form.tax_amount))) {
      newErrors.tax_amount = 'Pajak harus berupa angka'
    }
    
    if (form.discount_amount && isNaN(parseFloat(form.discount_amount))) {
      newErrors.discount_amount = 'Diskon harus berupa angka'
    }
    
    if (totalAmount < 0) {
      newErrors.general = 'Total invoice tidak boleh negatif'
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

  function formatCurrencyDisplay(value) {
    if (!value) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value)
  }

  function handleAmountInput(event, field) {
    const value = event.target.value.replace(/[^\d]/g, '')
    form[field] = value
    event.target.value = formatCurrency(value)
  }

  function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
</script>

<svelte:head>
  <title>Buat Invoice Baru - SST Bengkel</title>
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
                <a href="/invoices" class="text-gray-400 hover:text-gray-500">
                  Invoice Otomatis
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">Buat Invoice Baru</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">Buat Invoice Baru</h1>
          <p class="mt-1 text-sm text-gray-600">Buat invoice otomatis berdasarkan SPK yang telah selesai</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Form Content -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-2">
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

            <!-- SPK Selection -->
            <div>
              <label for="spk_id" class="block text-sm font-medium text-gray-700 mb-2">
                Pilih SPK <span class="text-red-500">*</span>
              </label>
              <select
                id="spk_id"
                bind:value={form.spk_id}
                on:change={handleInputChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent {errors.spk_id ? 'border-red-300' : ''}"
              >
                <option value="">Pilih SPK yang sudah selesai</option>
                {#each availableSPKs as spk}
                  <option value={spk.id}>
                    {spk.spk_number} - {spk.license_plate} ({spk.customer_name})
                  </option>
                {/each}
              </select>
              {#if errors.spk_id}
                <p class="mt-1 text-sm text-red-600">{errors.spk_id}</p>
              {/if}
              {#if availableSPKs.length === 0}
                <p class="mt-1 text-sm text-gray-500">Tidak ada SPK yang siap untuk dibuatkan invoice. SPK harus berstatus "Selesai" untuk dapat dibuatkan invoice.</p>
              {/if}
            </div>

            <!-- Tax Amount -->
            <div>
              <label for="tax_amount" class="block text-sm font-medium text-gray-700 mb-2">
                Pajak (PPN)
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="text"
                  id="tax_amount"
                  on:input={(e) => handleAmountInput(e, 'tax_amount')}
                  on:change={handleInputChange}
                  placeholder="0"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent {errors.tax_amount ? 'border-red-300' : ''}"
                />
              </div>
              {#if errors.tax_amount}
                <p class="mt-1 text-sm text-red-600">{errors.tax_amount}</p>
              {/if}
              <p class="mt-1 text-sm text-gray-500">Pajak yang dikenakan (biasanya 11% dari subtotal)</p>
            </div>

            <!-- Discount Amount -->
            <div>
              <label for="discount_amount" class="block text-sm font-medium text-gray-700 mb-2">
                Diskon
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="text"
                  id="discount_amount"
                  on:input={(e) => handleAmountInput(e, 'discount_amount')}
                  on:change={handleInputChange}
                  placeholder="0"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent {errors.discount_amount ? 'border-red-300' : ''}"
                />
              </div>
              {#if errors.discount_amount}
                <p class="mt-1 text-sm text-red-600">{errors.discount_amount}</p>
              {/if}
              <p class="mt-1 text-sm text-gray-500">Diskon yang diberikan kepada pelanggan</p>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Catatan Invoice
              </label>
              <textarea
                id="notes"
                bind:value={form.notes}
                on:input={handleInputChange}
                rows="3"
                placeholder="Catatan atau keterangan tambahan untuk invoice..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a
                href="/invoices"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Batal
              </a>
              <button
                type="submit"
                disabled={loading || !form.spk_id}
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if loading}
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Membuat Invoice...
                {:else}
                  Buat Invoice
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Preview Sidebar -->
      <div class="space-y-6">
        <!-- Invoice Preview -->
        <div class="bg-white shadow sm:rounded-lg" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Preview Invoice</h3>
            
            {#if selectedSPK}
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">SPK</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{selectedSPK.spk_number}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Kendaraan</dt>
                  <dd class="mt-1 text-sm text-gray-900">{selectedSPK.license_plate}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Pelanggan</dt>
                  <dd class="mt-1 text-sm text-gray-900">{selectedSPK.customer_name}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Tanggal Selesai</dt>
                  <dd class="mt-1 text-sm text-gray-900">{formatDate(selectedSPK.tanggal_keluar)}</dd>
                </div>
              </dl>
              
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Rincian Biaya</h4>
                <dl class="space-y-2">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Subtotal</dt>
                    <dd class="text-sm text-gray-900">{formatCurrencyDisplay(subtotal)}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Pajak</dt>
                    <dd class="text-sm text-gray-900">{formatCurrencyDisplay(taxAmount)}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Diskon</dt>
                    <dd class="text-sm text-gray-900">-{formatCurrencyDisplay(discountAmount)}</dd>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200">
                    <dt class="text-sm font-medium text-gray-900">Total</dt>
                    <dd class="text-sm font-bold text-gray-900">{formatCurrencyDisplay(totalAmount)}</dd>
                  </div>
                </dl>
              </div>
            {:else}
              <p class="text-sm text-gray-500">Pilih SPK untuk melihat preview invoice</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
