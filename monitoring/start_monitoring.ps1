# MicroGig Standalone Monitoring Launcher (No Docker Required)

Write-Host "Starting MicroGig Prometheus & Grafana Monitoring Stack..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$promExe = Get-ChildItem -Path "$scriptDir\prometheus-bin" -Recurse -Filter "prometheus.exe" | Select-Object -First 1 -ExpandProperty FullName
$grafanaExe = Get-ChildItem -Path "$scriptDir\grafana-bin" -Recurse -Filter "grafana-server.exe" | Select-Object -First 1 -ExpandProperty FullName
$configFile = "$scriptDir\prometheus\prometheus.yml"

if (-not $promExe) {
    Write-Host "Prometheus executable not found in $scriptDir\prometheus-bin" -ForegroundColor Red
    exit 1
}

if (-not $grafanaExe) {
    Write-Host "Grafana executable not found in $scriptDir\grafana-bin" -ForegroundColor Red
    exit 1
}

# Configure Grafana Native Provisioning
$grafanaRootDir = Split-Path -Parent (Split-Path -Parent $grafanaExe)
$datasourceTarget = "$grafanaRootDir\conf\provisioning\datasources\prometheus.yml"
$dashboardTarget = "$grafanaRootDir\conf\provisioning\dashboards\dashboard.yml"
$dashboardsFolder = "$scriptDir\grafana\dashboards"

# Create directories if needed
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $datasourceTarget) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dashboardTarget) | Out-Null

# Write native datasource config (Prometheus on localhost:9090)
@"
apiVersion: 1
datasources:
  - name: Prometheus
    uid: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
    editable: true
"@ | Out-File -FilePath $datasourceTarget -Encoding utf8 -Force

# Write native dashboard provisioning config pointing to local gigly dashboard
@"
apiVersion: 1
providers:
  - name: 'MicroGig Dashboards'
    orgId: 1
    folder: 'MicroGig Observability'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: '$($dashboardsFolder.Replace("\", "/"))'
"@ | Out-File -FilePath $dashboardTarget -Encoding utf8 -Force

Write-Host "Starting Prometheus Scraper on http://localhost:9090..." -ForegroundColor Cyan
Start-Process -FilePath $promExe -ArgumentList "--config.file=""$configFile""" -WindowStyle Normal

Write-Host "Starting Grafana Server on http://localhost:3000..." -ForegroundColor Cyan
Start-Process -FilePath $grafanaExe -ArgumentList "--homepath ""$grafanaRootDir""" -WorkingDirectory $grafanaRootDir -WindowStyle Normal

Write-Host "Prometheus and Grafana launched successfully!" -ForegroundColor Green
Write-Host "-> Prometheus UI: http://localhost:9090" -ForegroundColor Yellow
Write-Host "-> Grafana UI:    http://localhost:3000 (User: admin | Pass: admin)" -ForegroundColor Yellow
