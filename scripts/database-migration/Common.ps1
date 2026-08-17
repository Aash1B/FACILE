Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Import-MigrationEnvironment {
    param([string]$Path = (Join-Path $PSScriptRoot '..\..\migration.env'))
    if (-not (Test-Path -LiteralPath $Path)) { throw "Missing ignored migration environment file: $Path" }
    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '^\s*#' -or [string]::IsNullOrWhiteSpace($line)) { continue }
        if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') { throw "Invalid migration.env line (key names only are allowed before '=')" }
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

function Get-MigrationValue {
    param([string[]]$Names, [string]$Default)
    foreach ($name in $Names) {
        $value = [Environment]::GetEnvironmentVariable($name, 'Process')
        if (-not [string]::IsNullOrWhiteSpace($value)) { return $value }
    }
    if ($PSBoundParameters.ContainsKey('Default')) { return $Default }
    throw "Missing required environment variable: $($Names -join ' or ')"
}

function Assert-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Required command is unavailable: $Name" }
}

function New-TemporaryMigrationScript {
    param([Parameter(Mandatory)][string]$Content)
    $path = Join-Path ([IO.Path]::GetTempPath()) ("facile-mongo-inspect-{0}.js" -f [Guid]::NewGuid().ToString('N'))
    Set-Content -LiteralPath $path -Value $Content -Encoding UTF8
    return $path
}

function Get-CliPostgresUrl {
    $jdbc = Get-MigrationValue @('SUPABASE_DATABASE_URL', 'DATABASE_URL')
    if ($jdbc -notmatch '^jdbc:postgresql://') { throw 'Supabase URL must start with jdbc:postgresql://' }
    return $jdbc.Substring(5)
}

function Confirm-HostedWrite {
    param([string]$Target, [switch]$Yes)
    if ($Yes) { return }
    $answer = Read-Host "Type MIGRATE to write to $Target"
    if ($answer -cne 'MIGRATE') { throw 'Hosted write cancelled.' }
}

function New-MigrationLog {
    $root = Join-Path $PSScriptRoot '..\..\migration-logs'
    New-Item -ItemType Directory -Force -Path $root | Out-Null
    return Join-Path $root ("migration-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
}

function Write-SafeLog {
    param([string]$Message, [string]$Path)
    $line = "{0} {1}" -f (Get-Date -Format o), $Message
    Write-Host $line
    Add-Content -LiteralPath $Path -Value $line
}
