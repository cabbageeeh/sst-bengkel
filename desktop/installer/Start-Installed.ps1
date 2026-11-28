$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$root = $PSScriptRoot
$dataDir = if ($env:SST_DATA_DIR) { $env:SST_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'SSTBengkel' }
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
$logDir = Join-Path $dataDir 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stateFile = Join-Path $dataDir 'running.json'
$lock = New-Object System.Threading.Mutex($false, 'Local\SSTBengkelInstalledLauncher')
$ownsLock = $false
function ReadRunningApp {
    try {
        $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
        $uri = [Uri]$state.url
        if ($uri.Host -ne '127.0.0.1' -or $uri.Scheme -ne 'http') { return $null }
        if ($state.root -ne $root) { return $null }
        $health = Invoke-WebRequest -Uri ($state.url + '/desktop/health') -UseBasicParsing -TimeoutSec 3
        $identity = $health.Content | ConvertFrom-Json
        if ($identity.application -eq 'sst-bengkel-desktop' -and $identity.instance -eq $state.instance) { return $state }
    } catch {}
    return $null
}
try {
    try { $ownsLock = $lock.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $ownsLock = $true }
    if (!$ownsLock) { exit }
    $state = ReadRunningApp
    if (!$state) {
        $env:SST_DATA_DIR = $dataDir
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $node = Join-Path $root 'runtime/node.exe'
        $server = Start-Process -FilePath $node -ArgumentList ('"{0}"' -f (Join-Path $root 'bootstrap.cjs')) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir "$stamp.log") -RedirectStandardError (Join-Path $logDir "$stamp-error.log") -PassThru
        $deadline = [DateTime]::UtcNow.AddSeconds(60)
        while (!$state) {
            $server.Refresh()
            if ($server.HasExited) { throw "SST Bengkel gagal dimulai. Lihat log di $logDir." }
            if ([DateTime]::UtcNow -gt $deadline) { throw "Aplikasi belum siap. Lihat log di $logDir." }
            Start-Sleep -Milliseconds 300
            $state = ReadRunningApp
        }
    }
    $browsers = @(
        (Join-Path $env:ProgramFiles 'Google/Chrome/Application/chrome.exe'),
        (Join-Path $env:ProgramFiles 'Microsoft/Edge/Application/msedge.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft/Edge/Application/msedge.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google/Chrome/Application/chrome.exe')
    )
    $browser = $browsers | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($browser) { Start-Process -FilePath $browser -ArgumentList @("--app=$($state.url)",'--new-window') -WindowStyle Normal }
    else { Start-Process $state.url }
} catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'SST Bengkel', 'OK', 'Error') | Out-Null
} finally {
    if ($ownsLock) { $lock.ReleaseMutex() }
    $lock.Dispose()
}
