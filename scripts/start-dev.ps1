$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$vitePort = 5590
$viteScript = Join-Path $projectRoot 'node_modules\.bin\vite.cmd'
$electronScript = Join-Path $projectRoot 'node_modules\.bin\electron.cmd'

if (-not (Test-Path $viteScript)) {
  throw "Vite binary not found: $viteScript"
}

if (-not (Test-Path $electronScript)) {
  throw "Electron binary not found: $electronScript"
}

function Test-PortReady {
  param(
    [int]$Port
  )

  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $iar = $client.BeginConnect('127.0.0.1', $Port, $null, $null)

    if (-not $iar.AsyncWaitHandle.WaitOne(500)) {
      $client.Close()
      return $false
    }

    $client.EndConnect($iar)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

$viteProcess = Start-Process -FilePath $viteScript `
  -ArgumentList '--host', '127.0.0.1', '--port', "$vitePort", '--strictPort' `
  -WorkingDirectory $projectRoot `
  -PassThru

try {
  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) {
    if ($viteProcess.HasExited) {
      throw "Vite stopped early with exit code $($viteProcess.ExitCode)."
    }

    if (Test-PortReady -Port $vitePort) {
      break
    }

    Start-Sleep -Milliseconds 300
  }

  if (-not (Test-PortReady -Port $vitePort)) {
    throw "Vite did not open port $vitePort in time."
  }

  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

  & $electronScript '.'
  $electronExitCode = $LASTEXITCODE
  if ($null -ne $electronExitCode -and $electronExitCode -ne 0) {
    exit $electronExitCode
  }
} finally {
  if ($viteProcess -and -not $viteProcess.HasExited) {
    Stop-Process -Id $viteProcess.Id -Force
  }
}
