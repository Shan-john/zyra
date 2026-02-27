@echo off
TITLE Zyra - AI-Driven ERP System
echo =======================================================
echo          STARTING ZYRA AI COMMAND CENTER
echo =======================================================
echo.

echo [1/3] Starting Python ML Microservice (FastAPI)...
start "Zyra ML Service" cmd /c "cd zyra-ml && call venv\Scripts\activate.bat 2>nul || echo Virtual env not found, running globally && uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting Node.js Backend Engine...
start "Zyra Backend" cmd /c "cd zyra-server && npm install && npm start"

echo [3/3] Starting React Frontend Dashboard...
start "Zyra Frontend" cmd /c "cd zyra-client && npm install && npm run dev"

echo.
echo All services have been started in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000
echo - ML Service: http://localhost:8000
echo.
echo Press any key to exit this launcher...
pause > nul
