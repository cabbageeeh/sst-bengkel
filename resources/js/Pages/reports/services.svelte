<script>
 import ReportChart from '../../Components/ReportChart.svelte';
 export let serviceData=[];
 export let startDate='';
 export let endDate='';
 export let status='';
 let search='';
 const labels={draft:'Belum dikerjakan',in_progress:'Dikerjakan',completed:'Selesai',cancelled:'Dibatalkan'};
 const colors={draft:'#98a2b3',in_progress:'#3478f6',completed:'#23976b',cancelled:'#db2534'};
 $: filtered=serviceData.filter(row=>[row.spk_number,row.customer_name,row.license_plate].some(value=>String(value||'').toLowerCase().includes(search.toLowerCase())));
 $: chart=Object.entries(labels).map(([key,label])=>({label,value:filtered.filter(row=>row.status===key).length,color:colors[key]}));
</script>
<svelte:head><title>Laporan Servis - SST Bengkel</title></svelte:head>
<div class="report-workspace"><header class="management-heading"><div><div class="eyebrow">ANALISIS BENGKEL</div><h1>Laporan servis</h1><p>Lihat jumlah dan perkembangan pekerjaan berdasarkan tanggal masuk.</p></div><a href="/reports" class="sst-button secondary">← Ringkasan laporan</a></header>
<nav class="report-tabs" aria-label="Jenis laporan"><a href="/reports">Ringkasan</a><a href="/reports/revenue">Pendapatan</a><a class="active" href="/reports/services" aria-current="page">Servis</a><a href="/reports/customers">Pelanggan</a></nav>
<form class="report-filter" method="get" action="/reports/services"><div><label for="start">Dari tanggal</label><input id="start" type="date" name="start_date" value={startDate||''} /></div><div><label for="end">Sampai tanggal</label><input id="end" type="date" name="end_date" value={endDate||''} /></div><div><label for="status">Status pekerjaan</label><select id="status" name="status" value={status||''}><option value="">Semua status</option>{#each Object.entries(labels) as [key,label]}<option value={key}>{label}</option>{/each}</select></div><button type="submit" class="sst-button">Tampilkan laporan</button><a class="text-link" href="/reports/services">Reset</a></form>
<div class="report-chart-grid"><ReportChart title="Jumlah servis per status" subtitle="Sesuai filter tanggal, status, dan pencarian" data={chart} horizontal /><section class="report-panel service-summary"><div class="eyebrow">TOTAL PEKERJAAN</div><strong>{filtered.length}<small> SPK</small></strong><p>Setiap pekerjaan ditampilkan satu kali sesuai status terbarunya.</p><a class="sst-button secondary" href="/spk">Buka perintah kerja →</a></section></div>
<section class="report-panel"><div class="panel-heading"><div><h2>Daftar pekerjaan</h2><p>{filtered.length} pekerjaan ditemukan</p></div><div><label class="sr-only" for="search">Cari pekerjaan</label><input id="search" type="search" bind:value={search} placeholder="Cari SPK, pelanggan, atau plat" /></div></div><div class="management-table-scroll"><table class="management-table"><thead><tr><th>Nomor SPK</th><th>Pelanggan</th><th>Kendaraan</th><th>Tanggal masuk</th><th>Status</th></tr></thead><tbody>{#each filtered as row}<tr><td><a class="text-link" href={`/spk/${row.id}`}>{row.spk_number}</a></td><td>{row.customer_name||'-'}</td><td><strong>{row.license_plate||'-'}</strong><div class="secondary-text">{row.brand||''} {row.model||''}</div></td><td>{row.tanggal_masuk?new Date(row.tanggal_masuk).toLocaleDateString('id-ID'):'-'}</td><td><span class={`status-pill ${row.status}`}>{labels[row.status]||row.status}</span></td></tr>{:else}<tr><td colspan="5" class="empty-cell">Tidak ada pekerjaan yang sesuai dengan filter.</td></tr>{/each}</tbody></table></div></section></div>
