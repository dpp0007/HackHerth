# 🚀 Quick Start - Standalone Pregnancy Companion

## ⚡ **3-Step Setup**

### Step 1: Start Backend (Terminal 1)

```bash
cd api-backend
npm install
npm run dev
```

✅ Backend running on `http://localhost:3001`

---

### Step 2: Start Agent (Terminal 2)

```bash
cd backend
uv run python src/agent.py dev
```

✅ Agent connected to LiveKit

---

### Step 3: Start Frontend (Terminal 3)

```bash
cd frontend
pnpm dev
```

✅ Frontend running on `http://localhost:3000`

---

## 🧪 **Test It**

1. Open `http://localhost:3000`
2. Click "Begin Session"
3. Start talking or typing!

---

## 📊 **View Data**

### Check Backend Health
```bash
curl http://localhost:3001/health
```

### Start Session
```bash
curl -X POST http://localhost:3001/session/start
```

### Get Report (replace USER_ID)
```bash
curl http://localhost:3001/report/USER_ID?type=weekly
```

---

## 📁 **Data Location**

All user data stored in:
```
api-backend/data/user_{userId}.json
```

---

## 🔧 **Troubleshooting**

### Backend won't start
```bash
cd api-backend
rm -rf node_modules
npm install
npm run dev
```

### Agent won't connect
- Check backend is running on port 3001
- Check LiveKit credentials in `backend/.env.local`

### Frontend won't load
- Check backend is running
- Check agent is running
- Clear browser cache

---

## 🎉 **That's It!**

You now have a fully functional standalone Pregnancy Companion system!

**🤰 Enjoy!** 💚
