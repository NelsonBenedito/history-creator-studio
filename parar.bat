@echo off
chcp 65001 >nul
title History Creator AI Studio - Encerrar
echo Encerrando o backend e o frontend...

taskkill /FI "WINDOWTITLE eq History Creator - Backend*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq History Creator - Frontend*" /T /F >nul 2>nul

echo.
echo Processos encerrados (se estavam rodando).
echo.
pause
