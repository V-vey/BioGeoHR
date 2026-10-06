@echo off
set MYSQL=C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin
set DB=biogeohr_backend
set OUT=%~dp0backups
if not exist "%OUT%" mkdir "%OUT%"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set STAMP=%%i
"%MYSQL%\mysqldump.exe" -u root --single-transaction %DB% > "%OUT%\biogeohr_%STAMP%.sql"
xcopy /E /I /Y "%~dp0Backend\storage\app\public" "%OUT%\photos_%STAMP%" >nul
echo Backup saved to %OUT%\biogeohr_%STAMP%.sql