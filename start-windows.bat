@echo off
cd /d "%~dp0"
echo Dang o thu muc: %cd%
echo.
echo Dang cai dat dependencies (co the mat 1-2 phut lan dau)...
call npm install
if errorlevel 1 (
  echo.
  echo LOI: npm install that bai. Kiem tra da cai Node.js chua (go "node -v" de kiem tra).
  pause
  exit /b 1
)
echo.
echo Dang khoi dong Expo (che do tunnel)...
call npx expo start --tunnel
pause
