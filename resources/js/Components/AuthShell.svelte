<script>
  import BrandLogo from './BrandLogo.svelte'
</script>
<div class="sst-auth">
  <aside class="sst-auth-brand"><a href="/" aria-label="SST Bengkel — halaman ringkasan"><BrandLogo width={330}/></a><h2>Kelola bengkel.<br />Layani lebih baik.</h2><p>Pelanggan, kendaraan, perintah kerja, dan tagihan dalam satu tempat.</p><a href="tel:081235295993">0812 3529 5993</a></aside>
  <main class="sst-auth-content"><a href="/" class="sst-auth-back">← Kembali ke ringkasan</a><slot /></main>
</div>
