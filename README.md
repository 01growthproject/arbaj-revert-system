# Arbaj Technology — Revert System

Daily revert form system for 3 companies:
- Growth Overseas International Edutech
- Famous Visa Consultant
- Ocean Global Overseas

## Project Structure

```
arbaj-revert-system/
├── server/    → Node + Express + MongoDB (deploy on Render)
└── client/    → React + Vite (deploy on Netlify)
```

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://mongodb.com/atlas → Create free account
2. Create a new cluster (free tier M0)
3. Database Access → Add user with username/password
4. Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
   Example: `mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/arbaj-revert`

---

## Step 2 — Backend Setup (Render)

```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
```

**.env values:**
```
MONGO_URI=mongodb+srv://...your atlas string...
JWT_SECRET=any_random_secret_string_here
ADMIN_PASSWORD=your_chosen_admin_password
PORT=5000
```

**Deploy on Render:**
1. Push server folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables (same as .env)
7. Deploy → Copy the URL (e.g. https://arbaj-server.onrender.com)

---

## Step 3 — Frontend Setup (Netlify)

```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL to your Render backend URL
```

**.env values:**
```
VITE_API_URL=https://arbaj-server.onrender.com
```

**Deploy on Netlify:**
1. Push client folder to GitHub
2. Go to https://netlify.com → Add new site → Import from Git
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. Add Environment Variable: `VITE_API_URL` = your Render URL
6. Deploy

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Agent Form — fill daily report |
| `/admin` | Admin Login |
| `/admin/dashboard` | Admin Dashboard — filter, view, export |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reports` | None | Submit report |
| GET | `/api/reports` | JWT | Get reports with filters |
| DELETE | `/api/reports/:id` | JWT | Delete report |
| POST | `/api/admin/login` | None | Admin login |

## Filter Query Params (GET /api/reports)

- `?company=Growth Overseas International Edutech`
- `?agentName=Rahul`
- `?date=2026-06-08`
- `?startDate=2026-06-01&endDate=2026-06-08`
