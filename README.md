# GoldSync Live Visual Manager - Separated Architecture

The project has been separated into independent **Frontend** and **Backend** directories for easier deployment and maintenance.

## 📁 Structure

### [Backend](./backend)
Node.js server responsible for live price scraping (Puppeteer), MongoDB management, and security.
- **Run**: `cd backend && npm install && npm start`
- **Deployment**: Recommended for **Railway.app**.

### [Frontend](./frontend)
React + Vite dashboard with luxury Qatari design and high-precision pricing.
- **Run**: `cd frontend && npm install && npm run dev`
- **Build**: `cd frontend && npm run build`
- **Deployment**: Recommended for **Vercel**.
- **API routing**: Production should use same-origin `/api` rewrites instead of direct browser calls to the backend origin.

---

## 🚀 How to Launch Locally

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *The proxy will run on `http://localhost:3001`.*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The dashboard will run on `http://localhost:6066`.*
   *Local `/api/*` requests are proxied by Vite to `http://localhost:3001` by default.*

## 🔒 Security & Hardening
- **Silent Console**: In production, the browser console is completely wiped.
- **No API Keys**: The frontend does not contain any external API keys.
- **Force Proxy**: All pricing data must flow through the backend for origin concealment.
