<script>
  export let title = '';
  export let subtitle = '';
  export let data = [];
  export let money = false;
  export let horizontal = false;
  const number = value => new Intl.NumberFormat('id-ID', {maximumFractionDigits:0}).format(Number(value) || 0);
  const format = value => money ? 'Rp '+number(value) : number(value);
  const compact = value => new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(value);
  $: maximum = Math.max(1,...data.map(item=>Number(item.value)||0));
  $: total = data.reduce((sum,item)=>sum+(Number(item.value)||0),0);
</script>
<section class="report-panel chart-panel">
  <div class="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span class="chart-total">{format(total)}{money?'':' total'}</span></div>
  {#if data.length && total > 0}
    {#if horizontal}
      <div class="horizontal-chart">
        {#each data as item}
          <div class="horizontal-row"><div><span>{item.label}</span><strong>{format(item.value)}</strong></div><div class="bar-track"><div style:width={`${Number(item.value)/maximum*100}%`} style:background={item.color || 'var(--sst-red)'}></div></div></div>
        {/each}
      </div>
    {:else}
      <div class="chart-scroll">
        <svg class="revenue-chart" viewBox="0 0 760 250" role="img" aria-label={`${title}. ${data.map(item=>item.label+': '+format(item.value)).join('; ')}`}>
          {#each [0,.25,.5,.75,1] as tick}
            <line x1="65" x2="745" y1={205-tick*180} y2={205-tick*180} stroke="#e7ecf2" stroke-dasharray="3 4" />
            <text x="55" y={209-tick*180} text-anchor="end" fill="#667085" font-size="10">{compact(maximum*tick)}</text>
          {/each}
          {#each data as item,i}
            <rect x={70+i*(670/data.length)+(670/data.length-Math.min(48,670/data.length*.62))/2} y={205-(Number(item.value)||0)/maximum*180} width={Math.max(3,Math.min(48,670/data.length*.62))} height={(Number(item.value)||0)/maximum*180} rx="3" fill={item.color || 'var(--sst-red)'}><title>{item.label}: {format(item.value)}</title></rect>
            {#if data.length <= 12 || i % 5 === 0 || i === data.length-1}<text x={70+i*(670/data.length)+670/data.length*.5} y="229" text-anchor="middle" fill="#667085" font-size="10">{item.label}</text>{/if}
          {/each}
        </svg>
      </div>
      <details class="chart-data"><summary>Lihat angka pada grafik</summary><div class="chart-values">{#each data as item}<div><span>{item.label}</span><strong>{format(item.value)}</strong></div>{/each}</div></details>
    {/if}
  {:else}
    <div class="chart-empty"><span>Belum ada data</span><p>Grafik akan muncul setelah ada aktivitas yang sesuai dengan filter.</p></div>
  {/if}
</section>
