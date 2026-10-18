# Smart Health — AI-assisted Health Centre & Supply Chain Management

A full-stack hackathon prototype for district PHC/CHC operations. It tracks medicine inventory, patient footfall, beds, doctor attendance and diagnostics, then surfaces transparent run-out estimates, cross-centre transfer suggestions and operational flags.

> **Prototype boundary:** the current “AI insights” are explainable rules and a seven-day consumption calculation, not a trained ML model. They are not medical advice. Verify stock and staffing before acting on recommendations. Do not enter patient-identifying or other sensitive health data.

## Tech stack

- Frontend: React, Vite, Material UI, Recharts, Axios
- API: Node.js, Express, Mongoose
- Database: MongoDB (MongoDB Atlas works well for a hackathon)
- Hosting: Render Static Site (frontend) + Render Web Service (backend)

## Folder structure

```text
smart-health-platform/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/db.js
│       ├── models/HealthCentre.js
│       ├── models/Medicine.js
│       ├── routes/centres.js
│       ├── routes/dashboard.js
│       ├── routes/medicines.js
│       ├── utils/analytics.js
│       ├── seed.js
│       └── server.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

## Run locally (bash / VS Code terminal)

Prerequisites: Node.js 20+ and a MongoDB database. Create a MongoDB Atlas cluster, create a database user, allow your current IP in Network Access, and copy the application connection URI. For a short-lived hackathon demo you may temporarily allow access from `0.0.0.0/0`, but use a strong password and tighten the network rule afterward.

### 1. Start the backend

```bash
cd smart-health-platform/backend
cp .env.example .env
# Open backend/.env and replace MONGODB_URI with your own connection string.
npm install
npm run seed
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` in place of `cp` if needed. `npm run seed` inserts four sample PHC/CHC centres and medicine inventory records; **it clears the prototype's existing centre and medicine collections first**, so run it only on a disposable demo database.

Backend URL: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 2. Start the frontend in a second terminal

```bash
cd smart-health-platform/frontend
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Environment variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/smart_health?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files. Keep only `.env.example` in GitHub and never place your MongoDB URI inside frontend variables.

## What works in this prototype

- Overview KPIs for footfall, available beds, doctor attendance and stock alerts.
- Create health-centre records and update their patient counts, bed occupancy, staffing and available diagnostic tests.
- Create medicine inventory records and adjust stock with quick `−1` / `+10` buttons.
- Stock-out / low-stock alerts and estimated days remaining using entered daily consumption.
- Transfer suggestions when one centre is below reorder level and another has stock above twice its reorder threshold for the same `genericName`.
- Centre watchlist based on doctor attendance below 60%, occupancy at or above 90%, medicine stock-outs and unavailable tests.
- Search, filters, responsive UI and operational charts.

## API routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/summary` | KPI summary, demand series, priority alerts |
| GET | `/api/dashboard/insights` | Stock forecasts, transfer suggestions, centre watchlist |
| GET | `/api/centres` | List centres with operational assessments |
| POST | `/api/centres` | Create centre |
| PATCH | `/api/centres/:id` | Update centre record |
| PATCH | `/api/centres/:id/operations` | Update operations snapshot |
| GET | `/api/medicines` | List medicine records; optional `?centreId=<id>` |
| POST | `/api/medicines` | Create inventory record |
| PATCH | `/api/medicines/:id` | Update stock or medicine details |
| DELETE | `/api/medicines/:id` | Delete inventory record |

## Deploy to Render

Create two Render services from the same GitHub repository.

### Backend — Web Service

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables:
  - `MONGODB_URI` = your Atlas connection string
  - `NODE_ENV` = `production`
  - `CLIENT_ORIGIN` = your deployed frontend URL (for example `https://smart-health-dashboard.onrender.com`)
  - `PORT` is assigned by Render automatically; code uses `process.env.PORT`

Deploy, then test `https://YOUR-BACKEND.onrender.com/api/health`.

### Frontend — Static Site

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Add environment variable `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`

Deploy the frontend. After its URL is known, set `CLIENT_ORIGIN` on the backend to that exact origin and redeploy the backend. `VITE_API_URL` is embedded at build time, so redeploy the frontend if you change it.

For a Render monorepo, keep the frontend and backend as separate services so the React static assets do not share a process with Express. Free-instance wake-up can take time, and provider plans/limits may change.

## Before a real deployment

This is a hackathon demo, not a production health IT system. Add authentication/role-based access, audit logging, request validation, rate limiting, backups, monitoring, stricter CORS, and security/privacy review. Add real demand forecasting only after obtaining quality historical data and evaluating it against a baseline. Operational flags are demo thresholds that administrators should configure and validate.
