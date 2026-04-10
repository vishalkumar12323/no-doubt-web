# NoDoubt App — Full Stack Assignment

> A full-stack web application built with React, Node.js/Express, MongoDB, and WebSockets. Posts are fetched from the JSONPlaceholder API, stored in MongoDB Atlas, and displayed on a premium dark-mode React frontend with real-time search powered by WebSockets.

🔗 **Live Frontend:** `https://no-doubt-web.vercel.app/`  
🔗 **Live Backend API:** `https://no-doubt-web-1dv5.vercel.app/`  
⚡ **WebSocket Server:** `https://no-doubt-web-1.onrender.com/`

---

## 🗂 Folder Structure

```
/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── PostCard.jsx
│   │       └── SearchBar.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/           # Node.js + Express + WebSocket
│   ├── src/
│   │   ├── index.js        # REST API server
│   │   ├── wsServer.js     # WebSocket server (Render)
│   │   ├── models/Post.js
│   │   └── routes/posts.js
│   ├── vercel.json
│   └── package.json
│
├── render.yaml        # Render deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/vishalkumar12323/no-doubt-web.git
cd no-doubt-web
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env — replace <username>&<db_password> with your actual MongoDB Atlas username and password
npm install
npm run dev          # Starts REST API on http://localhost:5000
```

**In a second terminal:**
```bash
cd backend
npm run ws           # Starts WebSocket server on ws://localhost:8080
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev          # Opens http://localhost:3000
```

> The app will auto-seed 100 posts from JSONPlaceholder into MongoDB on first run (if the collection is empty).

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<username>:<password>@cluster.mongodb.net/nodoubt-app` |
| `PORT` | REST API port | `5000` |
| `WS_PORT` | WebSocket server port | `8080` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend Vercel URL (empty = uses Vite proxy in dev) | `https://my-backend.vercel.app` |
| `VITE_WS_URL` | WebSocket server URL | `wss://my-ws.onrender.com` |

---

## 📡 API Reference

### REST API (Express)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/posts/seed` | Fetch from JSONPlaceholder & upsert to MongoDB |
| `GET` | `/api/posts` | Get all posts (supports `?page=1&limit=100`) |
| `GET` | `/api/posts/:id` | Get single post by `postId` |

### WebSocket API

**Connect:** `ws://localhost:8080` (dev) or `wss://your-ws.onrender.com` (prod)

**Send (client → server):**
```json
{ "type": "search", "query": "your search term" }
```

**Receive (server → client):**
```json
{
  "type": "results",
  "query": "your search term",
  "count": 5,
  "posts": [{}, {}, ...]
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose) |
| WebSocket | `ws` library |
| External API | JSONPlaceholder |
| Deployment | Vercel (frontend + backend) + Render (WebSocket) |

---

## 📝 Notes
- The backend auto-seeds posts from JSONPlaceholder on startup if MongoDB is empty
- WebSocket falls back to local search if the connection is unavailable
