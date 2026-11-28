$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$logDir = Join-Path $project 'tmp/desktop'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$launchLog = Join-Path $logDir 'launcher.log'
function Log($message) { Add-Content -LiteralPath $launchLog -Value ("{0:o} {1}" -f [DateTime]::Now,$message) }
$lock = New-Object System.Threading.Mutex($false, 'Local\SSTBengkelLauncher')
$ownsLock = $false
try {
    try { $ownsLock = $lock.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $ownsLock = $true }
    if (!$ownsLock) { exit }
    Log 'Launcher started'
    $settings = @{}
    Get-Content -LiteralPath (Join-Path $project '.env') | ForEach-Object {
        if ($_ -match '^\s*(PORT|VITE_PORT)\s*=\s*["'']?(\d+)') { $settings[$matches[1]] = $matches[2] }
    }
    $port = if ($settings.PORT) { $settings.PORT } else { '5555' }
    $vitePort = if ($settings.VITE_PORT) { $settings.VITE_PORT } else { '3000' }
    $url = "http://localhost:$port"
    function IsReady {
        try {
            $page = Invoke-WebRequest -Uri ("http://127.0.0.1:$port") -UseBasicParsing -TimeoutSec 5
            $vite = Invoke-WebRequest -Uri "http://127.0.0.1:$vitePort/@vite/client" -UseBasicParsing -TimeoutSec 5
            return ($page.StatusCode -eq 200 -and $page.Content -match 'data-page' -and $vite.StatusCode -eq 200)
        } catch { return $false }
    }
    if (!(IsReady)) {
        $candidates = @()
        $nvmDir = Join-Path $env:LOCALAPPDATA 'nvm'
        if (Test-Path -LiteralPath $nvmDir) {
            $candidates += Get-ChildItem -LiteralPath $nvmDir -Directory -Filter 'v22.*' | Sort-Object Name -Descending | ForEach-Object { Join-Path $_.FullName 'node.exe' }
        }
        $candidates += @((Join-Path $env:ProgramFiles 'nodejs/node.exe'), 'C:/nvm4w/nodejs/node.exe')
        $candidates += Get-Command node.exe -All -ErrorAction SilentlyContinue | ForEach-Object { $_.Source }
        $nodePath = $null
        foreach ($candidate in ($candidates | Select-Object -Unique)) {
            if (Test-Path -LiteralPath $candidate) {
                $version = & $candidate -p 'process.versions.node' 2>$null
                if ($LASTEXITCODE -eq 0 -and $version -match '^22\.') { $nodePath = $candidate; break }
            }
        }
        if (!$nodePath) { throw 'Node.js 22 belum ditemukan. Pasang Node.js 22 LTS terlebih dahulu.' }
        $env:Path = (Split-Path $nodePath -Parent) + ';' + $env:Path
        $runner = Join-Path $PSScriptRoot 'run.cjs'
        Log "Starting local server using $nodePath"
        $serverProcess = Start-Process -FilePath $nodePath -ArgumentList ('"{0}"' -f $runner) -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir 'server.log') -RedirectStandardError (Join-Path $logDir 'server-error.log') -PassThru
        Log "Server launcher PID: $($serverProcess.Id)"
        $deadline = [DateTime]::UtcNow.AddSeconds(90)
        while (!(IsReady)) {
            $serverProcess.Refresh()
            if ($serverProcess.HasExited) { throw "Server berhenti. Periksa log di $logDir." }
            if ([DateTime]::UtcNow -gt $deadline) { throw "Server belum siap. Periksa log di $logDir." }
            Start-Sleep -Milliseconds 500
        }
    }
    Log "Server and frontend ready: $url"
    $browsers = @(
        (Join-Path $env:ProgramFiles 'Google/Chrome/Application/chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft/Edge/Application/msedge.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google/Chrome/Application/chrome.exe')
    )
    $browser = $browsers | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($browser) { Start-Process -FilePath $browser -ArgumentList @("--app=$url",'--new-window') -WindowStyle Normal }
    else { Start-Process $url }
    Log 'Application window requested'
} catch {
    Log $_.Exception.Message
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'SST Bengkel', 'OK', 'Error') | Out-Null
} finally {
    if ($ownsLock) { $lock.ReleaseMutex() }
    $lock.Dispose()
}
