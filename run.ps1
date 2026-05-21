#Requires -Version 5.1
# ============================================================
# PLM Core — dev runner (PowerShell / Windows + Docker Desktop)
#
# Usage:
#   .\run.ps1                    start; exit when healthy
#   .\run.ps1 build              rebuild projects with git changes, then start
#   .\run.ps1 build all          rebuild every image, then start
#   .\run.ps1 build <svc>...     rebuild listed compose services, then start
#   .\run.ps1 reset              destroy volumes, rebuild all, start
#   .\run.ps1 down               stop and remove containers
#   .\run.ps1 pull-base          pre-pull all base images once
#
# First run: Set-ExecutionPolicy -Scope CurrentUser Bypass
# ============================================================

param(
    [string]$Command = "",
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$Rest = @()
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── Backend services registry ────────────────────────────────
$SvcRows = @(
    @{ Name = "pno-api";      Port = 8081; Schema = "pno";       LogPkg = "PNO"    }
    @{ Name = "psm-admin";    Port = 8083; Schema = "psm_admin"; LogPkg = "PLM"    }
    @{ Name = "psm-api";      Port = 8080; Schema = "psm";       LogPkg = "PLM"    }
    @{ Name = "ws-gateway";   Port = 8085; Schema = "";          LogPkg = "PLM"    }
    @{ Name = "platform-api"; Port = 8084; Schema = "";          LogPkg = "PLM"    }
    @{ Name = "spe-api";      Port = 8082; Schema = "";          LogPkg = "SPE"    }
    @{ Name = "dst";          Port = 8086; Schema = "dst";       LogPkg = "DST"    }
    @{ Name = "cad-api";      Port = 8087; Schema = "cad";       LogPkg = "CAD"    }
    @{ Name = "search-api";   Port = 8088; Schema = "";          LogPkg = "SEARCH" }
)

$SvcNames = @($SvcRows | ForEach-Object { $_.Name })
$SvcPort  = @{}
foreach ($r in $SvcRows) { $SvcPort[$r.Name] = $r.Port }

$HealthTimeout    = 180
$PlatformLibImage = "plm-platform-lib:dev"

$BaseImages = @(
    "docker.io/library/maven:3.9-eclipse-temurin-21-alpine"
    "docker.io/library/eclipse-temurin:21-jre-alpine"
    "docker.io/library/node:20-alpine"
    "docker.io/library/node:20-slim"
    "docker.io/library/nginx:alpine"
)

# ── Helpers ──────────────────────────────────────────────────
function Log  ([string]$m) { Write-Host "[run.ps1 $(Get-Date -Format HH:mm:ss)] $m" -ForegroundColor Cyan }
function Ok   ([string]$m) { Write-Host "[run.ps1 $(Get-Date -Format HH:mm:ss)] + $m" -ForegroundColor Green }
function Warn ([string]$m) { Write-Host "[run.ps1 $(Get-Date -Format HH:mm:ss)] ! $m" -ForegroundColor Yellow }
function Err  ([string]$m) { Write-Host "[run.ps1 $(Get-Date -Format HH:mm:ss)] x $m" -ForegroundColor Red }

function Assert-Exit ([string]$desc) {
    if ($LASTEXITCODE -ne 0) { Err "$desc failed (exit $LASTEXITCODE)"; exit 1 }
}

# ── Expand a service name to matching compose service(s) ─────
# psm-api -> psm-api, psm-api-1, psm-api-2 (replicas)
function Expand-ComposeSvc ([string]$svc, [string[]]$allServices) {
    $pattern  = "^$([regex]::Escape($svc))(-\d+)?$"
    $expanded = @($allServices | Where-Object { $_ -match $pattern })
    if ($expanded.Count -gt 0) { return $expanded }
    return @($svc)
}

# ── Build platform-lib shared base image ─────────────────────
function Build-PlatformLibImage {
    Log "Building $PlatformLibImage (shared lib-builder base)..."
    docker build -t $PlatformLibImage platform-lib/
    Assert-Exit "Build $PlatformLibImage"
    Ok "$PlatformLibImage ready"
}

# ── Pre-pull base images ──────────────────────────────────────
function Invoke-PullBaseImages {
    Log "Pulling base images (only fetches if not already cached)..."
    $failed = 0
    foreach ($img in $BaseImages) {
        $null = docker image inspect $img 2>$null
        if ($LASTEXITCODE -eq 0) {
            Ok "  cached: $img"
        } else {
            Log "  pulling: $img"
            docker pull $img
            if ($LASTEXITCODE -ne 0) { Warn "  failed: $img"; $failed++ }
        }
    }
    if ($failed -eq 0) { Ok "All base images ready." }
    else { Warn "$failed image(s) failed to pull." }
}

# ── Change detection via git ──────────────────────────────────
function Get-ChangedServices {
    $null = & git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -ne 0) {
        Warn "Not inside a git repo — falling back to full rebuild"
        return , @(docker compose config --services 2>$null)
    }

    $roots = @("platform-lib", "frontend") + $SvcNames

    $paths = @(
        & git diff --name-only HEAD 2>$null
        & git ls-files --others --exclude-standard 2>$null
    ) | Sort-Object -Unique | Where-Object { $_ -ne "" }

    $hits = @{}
    foreach ($p in $paths) {
        foreach ($root in $roots) {
            if ($p -eq $root -or $p.StartsWith("$root/")) {
                $hits[$root] = $true
                break
            }
        }
    }

    $allServices = @(docker compose config --services 2>$null)

    if ($hits["platform-lib"]) {
        $result = @()
        foreach ($svc in $SvcNames) { $result += Expand-ComposeSvc $svc $allServices }
        if ($hits["frontend"]) { $result += "plm-frontend" }
        return , $result
    }

    $result = @()
    foreach ($svc in $SvcNames) {
        if ($hits[$svc]) { $result += Expand-ComposeSvc $svc $allServices }
    }
    if ($hits["frontend"]) { $result += "plm-frontend" }
    return , $result
}

# ── Wait for all compose services to be healthy ───────────────
function Wait-AllHealthy ([int]$Timeout = $HealthTimeout) {
    Log "Waiting for services to become healthy (max ${Timeout}s)..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    while ($sw.Elapsed.TotalSeconds -lt $Timeout) {
        $allOk   = $true
        $pending = @()

        $psLines = @(docker compose ps -a --format '{{.Service}}\t{{.Name}}\t{{.State}}' 2>$null)
        foreach ($line in $psLines) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $parts = $line -split "`t"
            if ($parts.Count -lt 3) { continue }
            $name  = $parts[1].Trim()
            $state = $parts[2].Trim()
            if ([string]::IsNullOrEmpty($name)) { continue }

            $healthLines = @(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' $name 2>$null)
            $health = if ($healthLines.Count -gt 0) { $healthLines[0].Trim() } else { "" }

            if (-not [string]::IsNullOrEmpty($health)) {
                if ($health -ne "healthy") {
                    $allOk = $false; $pending += "$name=$health"
                }
            } else {
                if ($state -ne "running" -and $state -ne "exited") {
                    $allOk = $false; $pending += "$name=$state"
                }
            }
        }

        if ($allOk) {
            Write-Host ""
            Ok "All services ready after $([int]$sw.Elapsed.TotalSeconds)s"
            return $true
        }
        Start-Sleep -Seconds 3
        Write-Host "." -NoNewline
    }

    Write-Host ""
    Err "Timeout after ${Timeout}s. Pending: $($pending -join ', ')"
    return $false
}

# ── URLs banner ───────────────────────────────────────────────
function Print-Banner {
    $bar = "  +" + ("-" * 49) + "+"
    Write-Host ""
    Write-Host $bar
    Write-Host ("  |  {0,-12} : http://localhost:{1,-5}          |" -f "Frontend", "3000")
    foreach ($svc in $SvcNames) {
        Write-Host ("  |  {0,-12} : http://localhost:{1,-5}          |" -f $svc, $SvcPort[$svc])
    }
    Write-Host $bar
    Write-Host ""
    Write-Host "  DBeaver (PostgreSQL):"
    Write-Host "    host=localhost  port=5432  db=plmdb  user=plm  password=changeme"
    Write-Host ""
    Write-Host "  docker compose logs -f [svc]   -> stream logs"
    Write-Host "  .\run.ps1 down                 -> stop containers"
    Write-Host ""
}

# ── Main dispatch ─────────────────────────────────────────────
$doBuild  = $false
$buildAll = $false
$targets  = @()

switch ($Command.ToLower()) {
    "pull-base" {
        Invoke-PullBaseImages
        exit 0
    }
    "down" {
        Log "Stopping containers..."
        docker compose down
        exit 0
    }
    "reset" {
        Write-Host ""
        Warn "This will destroy all database volumes and seed data."
        $confirm = Read-Host "  Continue? [y/N]"
        if ($confirm.ToLower() -ne "y") { Log "Aborted."; exit 0 }
        Log "Stopping containers and wiping volumes..."
        docker compose down --volumes --remove-orphans
        $doBuild  = $true
        $buildAll = $true
    }
    "build" {
        $doBuild = $true
        if ($Rest.Count -gt 0 -and $Rest[0] -eq "all") {
            $buildAll = $true
        } elseif ($Rest.Count -gt 0) {
            $targets = $Rest
        }
    }
    "" { <# start only — fall through to up #> }
    default {
        Err "Unknown command: $Command"
        Write-Host "Usage: .\run.ps1 [build [all|<svc>...] | reset | down | pull-base]"
        exit 1
    }
}

Build-PlatformLibImage

if ($doBuild) {
    if ($buildAll) {
        Log "Rebuilding all images..."
        docker compose build
        Assert-Exit "docker compose build"
    } elseif ($targets.Count -gt 0) {
        Log "Rebuilding: $($targets -join ', ')"
        docker compose build @targets
        Assert-Exit "docker compose build"
    } else {
        $targets = @(Get-ChangedServices)
        if ($targets.Count -eq 0) {
            Ok "No project changes detected — skipping build."
        } else {
            Log "Rebuilding changed projects: $($targets -join ', ')"
            docker compose build @targets
            Assert-Exit "docker compose build"
        }
    }
}

Log "Starting services..."
if ($targets.Count -gt 0 -and -not $buildAll) {
    docker compose up -d --no-deps --force-recreate @targets
    Assert-Exit "docker compose up --force-recreate"
    docker compose up -d
    Assert-Exit "docker compose up"
} else {
    docker compose up -d
    Assert-Exit "docker compose up"
}

if (-not (Wait-AllHealthy)) {
    Err "Some services did not become healthy. Check logs:  docker compose logs -f"
    exit 1
}

Print-Banner
