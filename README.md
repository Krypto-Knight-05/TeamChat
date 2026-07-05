# 💬 TeamChat

A real-time group collaboration chat application. Create teams, invite members via a unique Group ID, and chat instantly — all in a clean, professional interface.

**Live Demo:** [team-chat-wine.vercel.app](https://team-chat-wine.vercel.app)

---

## ✨ Features

- 🔐 **Auth** — Secure signup & login with JWT + bcrypt
- 🏷️ **Create Teams** — Auto-generates a unique 8-character Group ID to share
- 📩 **Join Requests** — Members request to join via Group ID; admin approves or rejects
- 🔔 **Real-time Notifications** — Accepted/rejected users get instant socket notifications
- 💬 **Live Group Chat** — Messages broadcast in real-time to all team members via WebSockets
- 📜 **Message History** — Previous messages load when you open a team
- 👤 **Sender Labels** — Consecutive messages are grouped under the sender's name

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| Socket.IO | Real-time WebSocket communication |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Database |
| JWT + bcrypt | Authentication |
| Zod | Request validation |

### Frontend
| Tool | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Socket.IO Client | Real-time connection |
| Axios | HTTP requests |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon (PostgreSQL) |

---

## 🗄️ Database Schema

```
User ──< TeamMember >── Team
User ──< JoinRequest >── Team
User ──< Message >── Team
```

- **User** — name, email, password
- **Team** — name, description, unique 8-char groupId, adminId
- **TeamMember** — links users to teams they belong to
- **JoinRequest** — pending/accepted/rejected requests to join a team
- **Message** — text messages tied to a team and sender

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone the repo

```bash
git clone https://github.com/Krypto-Knight-05/TeamChat.git
cd TeamChat
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/teamchat?schema=public"
JWT_SECRET="your-secret-key"
PORT=5555
CORS_ORIGIN="http://localhost:5173"
```

Run migrations and start:

```bash
npx prisma migrate dev --name init
npm run dev
```

Backend runs at `http://localhost:5555`

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🌐 Deployment

| Part | Platform | Config |
|---|---|---|
| Frontend | Vercel | Root dir: `client`, env: `VITE_API_URL` |
| Backend | Render | Root dir: `backend`, build: `npm install && npx prisma generate`, start: `npx prisma migrate deploy && node app.js` |
| Database | Neon | Free PostgreSQL, paste connection string as `DATABASE_URL` |

**Backend env vars on Render:**
```
DATABASE_URL   = (Neon connection string)
JWT_SECRET     = (any long random string)
CORS_ORIGIN    = https://your-app.vercel.app
```

**Frontend env var on Vercel:**
```
VITE_API_URL   = https://your-backend.onrender.com
```

---

## 📁 Project Structure

```
TeamChat/
├── backend/
│   ├── app.js                     # Express + Socket.IO server
│   ├── env.js                     # Typed env loader (zod)
│   ├── prisma/schema.prisma       # DB schema
│   ├── http/
│   │   ├── controllers/           # Request handlers
│   │   ├── middlewares/           # JWT auth middleware
│   │   ├── routes/                # Express routes
│   │   ├── schemas/               # Zod validation schemas
│   │   └── services/              # Business logic
│   └── socket/
│       ├── middleware/            # Socket JWT auth
│       └── handlers/              # Chat event handlers
│
└── client/
    └── src/
        ├── api/axios.js           # Axios instance
        ├── lib/socket.js          # Socket.IO singleton
        ├── context/authContext.jsx
        ├── Pages/
        │   ├── Signup.jsx
        │   ├── Signin.jsx
        │   └── Dashboard.jsx      # Main chat interface
        └── components/
            ├── CreateTeamModal.jsx
            ├── JoinTeamModal.jsx
            └── AdminRequestsPanel.jsx
```

---

## 🔌 Socket Events

| Event | Direction | Description |
|---|---|---|
| `team:join` | Client → Server | Join socket room for a team |
| `team:leave` | Client → Server | Leave a team's socket room |
| `chat:send` | Client → Server | Send a message to a team |
| `chat:new` | Server → Client | New message broadcast to team |
| `request:notify` | Client → Server | Admin notifies user of request result |
| `request:result` | Server → Client | User receives accept/reject notification |

---

## 📄 License

MIT
