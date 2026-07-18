param(
    [ValidateSet('tiny', 'base', 'small')]
    [string]$Model = 'small'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$installRoot = Join-Path $projectRoot '.facile-tools\whisper'
$binRoot = Join-Path $installRoot 'bin'
$modelRoot = Join-Path $installRoot 'models'
$cliPath = Join-Path $binRoot 'whisper-cli.exe'
$modelPath = Join-Path $modelRoot "ggml-$Model.bin"

New-Item -ItemType Directory -Force -Path $binRoot, $modelRoot | Out-Null

if (-not (Test-Path -LiteralPath $cliPath)) {
    Write-Host 'Downloading the latest official whisper.cpp Windows build...'
    $release = Invoke-RestMethod `
        -Uri 'https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest' `
        -Headers @{ 'User-Agent' = 'FACILE-local-voice-setup' }
    $asset = $release.assets | Where-Object { $_.name -eq 'whisper-bin-x64.zip' } | Select-Object -First 1
    if (-not $asset) {
        throw 'The latest whisper.cpp release does not contain whisper-bin-x64.zip.'
    }

    $archivePath = Join-Path $env:TEMP "facile-whisper-$($release.tag_name).zip"
    $extractPath = Join-Path $env:TEMP "facile-whisper-$($release.tag_name)"
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $archivePath
    if (Test-Path -LiteralPath $extractPath) {
        Remove-Item -LiteralPath $extractPath -Recurse -Force
    }
    Expand-Archive -LiteralPath $archivePath -DestinationPath $extractPath -Force

    $downloadedCli = Get-ChildItem -LiteralPath $extractPath -Recurse -Filter 'whisper-cli.exe' | Select-Object -First 1
    if (-not $downloadedCli) {
        throw 'whisper-cli.exe was not found in the official release archive.'
    }
    Get-ChildItem -LiteralPath $downloadedCli.DirectoryName | Copy-Item -Destination $binRoot -Recurse -Force
}

if (-not (Test-Path -LiteralPath $modelPath)) {
    Write-Host "Downloading the multilingual Whisper $Model model..."
    Invoke-WebRequest `
        -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-$Model.bin" `
        -OutFile $modelPath
}

if (-not (Test-Path -LiteralPath $cliPath) -or -not (Test-Path -LiteralPath $modelPath)) {
    throw 'Local Whisper installation did not complete.'
}

Write-Host ''
Write-Host 'FACILE local voice search is installed.' -ForegroundColor Green
Write-Host "Executable: $cliPath"
Write-Host "Model:      $modelPath"
Write-Host 'Restart npm run dev if it is currently running.'
