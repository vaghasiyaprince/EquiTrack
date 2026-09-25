# EquiTrack 🚀

**EquiTrack** is an Indian stock market analysis and tracking platform built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), styled with the **Apple Design System** ([apple.design.md](./apple.design.md)).

---

## 📋 Project Specifications & Alignment

Developed strictly in accordance with:
- **Lab 02 (SRS Document)**: Software Requirements Specification covering functional requirements (R.1 User Management, R.2 Market Dashboard, R.3 Stock Management & Charts).
- **Lab 03 (REST API Documentation)**: Standardized JSON REST API endpoints with JWT session authentication.
- **Apple Design Language**: Two-row navigation, Action Blue (`#0066cc` / `#2997ff`), SF Pro typography with negative letter-spacing, signature `scale(0.95)` button micro-interactions, and 18px hairline utility cards.

---

## ✨ Features

### 1. User Management (R.1 / Lab 03 §1–§4)
- **User Registration (`POST /api/users/register`)**: Full Name, Email Address, and Password with validation and encryption (bcrypt).
- **User Login (`POST /api/users/login`)**: Authenticates credentials and issues JWT token saved in session.
- **View Profile (`GET /api/users/profile`)**: Displays user name and registered email.
- **Update Profile (`PUT /api/users/profile`)**: Updates name and optional new password with real-time feedback.
- **Logout**: Clears session and redirects to sign-in.

### 2. Market Dashboard (R.2 / Lab 03 §5)
- **Market Overview**: Live pulse and status banner.
- **Suggested Stocks (R.2.3 & R.2.4)**: 3-column store-style grid of recommended Indian equities; click opens Company Details.
- **Top Gainers & Top Losers (R.2.2)**: Side-by-side lists of highest advancing and declining equities with price and percentage badges.

### 3. Stock Management & Interactive Charts (R.3 / Lab 03 §6–§10)
- **Stock Search (`GET /api/stocks/search?q=...`)**: Instant debounced search by company name (e.g. Tata, Reliance) or ticker symbol (e.g. TCS.NS) with quick watchlist toggle.
- **Personalized Watchlist (`GET`, `POST`, `DELETE /api/watchlist`)**: Saved stocks list with current price, change %, added date, and one-click removal with confirmation toast.
- **Company Details & Interactive Price Chart (R.3.4–R.3.6)**:
  - Company overview, current price, day high, day low, and business description.
  - Interactive SVG price spline chart with cursor crosshair.
  - Duration timeframes explicitly specified in SRS: **`5m` (5 minutes)**, **`1d` (1 day)**, **`1w` (1 week)**, and **`1m` (1 month)**.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS (Apple Design System).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*Frontend runs on `http://localhost:5173` (with `/api` proxy forwarding to port 5000).*

---

## 📄 License
ISC