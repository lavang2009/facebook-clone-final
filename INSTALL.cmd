@echo off
setlocal
cd /d %~dp0

echo Installing frontend...
cd frontend
npm install
cd ..

echo Done.
pause
