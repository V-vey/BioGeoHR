@echo off
if "%~1"=="" (echo Usage: restore.bat backups\file.sql & exit /b 1)
set /p OK=This REPLACES the current database. Type YES to continue: 
if /i not "%OK%"=="YES" exit /b 1
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root biogeohr_backend < "%~1"
echo Restore complete.