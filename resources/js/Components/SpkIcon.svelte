<script>
  export let name = 'file'
  export let size = 20
  const paths = {
    home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-8H9v8H4a1 1 0 0 1-1-1z',
    file: 'M8 3H5a2 2 0 0 0-2 2v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7l-4-4H8m7 0v5h5M7 12h8M7 16h8',
    clipboard: 'M9 4H6a2 2 0 0 0-2 2v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a2 2 0 0 0-2-2h-3M9 2h6v5H9zM8 12h8M8 16h6',
    car: 'm3 10 2-6h14l2 6M3 10h18v9h-3v-3H6v3H3zM6 12h2m8 0h2M7 4l1-2h8l1 2',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-13a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    chart: 'M4 21V10m8 11V3m8 18V7',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    plus: 'M12 5v14M5 12h14',
    close: 'm6 6 12 12M6 18 18 6',
    check: 'm5 12 4 4L19 6',
    edit: 'm16 3 5 5-12 12-6 1 1-6zM14 5l5 5',
    print: 'M6 9V3h12v6M6 18H3v-8h18v8h-3M6 14h12v7H6zM17 11h1',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    calendar: 'M3 5h18v16H3zM7 2v6m10-6v6M3 10h18',
    left: 'm14 6-6 6 6 6',
    right: 'm10 6 6 6-6 6',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    menu: 'M3 6h18M3 12h18M3 18h18',
    trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
    help: 'M9 9a3 3 0 1 1 5 2c-1 1-2 1-2 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
  }
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">
  <path d={paths[name] || paths.file} />
</svg>
