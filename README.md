# Mom's Fresh Pot POS 🥘

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

An incredibly fast, open-source Point of Sale (POS) application architected specifically for restaurants requiring dynamic granular taxes, hardware thermal printing, running tables, and offline caching.

## Features
- **Print Formats:** Native UI splitting for 80mm generic thermal printers (KOTs, Tokens, and Final Bills).
- **White-Label Engine:** Change theme colors, UI Fonts, brand names, and GSTIN directly from the browser's persistent settings pane.
- **Granular Tax Engine:** Upload `.csv` menus natively attributing individual tax rates (`5%`, `18%`, etc.) to distinct items—aggregating dynamically.
- **Master Guard Auth:** A simple `MASTER_PIN` completely restricts access, granting 24-hr secure tokens locally to your POS station.
- **Offline Resilient:** Running Tables (Takeaway, Table 1-4) are cached purely via localStorage, tolerating browser refreshes effortlessly.

---

## 🚀 1-Click Installations

We provide several deployment tracks prioritizing extreme simplicity.

### 1. Docker Installation (Recommended 🌟)
The fastest way to install this system on *any* computer without touching code is by using Docker Containerization. This packages the Node.js application and the PostgreSQL database neatly for you.
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Run this command in the terminal inside this folder:
```bash
docker-compose up --build -d
```
3. Open `http://localhost:3000`. You're done!

### 2. Vercel Cloud (1-Click)
Deploying to the cloud? Just hook up a Railway Postgres Database and click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Make sure you configure `DATABASE_URL` and `MASTER_PIN` in your environment variables dynamically!

### 3. Local CLI Scripts (Offline Hardware)
If you already have PostgreSQL running on your hardware:
- **Windows:** Double-click `start-windows.bat`.
- **Mac/Linux:** Run `sh start-mac.sh`.
It automatically runs `npm install`, boots the Prisma schematics, and launches the register locally!
