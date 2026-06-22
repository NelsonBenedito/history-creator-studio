@echo off
chcp 65001 >nul
title History Creator AI Studio - Launcher
color 0E

echo ============================================
echo   History Creator AI Studio - Iniciando...
echo ============================================
echo.

REM Pega a pasta onde este .bat esta salvo (raiz do projeto)
set "ROOT=%~dp0"

REM ---------- Checagem do Node.js ----------
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado no PATH.
    echo Instale o Node.js em https://nodejs.org antes de continuar.
    echo.
    pause
    exit /b 1
)

REM ---------- Checagem do .env do backend ----------
if not exist "%ROOT%server\.env" (
    echo [AVISO] Arquivo server\.env nao encontrado.
    echo Copiando server\.env.example para server\.env...
    copy "%ROOT%server\.env.example" "%ROOT%server\.env" >nul
    echo.
    echo IMPORTANTE: abra server\.env e cole sua chave GEMINI_API_KEY
    echo antes de gerar cronogramas pelo app.
    echo.
    pause
)

REM ---------- Instala dependencias do backend, se necessario ----------
if not exist "%ROOT%server\node_modules" (
    echo Instalando dependencias do servidor pela primeira vez...
    pushd "%ROOT%server"
    call npm install
    popd
)

REM ---------- Instala dependencias do frontend, se necessario ----------
if not exist "%ROOT%client\node_modules" (
    echo Instalando dependencias do frontend pela primeira vez...
    pushd "%ROOT%client"
    call npm install
    popd
)

echo.
echo Subindo o backend (porta 3001)...
start "History Creator - Backend" cmd /k "cd /d "%ROOT%server" && npm run dev"

echo Aguardando o backend iniciar...
timeout /t 4 /nobreak >nul

echo Subindo o frontend (porta 5173)...
start "History Creator - Frontend" cmd /k "cd /d "%ROOT%client" && npm run dev"

echo Aguardando o frontend iniciar...
timeout /t 5 /nobreak >nul

echo Abrindo o navegador...
start "" "http://localhost:5173"

echo.
echo ============================================
echo   Tudo pronto! Duas janelas pretas ficarao
echo   abertas rodando o servidor e o app.
echo   NAO FECHE essas janelas enquanto estiver
echo   usando o programa.
echo ============================================
echo.
pause
