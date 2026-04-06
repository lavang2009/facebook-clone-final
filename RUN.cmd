@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

if not exist frontend
ode_modules (
  echo Installing frontend dependencies...
  cd frontend
  npm install
  cd ..
)

start "SocialWave Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo SocialWave is starting...
echo Open http://localhost:5173
pause
