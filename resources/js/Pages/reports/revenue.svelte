<script>
  import ReportChart from '../../Components/ReportChart.svelte';
  export let revenueData=[];
  export let startDate='';
  export let endDate='';
  export let groupBy='day';
  const money=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(n)||0);
  const date=d=>new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
  $: total=revenueData.reduce((sum,row)=>sum+Number(row.total_amount||0),0);
  $: count=revenueData.reduce((sum,row)=>sum+Number(row.invoice_count||0),0);
  $: chart=revenueData.map(row=>({label:groupBy==='month'?new Date(row.date+'-01T00:00:00').toLocaleDateString('id-ID',{month:'short',year:'2-digit'}):new Date(row.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'}),value:Number(row.total_amount)||0}));
</script>
<svelte:head><title>Laporan Pendapatan - SST Bengkel</title></svelte:head>
<div class="report-workspace"><header class="management-heading"><div><div class="eyebrow">ANALISIS BENGKEL</div><h1>Laporan pendapatan</h1><p>Pendapatan yang sudah dibayar, berdasarkan tanggal invoice.</p></div><a href="/reports" class="sst-button secondary">← Ringkasan laporan</a></header>
<nav class="report-tabs" aria-label="Jenis laporan"><a href="/reports">Ringkasan</a><a class="active" aria-current="page" href="/reports/revenue">Pendapatan</a><a href="/reports/services">Servis</a><a href="/reports/customers">Pelanggan</a></nav>
<form class="report-filter" method="get" action="/reports/revenue"><div><label for="start">Dari tanggal</label><input type="date" name="start_date" id="start" value={startDate||''} /></div><div><label for="end">Sampai tanggal</label><input type="date" name="end_date" id="end" value={endDate||''} /></div><div><label for="group">Kelompokkan</label><select id="group" name="group_by" value={groupBy}><option value="day">Per hari</option><option value="month">Per bulan</option></select></div><button class="sst-button" type="submit">Tampilkan laporan</button><a class="text-link" href="/reports/revenue">Reset</a></form>
<div class="metric-grid three"><section class="metric-card"><span>Total pendapatan</span><strong>{money(total)}</strong><small>Hanya invoice lunas</small></section><section class="metric-card"><span>Invoice lunas</span><strong>{count}</strong><small>Sesuai rentang tanggal</small></section><section class="metric-card"><span>Rata-rata per invoice</span><strong>{money(count?total/count:0)}</strong><small>Total pendapatan ÷ invoice lunas</small></section></div>
<ReportChart title="Tren pendapatan" subtitle={groupBy==='month'?'Pendapatan setiap bulan yang memiliki transaksi':'Pendapatan setiap hari yang memiliki transaksi'} data={chart} money />
<section class="report-panel"><div class="panel-heading"><div><h2>Rincian pendapatan</h2><p>Angka berikut sesuai dengan grafik di atas.</p></div></div><div class="management-table-scroll"><table class="management-table"><thead><tr><th>Periode</th><th>Invoice lunas</th><th class="money">Pendapatan</th></tr></thead><tbody>{#each revenueData as row}<tr><td>{groupBy==='month'?row.date:date(row.date)}</td><td>{row.invoice_count} invoice</td><td class="money primary-text">{money(row.total_amount)}</td></tr>{:else}<tr><td colspan="3" class="empty-cell">Belum ada invoice lunas pada rentang tanggal ini.</td></tr>{/each}</tbody><tfoot><tr><th>Total</th><th>{count} invoice</th><th class="money">{money(total)}</th></tr></tfoot></table></div></section></div>
