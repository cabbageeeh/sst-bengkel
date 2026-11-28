<script>
  import ReportChart from '../../Components/ReportChart.svelte';
  export let stats = {};
  export let recentActivities = [];
  export let serviceStats = [];
  export let revenueData = [];
  export let period = 'month';
  export let year = new Date().getFullYear();
  export let month = new Date().getMonth()+1;
  let filterPeriod=period;
  let filterMonth=month;
  let filterYear=year;
  const months=Array.from({length:12},(_,i)=>new Date(2020,i,1).toLocaleDateString('id-ID',{month:'long'}));
  const money=value=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(value)||0);
  const statuses={draft:'Belum dikerjakan',in_progress:'Dikerjakan',completed:'Selesai',cancelled:'Dibatalkan'};
  const colors={draft:'#98a2b3',in_progress:'#3478f6',completed:'#23976b',cancelled:'#db2534'};
  $: statusChart=Object.entries(statuses).map(([key,label])=>({label,value:Number(serviceStats.find(s=>s.status===key)?.count)||0,color:colors[key]}));
  $: revenueChart=Array.from({length:period==='year'?12:new Date(Number(year),Number(month),0).getDate()},(_,i)=>{
    const key=period==='year'?`${year}-${String(i+1).padStart(2,'0')}`:`${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
    return {label:period==='year'?months[i].slice(0,3):String(i+1),value:Number(revenueData.find(d=>d.period===key)?.revenue)||0};
  });
  $: cards=[['Pendapatan lunas',money(stats.revenue),'Sesuai periode yang dipilih'],['Servis selesai',stats.completedServices||0,'Selesai pada periode ini'],['SPK aktif',stats.activeSPKs||0,'Seluruh pekerjaan belum selesai'],['Pelanggan',stats.totalCustomers||0,`${stats.totalVehicles||0} kendaraan terdaftar`]];
</script>
<svelte:head><title>Laporan Bengkel - SST Bengkel</title></svelte:head>
<div class="report-workspace">
  <header class="management-heading"><div><div class="eyebrow">ANALISIS BENGKEL</div><h1>Laporan bengkel</h1><p>Pantau pendapatan dan pekerjaan bengkel dalam satu tempat.</p></div><a class="sst-button secondary" href="/reports/revenue">Lihat rincian pendapatan →</a></header>
  <nav class="report-tabs" aria-label="Jenis laporan"><a class="active" href="/reports" aria-current="page">Ringkasan</a><a href="/reports/revenue">Pendapatan</a><a href="/reports/services">Servis</a><a href="/reports/customers">Pelanggan</a></nav>
  <form class="report-filter" method="get" action="/reports"><div><label for="period">Tampilkan</label><select id="period" name="period" bind:value={filterPeriod}><option value="month">Bulanan</option><option value="year">Tahunan</option></select></div><div><label for="month">Bulan</label><select id="month" name="month" bind:value={filterMonth} disabled={filterPeriod==='year'}>{#each months as name,i}<option value={i+1}>{name}</option>{/each}</select></div><div><label for="year">Tahun</label><input id="year" name="year" type="number" min="2000" max="2100" bind:value={filterYear} required /></div><button class="sst-button" type="submit">Tampilkan laporan</button><span class="filter-context">{period==='month'?months[Number(month)-1]: 'Januari – Desember'} {year}</span></form>
  <div class="metric-grid">{#each cards as [label,value,note]}<section class="metric-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></section>{/each}</div>
  <div class="report-chart-grid"><ReportChart title="Tren pendapatan" subtitle={period==='month'?'Pendapatan per tanggal · invoice lunas':'Pendapatan per bulan · invoice lunas'} data={revenueChart} money /><ReportChart title="Komposisi status SPK" subtitle="Perbandingan status pekerjaan pada periode terpilih" data={statusChart} pie /></div>
  <section class="report-panel"><div class="panel-heading"><div><h2>Aktivitas terbaru</h2><p>Pekerjaan terakhir dari seluruh periode.</p></div><a href="/spk" class="text-link">Lihat semua SPK →</a></div><div class="management-table-scroll"><table class="management-table"><thead><tr><th>Nomor SPK</th><th>Pelanggan</th><th>Kendaraan</th><th>Status</th><th>Dibuat</th></tr></thead><tbody>{#each recentActivities as row}<tr><td><a class="text-link" href={`/spk/${row.id}`}>{row.spk_number}</a></td><td>{row.customer_name||'-'}</td><td>{row.license_plate||'-'}</td><td><span class={`status-pill ${row.status}`}>{statuses[row.status]||row.status}</span></td><td>{new Date(row.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td></tr>{:else}<tr><td colspan="5" class="empty-cell">Belum ada aktivitas bengkel.</td></tr>{/each}</tbody></table></div></section>
</div>
