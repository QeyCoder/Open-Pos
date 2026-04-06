#!/bin/bash
echo "=============================================="
echo "Mom's Fresh Pot POS (Mac/Linux Installer)"
echo "=============================================="
echo ""

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "# Set your secure PIN to lock the system" > .env
    echo "MASTER_PIN=\"1234\"" >> .env
    echo "# Add your standard PostgreSQL URL here" >> .env
    echo "DATABASE_URL=\"postgresql://postgres:password@localhost:5432/moms_pos?schema=public\"" >> .env
    echo "[!] .env generated. Please configure your DATABASE_URL before proceeding!"
    exit 1
fi

echo "Installing Node Dependencies..."
npm install

echo ""
echo "Initializing Database..."
npx prisma db push

echo ""
echo "Starting Application on Local Server..."
echo "Open http://localhost:3000 in your browser!"
npm run dev
