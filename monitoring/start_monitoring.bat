@echo off
echo ========================================================
echo Starting MicroGig Prometheus ^& Grafana Monitoring Stack
echo ========================================================

set SCRIPT_DIR=%~dp0
set PROM_EXE=%SCRIPT_DIR%prometheus-bin\prometheus-2.50.0.windows-amd64\prometheus.exe
set PROM_CFG=%SCRIPT_DIR%prometheus\prometheus.yml
set GRAF_EXE=%SCRIPT_DIR%grafana-bin\grafana-v10.3.1\bin\grafana-server.exe
set GRAF_DIR=%SCRIPT_DIR%grafana-bin\grafana-v10.3.1

echo.
echo Starting Prometheus on http://localhost:9090 ...
start "Prometheus Server" "%PROM_EXE%" --config.file="%PROM_CFG%"

echo.
echo Starting Grafana Server on http://localhost:3000 ...
start "Grafana Server" /D "%GRAF_DIR%" "%GRAF_EXE%" --homepath="%GRAF_DIR%"

echo.
echo ========================================================
echo Monitoring Stack Started Successfully!
echo Prometheus UI: http://localhost:9090
echo Grafana UI:    http://localhost:3000 (User: admin / Pass: admin)
echo ========================================================
