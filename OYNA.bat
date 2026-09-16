@echo off
chcp 65001 >nul
title WAR ROOM 1942
echo =========================================================
echo   WAR ROOM 1942: 2. DUNYA SAVASI STRATEJI OYUNU
echo   Yerel sunucu baslatiliyor ve tarayici aciliyor...
echo =========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0start_server.ps1" -port 51942
pause
