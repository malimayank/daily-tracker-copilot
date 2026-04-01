# 🛠️ Setup Guide

Complete instructions for running the Daily Productivity Tracker locally.

## Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (bundled with Node)
- **MongoDB** — either local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Git**

---

## 1. Clone the Repository

```bash
git clone https://github.com/malimayank/daily-tracker-copilot.git
cd daily-tracker-copilot
```

---

## 2. Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/daily-tracker
JWT_SECRET=change_this_to_a_long_random_string_at_least_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

> **MongoDB Atlas (cloud):** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<username>:<password>@cluster.mongodb.net/daily-tracker?retryWrites=true&w=majority`

### Start Backend Server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.  
Test it: `curl http://localhost:5000` → `{"message":"Daily Tracker API is running"}`

---

## 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Open `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start Frontend Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Build for Production

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. Serve them with any static file host (Nginx, Vercel, Netlify, etc.).

### Backend

No build step required. Use a process manager like [PM2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
cd backend
pm2 start server.js --name daily-tracker-api
```

---

## 5. MongoDB Setup (Local)

### Option A: Install MongoDB locally

1. Follow the [official guide](https://www.mongodb.com/docs/manual/installation/) for your OS.
2. Start MongoDB: `mongod --dbpath /data/db`
3. Use URI: `mongodb://localhost:27017/daily-tracker`

### Option B: MongoDB Atlas (Free Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user (Settings → Database Access)
4. Whitelist your IP (Security → Network Access → Add IP: `0.0.0.0/0`)
5. Get connection string (Clusters → Connect → Connect your application)
6. Paste it as `MONGODB_URI` in `backend/.env`

---

## 6. Project Structure Reference

```
daily-tracker-copilot/
├── backend/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # register, login, profile
│   │   ├── taskController.js   # CRUD + reorder + bulk
│   │   └── statsController.js  # daily, weekly, insights
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── Task.js             # Task schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── stats.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # LoginForm, SignupForm
│   │   │   ├── Common/         # Navbar, Modal, Button, LoadingSpinner
│   │   │   ├── Dashboard/      # DashboardStats, WeeklyChart, ProductivityInsights
│   │   │   ├── NightPlanning/  # NightPlanningModal
│   │   │   └── Tasks/          # TaskItem, TaskForm, TaskList, TaskFilter
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── TaskContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── TasksPage.tsx
│   │   ├── types/index.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── README.md
└── SETUP.md
```

---

## 7. Troubleshooting

### `ECONNREFUSED` on frontend API calls
- Make sure the backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`

### MongoDB connection failure
- Ensure MongoDB is running locally, or your Atlas URI is correct
- Check that your IP is whitelisted in Atlas Network Access

### JWT errors
- Make sure `JWT_SECRET` in `backend/.env` is set and matches between restarts
- Tokens expire after `JWT_EXPIRE` (default 7 days); log out and back in

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000
# Kill it
kill -9 <PID>
```

### Frontend TypeScript errors
```bash
cd frontend
npx tsc --noEmit  # Check for type errors
```
