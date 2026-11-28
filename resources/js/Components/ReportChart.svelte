<script>
  export let title = '';
  export let subtitle = '';
  export let data = [];
  export let money = false;
  export let horizontal = false;
  export let pie = false;
  const number = value => new Intl.NumberFormat('id-ID', {maximumFractionDigits:0}).format(Number(value) || 0);
  const format = value => money ? 'Rp '+number(value) : number(value);
  const compact = value => new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(value);
  $: maximum = Math.max(1,...data.map(item=>Number(item.value)||0));
  $: total = data.reduce((sum,item)=>sum+(Number(item.value)||0),0);
  const circumference = 2 * Math.PI * 68;
  $: pieSegments = data.map((item,index) => {
    const value = Math.max(0, Number(item.value) || 0);
    const before = data.slice(0,index).reduce((sum,segment)=>sum+Math.max(0,Number(segment.value)||0),0);
    return {...item, dash: total ? value / total * circumference : 0, offset: total ? before / total * circumference : 0};
  });
</script>
<section class="report-panel chart-panel">
  <div class="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span class="chart-total">{format(total)}{money?'':' total'}</span></div>
  {#if data.length && total > 0}
    {#if pie}
      <div class="pie-chart-layout">
        <svg class="pie-chart" viewBox="0 0 220 220" role="img" aria-label={`${title}. ${data.map(item=>item.label+': '+format(item.value)).join('; ')}`}>
          <circle cx="110" cy="110" r="68" fill="none" stroke="#edf0f4" stroke-width="30" />
          {#each pieSegments as segment}
            {#if segment.dash > 0}
              <circle cx="110" cy="110" r="68" fill="none" stroke={segment.color || 'var(--sst-red)'} stroke-width="30" stroke-dasharray={`${segment.dash} ${circumference-segment.dash}`} stroke-dashoffset={-segment.offset} transform="rotate(-90 110 110)"><title>{segment.label}: {format(segment.value)}</title></circle>
            {/if}
          {/each}
          <text x="110" y="106" text-anchor="middle" class="pie-center-value">{number(total)}</text>
          <text x="110" y="126" text-anchor="middle" class="pie-center-label">SPK</text>
        </svg>
        <div class="pie-legend">
          {#each data as item}
            <div class="pie-legend-item"><span class="pie-legend-dot" style:background={item.color || 'var(--sst-red)'}></span><span>{item.label}</span><strong>{format(item.value)}</strong></div>
          {/each}
        </div>
      </div>
    {:else if horizontal}
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
