# 🎬 AI Video Translator

A production-ready full-stack platform that automatically dubs Hindi videos into natural English using a multi-step AI pipeline — similar to HeyGen and Rask AI.

---

## ✨ Features

- **Drag-and-drop video upload** — MP4, MOV, AVI, WebM up to 500 MB
- **5-step AI pipeline** — Extract → Transcribe → Translate → Voice → Merge
- **Groq Whisper** — Fast, accurate Hindi speech-to-text
- **LLaMA 3.3 70B** — Natural Hindi → English translation preserving emotion
- **Google TTS** — Natural English voice synthesis
- **FFmpeg** — Audio extraction and video merging
- **JWT Authentication** — Register, login, protected routes
- **Real-time status** — Live pipeline progress with auto-polling
- **Processing timeline** — Per-step audit trail with timings
- **Retry failed jobs** — One-click retry for any failed video
- **Download dubbed video** — Instant download of the final MP4
- **BullMQ + Redis** — Queue-based processing (optional; falls back to direct)
- **Cloudinary** — Optional cloud storage (uses local by default)
- **Docker Compose** — One-command full-stack deployment

---

## 🏗️ Architecture

```
┌────────────┐     ┌──────────────┐     ┌───────────────┐
│  React     │────▶│  Express API │────▶│  PostgreSQL   │
│  Frontend  │     │  (Node.js)   │     │  (users/vids) │
└────────────┘     └──────┬───────┘     └───────────────┘
                          │
                    ┌─────▼──────┐
                    │  BullMQ    │◀── Redis
                    │  Worker    │
                    └─────┬──────┘
                          │  5-step pipeline
              ┌───────────┼───────────────┐
              │           │               │
         ┌────▼───┐  ┌────▼────┐  ┌──────▼──────┐
         │ FFmpeg │  │  Groq   │  │  Google TTS │
         │ (audio)│  │ Whisper │  │  (TTS)      │
         └────────┘  └────┬────┘  └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  LLaMA    │
                    │ 3.3 70B   │
                    └───────────┘
```

---

## 📁 Folder Structure

```
ai-video-translator/
├── backend/
│   ├── src/
│   │   ├── app.ts                    # Express server entry
│   │   ├── config/
│   │   │   └── database.ts           # PostgreSQL + migrations
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── video.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT guard
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts  # Multer config
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   └── video.model.ts
│   │   ├── queues/
│   │   │   ├── video.queue.ts        # BullMQ setup
│   │   │   └── worker.ts             # Standalone worker
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── video.routes.ts
│   │   ├── services/
│   │   │   ├── pipeline.service.ts   # Orchestrates all steps
│   │   │   ├── ffmpeg.service.ts     # Audio extract + video merge
│   │   │   ├── groq.service.ts       # Whisper STT + LLaMA translation
│   │   │   ├── tts.service.ts        # gTTS voice generation
│   │   │   └── cloudinary.service.ts # Optional cloud storage
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── validation.ts
│   ├── .env                          # Environment variables
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Router + providers
│   │   ├── main.tsx
│   │   ├── index.css                 # Design system / Tailwind
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   └── video/
│   │   │       ├── ProcessingTimeline.tsx
│   │   │       ├── UploadCard.tsx
│   │   │       ├── VideoCard.tsx
│   │   │       └── VideoPreview.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useVideo.ts           # Status polling + history
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── VideoDetailPage.tsx
│   │   ├── services/
│   │   │   └── api.ts                # Axios client + API calls
│   │   └── types/
│   │       └── index.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── schema.sql                        # PostgreSQL DDL
├── docker-compose.yml
├── .env                              # Root env for Docker Compose
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | LTS recommended |
| PostgreSQL | 14+ | 
| FFmpeg | Any recent | `brew install ffmpeg` / `apt install ffmpeg` |
| Redis | 7+ | Optional — only for BullMQ queue |

---

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-video-translator

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, GROQ_API_KEY
```

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Minimum 32-character secret |
| `GROQ_API_KEY` | From console.groq.com |
| `REDIS_HOST` / `REDIS_PORT` | Optional, for BullMQ |

---

### 3. Create database

```bash
# Create DB
psql -U postgres -c "CREATE DATABASE ai_video_translator;"

# Apply schema (or let the app auto-migrate on startup)
psql -U postgres -d ai_video_translator -f schema.sql
```

---

### 4. Run backend

```bash
cd backend
npm run dev
# API available at http://localhost:5000
```

---

### 5. Run frontend

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

---

## 🐳 Docker Compose (Recommended)

The easiest way to run the entire stack:

```bash
# 1. Set your API keys
cp .env.example .env
# Edit .env with GROQ_API_KEY, JWT_SECRET

# 2. Start all services
docker compose up --build

# App:      http://localhost:3000
# API:      http://localhost:5000
# Postgres: localhost:5432
# Redis:    localhost:6379
```

To stop:
```bash
docker compose down
# Add -v to also delete volumes (database data)
docker compose down -v
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| GET | `/auth/me` | ✅ | Get current user |

**Register body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Auth response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

### Video

All video endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/video/upload` | Upload video (multipart/form-data) |
| GET | `/video/status/:id` | Poll processing status |
| GET | `/video/history` | List user's videos |
| GET | `/video/download/:id` | Download translated video |
| POST | `/video/retry/:id` | Retry a failed job |

**Upload form fields:**
- `video` — File (required)
- `source_language` — Default `hi`
- `target_language` — Default `en`

**Status response:**
```json
{
  "id": "uuid",
  "status": "transcribing",
  "transcript": "...",
  "translated_text": "...",
  "processing_steps": [
    { "step": "extract_audio", "status": "completed", "duration": 1234 },
    { "step": "transcribe",    "status": "in_progress" }
  ],
  "has_translated_video": false
}
```

---

## ⚙️ Processing Pipeline

```
Upload video (MP4/MOV)
        │
        ▼
① FFmpeg — Extract 16kHz mono WAV audio
        │
        ▼
② Groq Whisper large-v3 — Hindi speech → text
        │
        ▼
③ Groq LLaMA 3.3 70B — Hindi text → English text
        │  (preserves meaning, emotion, and tone)
        ▼
④ Google TTS (gTTS) — English text → MP3 speech (free, no key)
        │
        ▼
⑤ FFmpeg — Replace audio track in original video
        │
        ▼
Download translated MP4
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens with 7-day expiry
- **Helmet.js** — HTTP security headers
- **express-rate-limit** — 100 req/15 min per IP
- **CORS** — Restricted to configured frontend origin
- File type validation (MIME + extension)
- Max upload size enforced by Multer (500 MB)

---

## 🧩 Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| Express.js | HTTP server |
| TypeScript | Type safety |
| PostgreSQL + pg | Database |
| BullMQ + Redis | Job queue |
| Multer | File upload |
| bcryptjs | Password hashing |
| jsonwebtoken | Auth tokens |
| fluent-ffmpeg | Video/audio processing |
| axios | HTTP client for AI APIs |
| Winston | Structured logging |
| Helmet | Security headers |

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| React Dropzone | File drag-and-drop |
| React Hot Toast | Notifications |
| Framer Motion | Animations |
| Axios | HTTP client |
| date-fns | Date formatting |
| Lucide React | Icons |

---

## 🌍 Supported Languages

Currently configured for Hindi (hi) → English (en).

To add more languages:
1. Update `source_language` / `target_language` on upload
2. Change `language: 'hi'` in `groq.service.ts` transcribeAudio call
3. Update the translation prompt in `groq.service.ts`

Groq Whisper supports 99 languages. LLaMA 3.3 supports all major languages.

---

## 🔮 Roadmap / Additional Features

- [ ] **Subtitle generation** (SRT/VTT export)
- [ ] **Voice cloning** (clone original speaker's voice)
- [ ] **Wav2Lip lip sync** (synchronize lip movements)
- [ ] **YouTube URL import** (auto-download and dub)
- [ ] **Batch processing** (multiple videos at once)
- [ ] **Multiple language pairs** (e.g. Spanish → English)
- [ ] **Cloudinary CDN** (enable in `.env` for production)
- [ ] **Usage dashboard** with minutes processed
- [ ] **Email notifications** when processing completes
- [ ] **Webhook support** for external integrations

---

## 🐛 Troubleshooting

**FFmpeg not found**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

**Database connection refused**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -U postgres
```

**Redis connection error**
The app falls back to direct processing if Redis is unavailable. To enable the queue:
```bash
# macOS
brew install redis && brew services start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**Groq API error**
- Verify `GROQ_API_KEY` in `.env`
- Check rate limits at console.groq.com
- Groq Whisper accepts WAV files up to ~25MB

**Google TTS API error**
- Check your Google TTS character quota
- Free tier: 10,000 characters/month

---

## 📄 License

MIT — free to use, modify, and deploy.
