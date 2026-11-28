$ErrorActionPreference = 'Stop'
$dataDir = if ($env:SST_DATA_DIR) { $env:SST_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'SSTBengkel' }
try {
    $state = Get-Content -LiteralPath (Join-Path $dataDir 'running.json') -Raw | ConvertFrom-Json
    $root = $PSScriptRoot
    if ($state.root -ne $root) { exit }
    $running = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f [int]$state.pid)
    $expectedNode = Join-Path $root 'runtime/node.exe'
    if ($running.ExecutablePath -eq $expectedNode -and $running.CommandLine.Contains((Join-Path $root 'bootstrap.cjs'))) {
        Stop-Process -Id ([int]$state.pid) -Force
    }
} catch { Write-Output $_.Exception.Message }
