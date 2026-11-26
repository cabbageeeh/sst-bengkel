<script>
  import SpkIcon from '../Components/SpkIcon.svelte'
  export let user = {}
  const shortcuts = [
    {href:'/',title:'Ringkasan bengkel',description:'Lihat aktivitas dan perintah kerja terbaru.',icon:'home'},
    {href:'/spk',title:'Perintah kerja',description:'Catat dan pantau servis kendaraan pelanggan.',icon:'clipboard'},
    {href:'/customers',title:'Pelanggan',description:'Kelola kontak dan riwayat pelanggan.',icon:'users'},
    {href:'/vehicles',title:'Kendaraan',description:'Lihat data kendaraan yang terdaftar.',icon:'car'},
    {href:'/invoices',title:'Invoice',description:'Kelola pembayaran dan cetak invoice A4.',icon:'file'},
    {href:'/reports',title:'Laporan',description:'Tinjau pendapatan dan kinerja bengkel.',icon:'chart'}
  ]
</script>
<svelte:head><title>Selamat Datang - SST Bengkel</title></svelte:head>
<div class="welcome-heading"><h1>Selamat datang{user?.name ? ', '+user.name : ''}.</h1><p>Pilih kegiatan yang ingin Anda kerjakan hari ini.</p></div>
<div class="welcome-grid">{#each shortcuts as item}<a href={item.href}><span class="welcome-icon"><SpkIcon name={item.icon} size={24}/></span><h2>{item.title}</h2><p>{item.description}</p><span class="welcome-link">Buka halaman →</span></a>{/each}</div>
<style>.welcome-heading{margin-bottom:26px}.welcome-heading p{font-size:13px;color:#667085;margin-top:8px}.welcome-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.welcome-grid>a{display:block;border:1px solid #e1e6ed;border-radius:8px;background:white;padding:24px;text-decoration:none;color:#162033}.welcome-grid>a:hover{border-color:#9aabbe}.welcome-icon{display:inline-flex;padding:12px;background:#f1f5f9;color:#425b77;border-radius:8px}.welcome-grid h2{font-size:17px;font-weight:650;margin:18px 0 7px}.welcome-grid p{font-size:12px;line-height:1.7;color:#667085}.welcome-link{display:block;font-size:12px;color:#175cd3;margin-top:25px}@media(max-width:1100px){.welcome-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:550px){.welcome-grid{grid-template-columns:1fr}}</style>
