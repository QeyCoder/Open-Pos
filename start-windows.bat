@echo off
echo ==============================================
echo Mom's Fresh Pot POS (Local Windows Installer)
echo ==============================================
echo.

if not exist ".env" (
    echo Creating .env file...
    echo # Set your secure PIN to lock the system
    echo MASTER_PIN="1234" > .env
    echo # Standard Local Postgres URL
    echo DATABASE_URL="postgresql://postgres:password@localhost:5432/moms_pos?schema=public" >> .env
    echo [!]- .env generated. Please open it to enter your actual PostgreSQL URL if different.
    pause
)

echo.
echo Installing Node Dependencies...
call npm install

echo.
echo Initializing Database Schemas...
call npx prisma db push

echo.
echo Starting Local Server...
echo Visit http://localhost:3000 in your browser.
call npm run dev
