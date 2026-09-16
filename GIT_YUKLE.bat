@echo off
chcp 65001 >nul
title GITHUB YUKLEME ARACI - WAR ROOM 1942
echo =========================================================
echo   WAR ROOM 1942 - GITHUB'A PROJEYI YUKLEME ARACI
echo   Hedef: https://github.com/Bugrakadiogluu/Strategy-Game.git
echo =========================================================
echo.
echo Proje dosyalari gonderiliyor...
echo (Eger ilk kez gonderiyorsaniz karsiniza cikacak GitHub oturum acma penceresini onaylayin)
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main --force
echo.
if %ERRORLEVEL% EQU 0 (
    echo =========================================================
    echo   TEBRIKLER! Proje basariyla GitHub'a yuklendi!
    echo   Adres: https://github.com/Bugrakadiogluu/Strategy-Game
    echo =========================================================
) else (
    echo.
    echo Bir hata olustu veya oturum acilmadi. Lutfen terminaldeki mesaji kontrol edin.
)
echo.
pause
