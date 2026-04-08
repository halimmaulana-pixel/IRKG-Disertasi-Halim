@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "DB_FILE=%BACKEND%\data\db\irkg.db"

echo [IRKG] Root: %ROOT%

if not exist "%DB_FILE%" (
  echo [IRKG] Database belum ada. Membuat schema kosong...
  pushd "%BACKEND%"
  python -m services.init_empty_db
  if errorlevel 1 (
    echo [IRKG] Gagal membuat schema database kosong.
    popd
    exit /b 1
  )
  popd
)

echo [IRKG] Menjalankan backend...
start "IRKG Backend" cmd /k "cd /d \"%BACKEND%\" && uvicorn main:app --port 8000"

echo [IRKG] Menjalankan frontend...
start "IRKG Frontend" cmd /k "cd /d \"%FRONTEND%\" && npm run dev"

ping 127.0.0.1 -n 3 >nul
start "" "http://localhost:5173"

echo [IRKG] Selesai. Browser dibuka ke http://localhost:5173
echo [IRKG] Docs API: http://127.0.0.1:8000/docs
exit /b 0
