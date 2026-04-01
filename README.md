# 📊 Daily Productivity Tracker

A full-stack web application for tracking daily tasks and measuring productivity, built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 **User Authentication** — Secure signup/login with JWT and bcrypt
- ✅ **Task Management** — Add, edit, delete, and complete daily tasks
- 📅 **Date-wise Organization** — View and manage tasks by date
- 🎯 **Priority Levels** — High, Medium, and Low task priorities
- 🏷️ **Categories & Tags** — Organize tasks with custom categories
- 🌙 **Night Planning** — Plan tomorrow's tasks from today's view
- 📊 **Analytics Dashboard** — Daily stats, weekly charts, productivity insights
- 🔄 **Drag & Drop** — Reorder tasks with drag-and-drop
- 🌗 **Dark/Light Mode** — Toggle between themes
- 📱 **Mobile Responsive** — Works on all screen sizes
- 🔍 **Search & Filter** — Find tasks by keyword, priority, category, or status
- 🔁 **Recurring Tasks** — Set up daily, weekly, or monthly recurring tasks

## 🚀 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS, Vite|
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB with Mongoose                   |
| Auth       | JWT (JSON Web Tokens), bcrypt           |
| Charts     | Recharts                                |
| DnD        | @dnd-kit                                |

## 📁 Project Structure

```
daily-tracker-copilot/
├── backend/                  # Node.js + Express API
│   ├── config/database.js    # MongoDB connection
│   ├── controllers/          # Route handler logic
│   ├── middleware/auth.js    # JWT authentication middleware
│   ├── models/               # Mongoose schemas (User, Task)
│   ├── routes/               # Express route definitions
│   ├── server.js             # Entry point
│   └── package.json
├── frontend/                 # React + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth, Theme, Task)
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # API client & helpers
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── SETUP.md                  # Detailed setup instructions
```

## ⚡ Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 API Reference

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /api/auth/register    | Create new account       | No   |
| POST   | /api/auth/login       | Sign in                  | No   |
| GET    | /api/auth/profile     | Get current user         | Yes  |
| PUT    | /api/auth/profile     | Update profile           | Yes  |
| GET    | /api/tasks            | List tasks (with filters)| Yes  |
| POST   | /api/tasks            | Create task              | Yes  |
| PUT    | /api/tasks/:id        | Update task              | Yes  |
| DELETE | /api/tasks/:id        | Delete task              | Yes  |
| PUT    | /api/tasks/reorder/bulk | Reorder tasks          | Yes  |
| GET    | /api/stats/daily      | Daily stats              | Yes  |
| GET    | /api/stats/weekly     | Weekly chart data        | Yes  |
| GET    | /api/stats/insights   | 30-day insights          | Yes  |

## 🛡️ Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with configurable expiry
- Rate limiting on auth endpoints (20 req/15 min)
- CORS restricted to configured origin
- Input validation with express-validator

## 📄 License

MIT