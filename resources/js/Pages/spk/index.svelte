<script>
  import { router } from '@inertiajs/svelte'
  import { fade } from 'svelte/transition'
  import { onMount, tick } from 'svelte'
  import SpkIcon from '../../Components/SpkIcon.svelte'
  import { Toast } from '../../Components/helper.js'

  export let spks = []
  export let pagination = {}
  export let search = ''
  export let status = ''
  export let success = null
  export let summary = { total: 0, draft: 0, in_progress: 0, completed: 0, cancelled: 0 }

  let searchInput = search
  let statusFilter = status
  let showSuccess = !!success
  let activeId = spks[0]?.id || null
  let sidebarOpen = false
  let isLoading = false
  let loadError = ''
  let today = ''
  let previousFocus
  let successTimer

  const summaryCards = [
    { key: 'total', label: 'Total SPK' }, { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'Dikerjakan' }, { key: 'completed', label: 'Selesai' }
  ]
  const statusTabs = [
    { key: '', label: 'Semua' }, { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'Dikerjakan' }, { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' }
  ]
  $: if (activeId && !spks.some(spk => spk.id === activeId)) activeId = spks[0]?.id || null
  $: activeSPK = spks.find(spk => spk.id === activeId) || null
  $: rangeStart = pagination.total_items ? ((pagination.current_page - 1) * pagination.per_page) + 1 : 0
  $: rangeEnd = Math.min((pagination.current_page || 1) * (pagination.per_page || 10), pagination.total_items || 0)
  $: visiblePages = Array.from({ length: Math.min(5, pagination.total_pages || 0) }, (_, index) => Math.max(1, Math.min((pagination.current_page || 1) - 2, (pagination.total_pages || 1) - 4)) + index)
  $: statusFilter = status
  $: searchInput = search
  $: if (success) {
    showSuccess = true
    clearTimeout(successTimer)
    successTimer = setTimeout(() => showSuccess = false, 5000)
  }

  onMount(() => {
    return () => clearTimeout(successTimer)
  })

  function vehicleName(spk) {
    return [spk.brand, spk.model].filter(Boolean).join(' ') + (spk.year ? ` · ${spk.year}` : '') || 'Kendaraan belum diisi'
  }

  async function selectSPK(id) {
    activeId = id
    await tick()
    if (window.matchMedia('(max-width: 1250px)').matches) {
      document.querySelector('.detail-panel')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
  }

  function visitPage(page = 1) {
    router.get('/spk', {
      page, limit: pagination.per_page || 10,
      ...(searchInput.trim() ? { search: searchInput.trim() } : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    }, {
      preserveState: true, preserveScroll: true,
      onStart: () => { isLoading = true; loadError = '' },
      onSuccess: (page) => { activeId = page.props.spks[0]?.id || null },
      onError: () => { loadError = 'Daftar SPK belum berhasil dimuat. Silakan coba lagi.' },
      onFinish: () => { isLoading = false }
    })
  }

  function filterByStatus(value) { statusFilter = value; visitPage() }
  function clearSearch() { searchInput = ''; visitPage() }
  function resetFilters() { searchInput = ''; statusFilter = ''; visitPage() }

  function exportCurrentPage() {
    const cell = value => {
      let text = String(value ?? '')
      if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
      return '"' + text.replaceAll('"', '""') + '"'
    }
    const rows = [['Nomor SPK', 'Plat nomor', 'Kendaraan', 'Pelanggan', 'Status', 'Estimasi biaya', 'Tanggal masuk', 'Deskripsi pekerjaan'], ...spks.map(spk => [spk.spk_number, spk.license_plate, vehicleName(spk), spk.customer_name, getStatusText(spk.status), spk.estimated_cost, formatDate(spk.tanggal_masuk), spk.service_description])]
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `spk-halaman-${pagination.current_page || 1}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function handleWindowKeydown(event) {
    if (showCompleteModal && event.key === 'Tab') trapModalFocus(event)
    if (event.key === 'Escape') {
      sidebarOpen = false
      if (showCompleteModal && !isSubmitting) closeCompleteModal()
    }
  }

  function trapModalFocus(event) {
    if (event.key !== 'Tab') return
    const elements = document.querySelector('.modal-card')?.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], select:not(:disabled), [tabindex="0"]')
    if (!elements?.length) return
    const first = elements[0], last = elements[elements.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  
  // Modal state for completing SPK
  let showCompleteModal = false
  let selectedSPK = null
  let serviceCost = ''
  let serviceCostDisplay = ''
  let sparepartItems = []
  let isSubmitting = false

  function handleSearch() {
    visitPage()
  }
  
  function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  function formatCurrency(amount) {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  function getStatusText(status) {
    const texts = {
      'draft': 'Draft',
      'in_progress': 'Dikerjakan',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    }
    return texts[status] || status
  }
  
  function formatNumberInput(value) {
    // Remove all non-digits
    const numbersOnly = value.replace(/\D/g, '')
    
    // Format with thousand separators
    if (numbersOnly === '') return ''
    
    return new Intl.NumberFormat('id-ID').format(parseInt(numbersOnly))
  }
  
  function parseNumberInput(value) {
    // Remove all non-digits and return as string
    return value.replace(/\D/g, '')
  }
  
  function handleServiceCostInput(event) {
    const value = event.target.value
    serviceCost = parseNumberInput(value)
    serviceCostDisplay = formatNumberInput(value)
  }

  function addSparepartItem() {
    sparepartItems = [...sparepartItems, {
      item_name: '',
      quantity: 1,
      unit_price: '',
      unit_price_display: '',
      total_price: 0
    }]
  }

  function removeSparepartItem(index) {
    sparepartItems = sparepartItems.filter((_, i) => i !== index)
  }

  function handleSparepartInput(index, field, event) {
    const value = event.target.value
    const updatedItems = [...sparepartItems]
    
    if (field === 'unit_price') {
      updatedItems[index].unit_price = parseNumberInput(value)
      updatedItems[index].unit_price_display = formatNumberInput(value)
    } else if (field === 'quantity') {
      updatedItems[index].quantity = parseInt(value) || 1
    } else {
      updatedItems[index][field] = value
    }
    
    // Calculate total price
    const quantity = updatedItems[index].quantity || 1
    const unitPrice = parseFloat(updatedItems[index].unit_price) || 0
    updatedItems[index].total_price = quantity * unitPrice
    
    sparepartItems = updatedItems
  }

  function calculateTotalCost() {
    const serviceTotal = parseFloat(serviceCost) || 0
    const sparepartTotal = sparepartItems.reduce((total, item) => {
      return total + (item.total_price || 0)
    }, 0)
    return serviceTotal + sparepartTotal
  }
  
  async function deleteSPK(spk) {
    let confirmMessage = `Apakah Anda yakin ingin menghapus SPK "${spk.spk_number}"?`;
    
    // Note: We could add invoice count check here in the future
    // For now, we'll show a general warning about related data
    confirmMessage += '\n\nPeringatan: Semua data SPK items dan invoice yang terkait akan ikut terhapus secara permanen.';
    
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/spk/${spk.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (response.ok) {
          // Show success toast
          Toast(data.message || 'SPK berhasil dihapus', 'success')
          
          // Refresh the page to update the list
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          // Show error toast
          Toast(data.error || 'Terjadi kesalahan saat menghapus SPK', 'error')
        }
      } catch (error) {
        console.error('Error deleting SPK:', error)
        Toast('Terjadi kesalahan jaringan', 'error')
      }
    }
  }
  
  async function openCompleteModal(spk) {
    previousFocus = document.activeElement
    selectedSPK = spk
    // Initialize with estimated cost as service cost if available
    if (spk.estimated_cost) {
      serviceCost = spk.estimated_cost.toString()
      serviceCostDisplay = formatNumberInput(serviceCost)
    } else {
      serviceCost = ''
      serviceCostDisplay = ''
    }
    // Initialize with one empty sparepart item
    sparepartItems = [{
      item_name: '',
      quantity: 1,
      unit_price: '',
      unit_price_display: '',
      total_price: 0
    }]
    showCompleteModal = true
    await tick()
    document.getElementById('serviceCost')?.focus()
  }
  
  function closeCompleteModal() {
    showCompleteModal = false
    selectedSPK = null
    serviceCost = ''
    serviceCostDisplay = ''
    sparepartItems = []
    isSubmitting = false
    previousFocus?.focus()
  }
  
  async function completeSPK() {
    // Validate service cost
    if (!selectedSPK || !serviceCost.trim()) {
      Toast('Biaya service harus diisi', 'error')
      return
    }
    
    if (isNaN(parseFloat(serviceCost))) {
      Toast('Biaya service harus berupa angka yang valid', 'error')
      return
    }

    // Validate sparepart items
    const validSparepartItems = sparepartItems.filter(item => item.item_name.trim())
    
    for (const item of validSparepartItems) {
      if (!item.item_name.trim()) {
        Toast('Nama sparepart harus diisi', 'error')
        return
      }
      if (!item.quantity || item.quantity <= 0) {
        Toast('Quantity sparepart harus lebih dari 0', 'error')
        return
      }
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        Toast('Harga satuan sparepart harus lebih dari 0', 'error')
        return
      }
    }
    
    isSubmitting = true
    
    try {
      const response = await fetch(`/spk/${selectedSPK.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          service_cost: parseFloat(serviceCost),
          sparepart_items: validSparepartItems.map(item => ({
            item_name: item.item_name.trim(),
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            description: item.description || ''
          }))
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        Toast(data.message || 'SPK berhasil diselesaikan', 'success')
        closeCompleteModal()
        
        // Refresh the page to update the list
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        Toast(data.error || 'Terjadi kesalahan saat menyelesaikan SPK', 'error')
      }
    } catch (error) {
      console.error('Error completing SPK:', error)
      Toast('Terjadi kesalahan jaringan', 'error')
    } finally {
      isSubmitting = false
    }
  }
  
</script>

<svelte:head>
  <title>Perintah kerja - SST Bengkel</title>
</svelte:head>

<svelte:window on:keydown={handleWindowKeydown} />

<!-- Cross-page links use document navigation for compatibility with the legacy Inertia adapter. List filters still use router.get. -->
<div class="spk-workspace" inert={showCompleteModal}>
<section class="page-content" id="spk-content" aria-label="Perintah kerja">
      <div class="page-heading">
        <div><h1>Perintah kerja</h1><p>Pantau servis kendaraan dari masuk hingga selesai.</p></div>
        <div class="heading-actions">
          <button class="button button-outline export-button" on:click={exportCurrentPage} disabled={!spks.length || isLoading} title="Unduh daftar pada halaman ini sebagai CSV"><SpkIcon name="download" size={18} />Ekspor halaman</button>
          <a href="/spk/create" class="button button-red"><SpkIcon name="plus" size={20} />Buat SPK</a>
        </div>
      </div>

      {#if showSuccess}
        <div class="success-notice" role="status"><SpkIcon name="check" /><span>{success}</span><button class="icon-button" aria-label="Tutup pesan" on:click={() => showSuccess = false}><SpkIcon name="close" size={18} /></button></div>
      {/if}
      {#if loadError}<div class="error-notice" role="alert">{loadError}<button on:click={handleSearch}>Coba lagi</button></div>{/if}

      <section class="summary" aria-label="Ringkasan perintah kerja">
        <div class="summary-heading">Ringkasan SPK <span>{search ? 'Sesuai pencarian' : 'Seluruh data'}</span></div>
        <div class="summary-grid">
          {#each summaryCards as card}
            <div class="summary-item"><span class="summary-label">{#if card.key !== 'total'}<span class="status-dot {card.key}"></span>{/if}{card.label}</span><strong>{summary[card.key] ?? 0}</strong></div>
          {/each}
        </div>
      </section>

      <div class="work-grid" class:detail-open={!!activeSPK}>
        <section class="list-panel" aria-label="Daftar SPK" aria-busy={isLoading}>
          <div class="status-tabs" role="group" aria-label="Filter status SPK">
            {#each statusTabs as tab}
              <button class:tab-active={status === tab.key} aria-pressed={status === tab.key} on:click={() => filterByStatus(tab.key)} disabled={isLoading}>{tab.label}<span>{summary[tab.key || 'total'] ?? 0}</span></button>
            {/each}
          </div>
          <form class="search-toolbar" on:submit|preventDefault={handleSearch}>
            <div class="search-box"><SpkIcon name="search" size={18} /><label class="sr-only" for="spk-search">Cari nomor SPK, plat nomor, atau pelanggan</label><input id="spk-search" type="search" bind:value={searchInput} placeholder="Cari nomor SPK, plat, atau pelanggan…" /></div>
            <button class="button button-outline" type="submit" disabled={isLoading}>{isLoading ? 'Mencari…' : 'Cari'}</button>
            {#if search}<button type="button" class="clear-search" on:click={clearSearch} disabled={isLoading}>Reset</button>{/if}
            <span class="result-count">{pagination.total_items || 0} SPK</span>
          </form>

          {#if spks.length > 0}
            <div class="table-scroll">
              <table class="spk-table">
                <thead><tr><th scope="col">SPK / Kendaraan</th><th scope="col">Pelanggan</th><th scope="col">Status</th><th scope="col" class="money-cell">Estimasi</th><th scope="col"><span class="sr-only">Detail</span></th></tr></thead>
                <tbody>
                  {#each spks as spk (spk.id)}
                    <tr class:row-selected={activeSPK?.id === spk.id}>
                      <td><button class="select-spk" aria-label="Lihat detail {spk.spk_number}, {spk.license_plate}" aria-pressed={activeSPK?.id === spk.id} on:click={() => selectSPK(spk.id)}><span class="spk-number">{spk.spk_number}</span><strong>{spk.license_plate || 'Plat belum diisi'}</strong><span class="vehicle-model">{vehicleName(spk)}</span></button></td>
                      <td class="customer-cell">{spk.customer_name || '—'}</td>
                      <td><span class="status-badge {spk.status}"><span class="status-dot {spk.status}"></span>{getStatusText(spk.status)}</span></td>
                      <td class="money-cell">{formatCurrency(spk.estimated_cost)}</td>
                      <td><button class="row-detail icon-button" aria-label="Pilih {spk.spk_number}" on:click={() => selectSPK(spk.id)}><SpkIcon name="right" size={17} /></button></td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="empty-state"><span class="empty-icon"><SpkIcon name="clipboard" size={32} /></span><h2>{search || status ? 'SPK tidak ditemukan' : 'Belum ada perintah kerja'}</h2><p>{search || status ? 'Coba kata pencarian lain atau tampilkan semua status.' : 'Buat SPK untuk mulai mencatat servis kendaraan pelanggan.'}</p>{#if search || status}<button class="button button-outline" on:click={resetFilters}>Tampilkan semua SPK</button>{:else}<a class="button button-red" href="/spk/create"><SpkIcon name="plus" size={18} />Buat SPK pertama</a>{/if}</div>
          {/if}

          <div class="pagination-footer"><span>{pagination.total_items ? `Menampilkan ${rangeStart}–${rangeEnd} dari ${pagination.total_items} SPK` : '0 SPK'}</span>
            {#if pagination.total_pages > 1}<nav class="pagination" aria-label="Halaman daftar SPK"><button disabled={pagination.current_page <= 1 || isLoading} aria-label="Halaman sebelumnya" on:click={() => visitPage(pagination.current_page - 1)}><SpkIcon name="left" size={16} /></button>{#each visiblePages as page}<button class:page-active={page === pagination.current_page} aria-current={page === pagination.current_page ? 'page' : undefined} on:click={() => visitPage(page)} disabled={isLoading}>{page}</button>{/each}<button disabled={pagination.current_page >= pagination.total_pages || isLoading} aria-label="Halaman berikutnya" on:click={() => visitPage(pagination.current_page + 1)}><SpkIcon name="right" size={16} /></button></nav>{/if}
          </div>
        </section>

        {#if activeSPK}
          <aside class="detail-panel" aria-label="Detail SPK terpilih" aria-live="polite">
            <div class="detail-caption"><span>DETAIL SPK</span><button class="icon-button" aria-label="Tutup detail SPK" on:click={() => activeId = null}><SpkIcon name="close" size={20} /></button></div>
            <div class="detail-title"><h2>{activeSPK.spk_number}</h2><span class="status-badge {activeSPK.status}"><span class="status-dot {activeSPK.status}"></span>{getStatusText(activeSPK.status)}</span></div>
            <div class="vehicle-identity"><span class="vehicle-icon"><SpkIcon name="car" size={30} /></span><div><strong>{activeSPK.license_plate || 'Plat belum diisi'}</strong><span>{vehicleName(activeSPK)}</span></div></div>
            <dl class="detail-facts"><div><dt>Pelanggan</dt><dd>{activeSPK.customer_name || '—'}</dd></div><div><dt>Tanggal masuk</dt><dd>{formatDate(activeSPK.tanggal_masuk)}</dd></div></dl>
            <section class="job-description"><h3>Deskripsi pekerjaan</h3><p>{activeSPK.service_description || 'Belum ada deskripsi pekerjaan.'}</p></section>
            <section class="estimate"><h3>Estimasi biaya</h3><strong>{formatCurrency(activeSPK.estimated_cost)}</strong><p>Biaya akhir ditentukan saat servis selesai.</p></section>
            <div class="detail-actions">
              {#if activeSPK.status === 'in_progress'}<button class="button button-navy complete-button" on:click={() => openCompleteModal(activeSPK)}><SpkIcon name="check" />Selesaikan servis</button>{/if}
              <div class="secondary-actions"><a href="/spk/{activeSPK.id}/pdf" target="_blank" rel="noopener" class="button button-outline"><SpkIcon name="print" size={18} />Cetak SPK</a><a href="/spk/{activeSPK.id}/edit" class="button button-outline"><SpkIcon name="edit" size={18} />Edit</a></div>
              <a class="detail-link" href="/spk/{activeSPK.id}">Lihat detail lengkap<SpkIcon name="arrow" size={16} /></a>
              <button class="delete-link" on:click={() => deleteSPK(activeSPK)}><SpkIcon name="trash" size={15} />Hapus SPK</button>
            </div>
          </aside>
        {/if}
      </div>
      <footer class="page-footer"><span>SST Bengkel</span><span>Specialist Suzuki Technology</span></footer>
    </section>
</div>
<!-- Modal Selesai SPK -->
{#if showCompleteModal}
  <div class="spk-modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" transition:fade>
    <div class="modal-card relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white" role="dialog" aria-modal="true" aria-labelledby="complete-modal-title" tabindex="-1">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div class="mt-3 text-center">
          <h3 id="complete-modal-title" class="text-lg leading-6 font-medium text-gray-900">Selesaikan SPK</h3>
          {#if selectedSPK}
            <div class="mt-2 mb-6">
              <p class="text-sm text-gray-500">SPK: <span class="font-semibold">{selectedSPK.spk_number}</span></p>
              <p class="text-sm text-gray-500">{selectedSPK.license_plate} - {selectedSPK.customer_name}</p>
              <p class="text-sm text-gray-500">Estimasi: {formatCurrency(selectedSPK.estimated_cost)}</p>
            </div>
            
            <!-- Service Cost Section -->
            <div class="mb-6 text-left">
              <h4 class="text-md font-medium text-gray-900 mb-3">Biaya Service</h4>
              <div class="mb-4">
                <label for="serviceCost" class="block text-sm font-medium text-gray-700 mb-2">
                  Biaya Service (Rp)
                </label>
                <input
                  type="text"
                  id="serviceCost"
                  value={serviceCostDisplay}
                  on:input={handleServiceCostInput}
                  placeholder="Masukkan biaya service"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <!-- Sparepart Section -->
            <div class="mb-6 text-left">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-md font-medium text-gray-900">Sparepart</h4>
                <button 
                  type="button" 
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  on:click={addSparepartItem} 
                  disabled={isSubmitting}
                >
                  + Tambah Item
                </button>
              </div>
              
              {#if sparepartItems.length > 0}
                <div class="border border-gray-300 rounded-md overflow-hidden">
                  <div class="bg-gray-50 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
                    <div class="col-span-4">Nama Item</div>
                    <div class="col-span-2">Qty</div>
                    <div class="col-span-3">Harga Satuan</div>
                    <div class="col-span-2">Total</div>
                    <div class="col-span-1">Aksi</div>
                  </div>
                  
                  {#each sparepartItems as item, index}
                    <div class="grid grid-cols-12 gap-2 p-3 border-t border-gray-200">
                      <div class="col-span-4">
                        <input 
                          type="text" 
                          bind:value={item.item_name}
                          on:input={(e) => handleSparepartInput(index, 'item_name', e)}
                          placeholder="Nama sparepart"
                          aria-label="Nama sparepart {index + 1}"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-2">
                        <input 
                          type="number" 
                          bind:value={item.quantity}
                          on:input={(e) => handleSparepartInput(index, 'quantity', e)}
                          min="1"
                          aria-label="Jumlah sparepart {index + 1}"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-3">
                        <input 
                          type="text" 
                          bind:value={item.unit_price_display}
                          on:input={(e) => handleSparepartInput(index, 'unit_price', e)}
                          placeholder="0"
                          aria-label="Harga satuan sparepart {index + 1}"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div class="col-span-2 flex items-center">
                        <span class="text-sm">{formatCurrency(item.total_price)}</span>
                      </div>
                      <div class="col-span-1">
                        <button 
                          type="button" 
                          class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500" 
                          on:click={() => removeSparepartItem(index)}
                          disabled={isSubmitting || sparepartItems.length === 1}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Total Cost Summary -->
            <div class="mb-6 bg-gray-50 p-4 rounded-md">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Total Biaya Service:</span>
                  <span>{formatCurrency(parseFloat(serviceCost) || 0)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Total Biaya Sparepart:</span>
                  <span>{formatCurrency(sparepartItems.reduce((total, item) => total + (item.total_price || 0), 0))}</span>
                </div>
                <div class="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total Keseluruhan:</span>
                  <span>{formatCurrency(calculateTotalCost())}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
        <div class="items-center px-4 py-3">
          <div class="flex justify-end space-x-3">
            <button
              on:click={closeCompleteModal}
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              on:click={completeSPK}
              class="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !serviceCost.trim()}
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              {:else}
                Selesaikan SPK
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>

  .spk-workspace { --navy:#11283e; --red:#db2534; --border:#e1e6ed; --muted:#667085; min-height:100vh; overflow-x:clip; background:#f8fafc; color:#162033; font-family:'Inter',Arial,sans-serif; font-size:14px; line-height:1.5; color-scheme:light; }
  .spk-workspace :global(*), :global(.spk-modal *) { box-sizing:border-box; }
  .spk-workspace :global(button), .spk-workspace :global(a) { -webkit-tap-highlight-color:transparent; }
  .spk-workspace :global(button:focus-visible), .spk-workspace :global(a:focus-visible), .spk-workspace :global(input:focus-visible) { outline:3px solid #93b4fa; outline-offset:3px; }
  .page-content { max-width:1720px; margin:auto; padding:28px 30px 20px; }
  .page-heading { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-bottom:23px; }
  h1 { font-size:28px; font-weight:750; letter-spacing:-.035em; line-height:1.2; margin:0 0 7px; }
  .page-heading p { margin:0; color:var(--muted); font-size:13px; }
  .heading-actions { display:flex; gap:10px; flex-shrink:0; }
  .button { display:inline-flex; justify-content:center; align-items:center; gap:8px; min-height:39px; padding:9px 14px; border:1px solid transparent; border-radius:6px; font-weight:600; font-size:12px; line-height:1.4; text-decoration:none; cursor:pointer; transition:background .15s; white-space:nowrap; }
  .button-outline { background:#fff; color:#27354a; border-color:#cbd3df; }
  .button-outline:hover { background:#f3f6fa; border-color:#94a3b8; }
  .button-red { background:var(--red); color:white; }
  .button-red:hover { background:#be1c2b; }
  .button-navy { background:var(--navy); color:#fff; }
  .button-navy:hover { background:#203f5b; }
  button:disabled { opacity:.48; cursor:not-allowed; }
  .icon-button { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:transparent; color:inherit; border:0; border-radius:5px; cursor:pointer; flex-shrink:0; }
  .icon-button:hover { background:#e8eef6; color:#172b43; }
  .summary { border:1px solid var(--border); border-radius:8px; background:white; padding:13px 17px 17px; margin-bottom:20px; }
  .summary-heading { font-size:11px; font-weight:600; margin-bottom:10px; }
  .summary-heading > span { color:#7a8697; font-size:10px; margin-left:9px; font-weight:400; }
  .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); }
  .summary-item { display:flex; flex-direction:column; padding:0 20px; border-left:1px solid var(--border); }
  .summary-item:first-child { padding-left:7px; border-left:0; }
  .summary-label { display:flex; align-items:center; gap:7px; font-size:12px; color:#526075; }
  .summary-item strong { font-size:27px; font-weight:700; line-height:1.3; letter-spacing:-.03em; margin-top:3px; }
  .status-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#98a2b3; flex-shrink:0; }
  .status-dot.in_progress { background:#1974e6; }.status-dot.completed { background:#16a05a; }.status-dot.cancelled { background:#de4052; }
  .work-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:18px; align-items:start; }
  .work-grid.detail-open { grid-template-columns:minmax(0,1.9fr) minmax(305px,1fr); }
  .list-panel, .detail-panel { background:white; border:1px solid var(--border); border-radius:8px; min-width:0; }
  .list-panel[aria-busy="true"] { opacity:.65; transition:opacity .15s; }
  .status-tabs { display:flex; gap:7px; margin:0 16px; overflow-x:auto; border-bottom:1px solid var(--border); scrollbar-width:thin; }
  .status-tabs button { display:flex; gap:7px; align-items:center; padding:16px 6px 13px; position:relative; background:none; border:0; cursor:pointer; white-space:nowrap; font-size:12px; color:#5b6679; }
  .status-tabs button span { min-width:21px; padding:0 5px; border-radius:5px; background:#eef1f5; font-size:10px; color:#475467; font-weight:600; }
  .status-tabs .tab-active { color:#162d46; font-weight:700; }
  .tab-active::after { content:''; height:3px; border-radius:4px; background:var(--navy); position:absolute; left:0; right:0; bottom:0; }
  .search-toolbar { display:flex; align-items:center; gap:9px; padding:15px 16px; }
  .search-box { flex:1; display:flex; gap:9px; align-items:center; border:1px solid #d3dae5; border-radius:6px; padding:0 10px; color:#667085; min-width:100px; }
  .search-box:focus-within { outline:2px solid #93b4fa; outline-offset:1px; }
  .search-box input { width:100%; min-width:0; height:37px; background:white; font-size:12px; color:#18283f; border:0; outline:none !important; }
  .search-box input::placeholder { color:#7a8596; }
  .result-count { margin-left:auto; padding-left:4px; font-size:11px; color:#667085; white-space:nowrap; }
  .clear-search { background:none; border:0; color:#175cd3; padding:6px; cursor:pointer; font-size:12px; }
  .table-scroll { overflow-x:auto; margin:0 12px; border:1px solid var(--border); border-radius:6px; }
  .spk-table { width:100%; border-collapse:collapse; text-align:left; font-size:12px; }
  .spk-table th { font-size:11px; color:#465266; font-weight:600; padding:11px 12px; background:#f3f6f9; white-space:nowrap; border-bottom:1px solid var(--border); }
  .spk-table td { padding:0 12px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .spk-table tr:last-child td { border-bottom:0; }
  .spk-table tbody tr:hover { background:#f5f8fc; }
  .spk-table .row-selected { background:#edf4ff; }
  .spk-table .row-selected:hover { background:#e7f0fd; }
  .row-selected td:first-child { box-shadow:inset 3px 0 #3478f6; }
  .select-spk { display:flex; flex-direction:column; align-items:flex-start; gap:1px; background:transparent; border:0; cursor:pointer; text-align:left; padding:11px 0; min-width:155px; width:100%; line-height:1.4; color:#172b43; }
  .spk-number { color:#2361bc; font-size:10px; white-space:nowrap; }
  .select-spk strong { font-size:13px; font-weight:650; }.vehicle-model { color:#697586; font-size:10px; }
  .customer-cell { min-width:116px; overflow-wrap:anywhere; }
  .status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 7px; border-radius:5px; color:#5b6474; background:#f0f2f5; font-size:10px; font-weight:550; white-space:nowrap; }
  .status-badge.in_progress { background:#e3efff; color:#165ab0; }.status-badge.completed { background:#e4f7eb; color:#15783f; }.status-badge.cancelled { background:#fff0f1; color:#bd2d40; }
  .money-cell { text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
  .spk-table td:last-child { padding:0 5px; }.row-detail { color:#697586; width:25px; }
  .pagination-footer { display:flex; gap:12px; align-items:center; justify-content:space-between; padding:18px 16px; color:#667085; font-size:11px; flex-wrap:wrap; }
  .pagination { display:flex; gap:5px; }.pagination button { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:#fff; color:#475467; border:1px solid #d7dfe9; border-radius:5px; cursor:pointer; font-size:11px; }
  .pagination .page-active { background:var(--navy); color:white; border-color:var(--navy); }
  .detail-panel { padding:17px 18px 20px; position:sticky; top:18px; }
  .detail-caption { display:flex; align-items:center; justify-content:space-between; color:#667085; font-size:10px; font-weight:600; letter-spacing:.04em; margin-bottom:10px; }
  .detail-caption .icon-button { height:22px; width:22px; }
  .detail-title { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .detail-title h2 { margin:0; font-size:17px; font-weight:700; letter-spacing:-.025em; overflow-wrap:anywhere; }
  .vehicle-identity { display:flex; align-items:center; gap:13px; margin:23px 0 19px; }
  .vehicle-icon { display:flex; align-items:center; justify-content:center; width:57px; height:57px; border-radius:8px; background:#f0f3f7; color:#627186; flex-shrink:0; }
  .vehicle-identity strong { display:block; font-size:19px; font-weight:650; letter-spacing:-.02em; }.vehicle-identity div > span { font-size:12px; color:#667085; }
  .detail-facts { padding:16px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin:0; }
  .detail-facts > div { display:grid; grid-template-columns:100px minmax(0,1fr); gap:10px; margin-bottom:9px; font-size:11px; }.detail-facts > div:last-child { margin-bottom:0; }
  dt { color:#667085; } dd { margin:0; overflow-wrap:anywhere; font-weight:500; }
  .job-description { padding:17px 0; border-bottom:1px solid var(--border); }
  .detail-panel h3 { margin:0 0 7px; font-size:12px; font-weight:600; }.job-description p { margin:0; color:#465266; font-size:12px; line-height:1.7; white-space:pre-wrap; overflow-wrap:anywhere; max-height:220px; overflow-y:auto; }
  .estimate { padding:17px 0 20px; }.estimate h3 { color:#465266; margin-bottom:2px; }.estimate strong { font-size:25px; font-weight:750; letter-spacing:-.035em; overflow-wrap:anywhere; }.estimate p { font-size:10px; color:#7b8696; margin:4px 0 0; }
  .detail-actions { display:flex; flex-direction:column; gap:10px; }.complete-button { width:100%; }.secondary-actions { display:grid; grid-template-columns:1fr 1fr; gap:9px; }.detail-link { display:flex; gap:9px; align-items:center; color:#175cd3; font-size:11px; text-decoration:none; margin-top:8px; padding:4px 0; }.detail-link:hover { text-decoration:underline; }
  .delete-link { display:flex; align-items:center; gap:6px; align-self:flex-start; font-size:10px; background:none; border:0; color:#b43a49; cursor:pointer; padding:7px 0 0; }.delete-link:hover { text-decoration:underline; }
  .page-footer { margin-top:20px; padding-top:13px; border-top:1px solid var(--border); display:flex; justify-content:space-between; color:#8993a2; font-size:10px; gap:16px; }
  .success-notice, .error-notice { display:flex; align-items:center; gap:10px; padding:11px 14px; margin-bottom:17px; border-radius:7px; font-size:12px; }.success-notice { background:#ecfdf3; color:#15783f; border:1px solid #b6e7c7; }.success-notice .icon-button { margin-left:auto; }.error-notice { background:#fff1f2; color:#b42335; }.error-notice button { text-decoration:underline; margin-left:auto; }
  .empty-state { text-align:center; padding:60px 22px; }.empty-icon { display:inline-flex; padding:17px; border-radius:50%; background:#eff3f8; color:#64748b; }.empty-state h2 { font-size:16px; font-weight:650; margin:17px 0 6px; }.empty-state p { color:#667085; font-size:12px; margin:0 auto 20px; max-width:320px; }
  :global(.spk-modal) { color:#162033; color-scheme:light; font-family:'Inter',Arial,sans-serif; padding:24px 12px; background:rgb(15 30 48 / .55) !important; backdrop-filter:blur(3px); }
  :global(.spk-modal .modal-card) { top:0; border-radius:12px; border:0; margin:auto; padding:26px; }
  :global(.spk-modal input) { background:white; color:#162033; }
  @media (min-width:1550px) { .page-content { padding:32px 36px; }.spk-table td { padding-left:16px; padding-right:16px; }.select-spk { padding:15px 0; }.detail-panel { padding:20px 23px; }.spk-table { font-size:13px; }.status-badge { font-size:11px; }.spk-number,.vehicle-model { font-size:11px; } }
  @media (max-width:1250px) {.page-content { padding:24px 20px; }.work-grid.detail-open { grid-template-columns:minmax(0,1fr); }.detail-panel { position:static; }.detail-title { justify-content:space-between; }.detail-facts > div { grid-template-columns:140px 1fr; }.job-description p { max-height:none; }.select-spk { padding:14px 0; }.spk-table { font-size:13px; }.detail-panel .detail-actions { max-width:430px; } }
  @media (max-width:760px) {.page-content { padding:24px 15px 15px; }.page-heading { align-items:flex-start; flex-direction:column; gap:17px; }.heading-actions { width:100%; }.heading-actions .button-red { margin-left:auto; }h1 { font-size:26px; }.page-heading p { font-size:12px; }.summary { padding:13px; }.summary-grid { grid-template-columns:repeat(2,1fr); row-gap:18px; }.summary-item { padding:0 15px; }.summary-item:nth-child(3) { border-left:0; padding-left:7px; }.summary-label { font-size:11px; }.summary-item strong { font-size:24px; }.status-tabs { margin:0 10px; gap:8px; }.search-toolbar { padding:13px 10px; flex-wrap:wrap; }.result-count { display:none; }.table-scroll { margin:0 8px; }.spk-table { min-width:610px; }.table-scroll { scrollbar-width:thin; }.pagination-footer { padding:14px 12px; }.detail-panel { padding:17px; }.page-footer { font-size:9px; }.empty-state { padding:40px 15px; } }
  @media (prefers-reduced-motion:reduce) { }

</style>
