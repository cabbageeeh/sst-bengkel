<script>
  import { onMount } from 'svelte';
  export let spk = {};
  let frame;
  let pdfUrl = '';
  let loading = true;
  let ready = false;
  let error = '';
  let printHint = '';
  let active = true;
  let autoPrinted = false;
  let request;

  async function loadPdf() {
    loading = true;
    ready = false;
    error = '';
    printHint = '';
    autoPrinted = false;
    request?.abort();
    request = new AbortController();
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); pdfUrl = ''; }
    try {
      const response = await fetch(`/spk/${encodeURIComponent(spk.id)}/pdf`, {signal: request.signal});
      if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) {
        throw new Error('SPK belum berhasil dimuat. Silakan coba lagi.');
      }
      const pdf = await response.blob();
      if (active) pdfUrl = URL.createObjectURL(pdf);
    } catch (failure) {
      if (failure.name !== 'AbortError' && active) {
        loading = false;
        error = failure.message || 'SPK belum berhasil dimuat. Silakan coba lagi.';
      }
    }
  }

  function printDocument() {
    if (!ready || !frame?.contentWindow) return;
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      printHint = 'Gunakan ikon cetak pada pratinjau PDF di bawah untuk melanjutkan.';
    }
  }

  function previewLoaded() {
    if (!active) return;
    ready = true;
    loading = false;
    if (!autoPrinted) {
      autoPrinted = true;
      requestAnimationFrame(() => { if (active) printDocument(); });
    }
  }

  onMount(() => {
    loadPdf();
    return () => {
      active = false;
      request?.abort();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  });
</script>

<svelte:head>
  <title>Cetak {spk.spk_number || 'SPK'} - SST Bengkel</title>
  <style>
    html, body, #app { margin:0; padding:0; min-height:100%; color-scheme:light; background:#eef2f7!important; }
    body { font-family:Arial,Helvetica,sans-serif; color:#172033; }
  </style>
</svelte:head>

<main>
  <header>
    <div><h1>{spk.spk_number || 'Cetak SPK'}</h1><p>Pratinjau cetak A4</p></div>
    <div class="actions"><button type="button" disabled={!ready} on:click={printDocument}>Cetak A4</button><button type="button" class="secondary" on:click={() => window.close()}>Tutup</button></div>
  </header>
  {#if loading}<p class="notice" role="status">Menyiapkan SPK untuk dicetak…</p>{/if}
  {#if error}<div class="notice" role="alert"><p>{error}</p><button type="button" on:click={loadPdf}>Coba lagi</button></div>{/if}
  {#if printHint}<p class="notice" role="status">{printHint}</p>{/if}
  {#if pdfUrl}<iframe bind:this={frame} src={pdfUrl} title={`Pratinjau ${spk.spk_number || 'SPK'}`} on:load={previewLoaded}></iframe>{/if}
</main>

<style>
  header {display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;background:#fff;border-bottom:1px solid #dbe1e8;}
  h1 {font-size:16px;margin:0 0 4px;} p {font-size:13px;margin:0;color:#667085;}
  .actions {display:flex;gap:8px;}
  button {border:0;border-radius:6px;padding:10px 16px;background:#db2534;color:white;font-size:13px;font-weight:600;cursor:pointer;}
  button:disabled {opacity:.5;cursor:wait;} button:focus-visible {outline:3px solid #93b4fa;outline-offset:2px;}
  .secondary {background:#475569;}.notice {margin:16px 20px;padding:16px;border:1px solid #dbe1e8;border-radius:6px;background:white;}.notice button {margin-top:12px;}
  iframe {display:block;width:100%;height:calc(100vh - 78px);border:0;min-height:400px;}
  @media(max-width:500px) {header {padding:12px;gap:8px;}h1 {font-size:13px;}button {padding:9px 12px;}iframe {height:calc(100vh - 74px);}}
</style>
