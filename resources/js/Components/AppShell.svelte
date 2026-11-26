<script>
  import { onMount, tick } from 'svelte'
  import BrandLogo from './BrandLogo.svelte'
  import SpkIcon from './SpkIcon.svelte'
  export let pageName = ''
  export let user = {}
  let menuOpen = false
  let today = ''
  let menuButton
  let closeButton
  const navigation = [
    { href: '/', key: 'Landing', label: 'Ringkasan', icon: 'home' },
    { href: '/spk', key: 'spk', label: 'Perintah kerja', icon: 'clipboard' },
    { href: '/customers', key: 'customers', label: 'Pelanggan', icon: 'users' },
    { href: '/vehicles', key: 'vehicles', label: 'Kendaraan', icon: 'car' },
    { href: '/invoices', key: 'invoices', label: 'Invoice', icon: 'file' },
    { href: '/reports', key: 'reports', label: 'Laporan', icon: 'chart' }
  ]
  $: section = pageName.split('/')[0]
  $: active = navigation.find(item => item.key === section) || {label: 'Ringkasan'}
  onMount(() => { today = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) })
  function closeMenu() { menuOpen=false; menuButton?.focus() }
  async function openMenu() { menuOpen=true; await tick(); closeButton?.focus() }
  function keyboard(event) {
    if (!menuOpen) return
    if (event.key === 'Escape') closeMenu()
    if (event.key === 'Tab') {
      const elements = document.querySelector('.sst-sidebar')?.querySelectorAll('a,button')
      if (!elements?.length) return
      const first=elements[0],last=elements[elements.length-1]
      if (event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus()}
      else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus()}
    }
  }
</script>

<svelte:window on:keydown={keyboard} />
<div class="sst-shell">
  <a class="sst-skip" href="#workspace-content">Langsung ke isi halaman</a>
  {#if menuOpen}<button class="sst-backdrop" aria-label="Tutup navigasi" on:click={closeMenu}></button>{/if}
  <aside class="sst-sidebar" class:open={menuOpen} aria-label="Navigasi utama">
    <a class="sst-logo-link" href="/" aria-label="SST Bengkel — halaman ringkasan"><BrandLogo width={184} /></a>
    <button bind:this={closeButton} class="sst-close-menu" aria-label="Tutup navigasi" on:click={closeMenu}><SpkIcon name="close" /></button>
    <p class="sst-nav-label">OPERASIONAL</p>
    <nav>
      {#each navigation as item}
        {#if item.key==='reports'}<p class="sst-nav-label sst-analysis-label">ANALISIS</p>{/if}
        <a href={item.href} class:active={item.key===section || item.key==='Landing' && section==='home'} aria-current={item.key===section ? 'page' : undefined}><SpkIcon name={item.icon} /><span>{item.label}</span></a>
      {/each}
    </nav>
    <div class="sst-sidebar-footer"><div class="sst-identity"><span class="sst-avatar" aria-hidden="true">ST</span><span><strong>SST Bengkel</strong><small>Operasional bengkel</small></span></div><a class="sst-phone" href="tel:081235295993">0812 3529 5993</a></div>
  </aside>
  <div class="sst-workspace" inert={menuOpen}>
    <header class="sst-topbar"><div class="sst-breadcrumb"><button class="sst-open-menu" bind:this={menuButton} on:click={openMenu} aria-label="Buka navigasi" aria-expanded={menuOpen}><SpkIcon name="menu" /></button><span>Manajemen bengkel</span><span class="sst-slash">/</span><strong>{active.label}</strong></div><div class="sst-topbar-right"><span class="sst-date"><SpkIcon name="calendar" size={17}/>{today}</span></div></header>
    <main class="sst-page" id="workspace-content" tabindex="-1"><slot /></main>
    <footer class="sst-footer"><span>SST Bengkel</span><span>Specialist Suzuki Technology</span></footer>
  </div>
</div>
