# 📱 Woxify – Android App Guide

Ye project ab **Capacitor** ke saath Android app me convert ho chuka hai. Frontend (React) as-it-is app ke andar chalta hai, aur backend (Node/Express) aapke server par chalta hai.

```
Android App (frontend/android)  ──internet──▶  Backend server (backend/)  ──▶ Groq, ElevenLabs, FFmpeg, DB
```

> ⚠️ Backend phone ke andar nahi chal sakta (FFmpeg, PostgreSQL, Redis chahiye). Isliye backend ko kisi server / PC par chalana hoga aur app me uska URL dena hoga.

---

## 1️⃣ Backend chalao (ek baar)

```bash
cd backend
cp .env.example .env      # keys bharo: DATABASE_URL, JWT_SECRET, GROQ_API_KEY (free)
npm install
npm run dev               # ya docker-compose up --build (root folder se)
```

Backend ko phone se access karne ke options:
- **Same WiFi (testing):** `http://<PC-ka-IP>:5000` (jaise `http://192.168.1.5:5000`)
- **Tunnel:** `cloudflared tunnel --url http://localhost:5000`
- **Deploy:** Render / Railway / VPS (HTTPS recommended)

CORS pehle se Android app ke liye update hai (`backend/src/app.ts`).

---

## 2️⃣ APK banao

### Option A – GitHub Actions (Android Studio ki zaroorat nahi) ✅ easiest
1. Poora project GitHub repo me push karo.
2. Repo → **Actions → Build Android APK → Run workflow**.
3. 5-8 min baad **Artifacts → Woxify-debug-apk** download karo → `app-debug.apk` phone me install karo.

(Optional: repo secret `VITE_API_URL` me backend URL daal do to app me pehle se set aa jayega.)

### Option B – Apne PC par
Requirements: **Node 18+**, **JDK 17**, **Android Studio** (SDK 34).

```bash
cd frontend
npm install
npm run android:apk        # build + sync + gradle assembleDebug
```
APK yaha milegi: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Ya Android Studio se: `npm run android:sync && npm run android:open` → ▶ Run.

---

## 3️⃣ App me pehli baar
1. App kholo → **Server Settings** screen aayegi.
2. Backend URL daalo (e.g. `https://your-server.com`) → **Test Connection** → **Save**.
3. Register / Login karo aur video upload karo.

Baad me change karna ho to Login screen ke neeche **⚙ Server Settings**.

---

## Kya-kya badla gaya
| File | Change |
|---|---|
| `frontend/capacitor.config.ts` | App id `com.woxify.app`, splash/status bar |
| `frontend/src/config/server.ts` | Runtime backend URL (Settings se / `VITE_API_URL`) |
| `frontend/src/pages/ServerSettingsPage.tsx` | Naya Server Settings + connection test |
| `frontend/src/services/api.ts` | Dynamic base URL, hash-based redirect on 401 |
| `frontend/src/App.tsx` | Android me `HashRouter`, first-run redirect |
| `frontend/src/utils/download.ts` + video pages | Download button Android me system browser/Download Manager se |
| `frontend/android/` | Native Android project, icons, splash, cleartext (http) allowed |
| `backend/src/app.ts` | CORS for app + `trust proxy` |
| `.github/workflows/android-apk.yml` | Cloud APK build |

## Release APK / Play Store (baad me)
`cd frontend/android && ./gradlew bundleRelease` — signing keystore banana padega (Android Studio → Build → Generate Signed Bundle).

## Common problems
- **"Network Error"** → Server URL galat hai ya backend band hai; Settings me *Test Connection* karo.
- **Upload fail (bade video)** → Cloudflare free tunnel ~100MB request limit rakhta hai; direct server / VPS use karo.
- **Download pe kuch nahi hua** → video complete hone ke baad hi download hota hai; browser me Download Manager ki notification dekho.

---

## 🔑 API keys: kaunsi chahiye, kaunsi nahi
| Service | Zaroori? | Note |
|---|---|---|
| **ElevenLabs** | ❌ Nahi | Hata diya, ab free **Google TTS (gTTS)** use hota hai |
| **Groq** (`GROQ_API_KEY`) | ✅ Haan (free) | Hindi speech-to-text (Whisper) ke liye. Free key: console.groq.com |
| **Cloudinary** | ❌ Optional | Keys na ho to dubbed video server ke `outputs/` folder me save hogi |
| **PostgreSQL** (`DATABASE_URL`) | ✅ Haan | Free options: Neon / Supabase |

Note: gTTS ki ek hi voice hoti hai, isliye Male/Female voice option ka audio par asar nahi padta.
