@echo off
echo ============================================
echo Building CareerHack Candidate App
echo ============================================

echo.
echo [1/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [2/3] Building Next.js frontend...
cd frontend
call npm run build
cd ..

echo.
echo [3/3] Building backend...
pip install -r backend/requirements.txt

echo.
echo ============================================
echo Build complete!
echo ============================================
echo.
echo To start the app:
echo   cd backend
echo   python app.py
echo.
