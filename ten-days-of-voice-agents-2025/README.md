# Pregnancy Companion - Voice & Chat AI Assistant 🤰

An intelligent pregnancy support system with voice and chat capabilities, featuring trend detection, risk scoring, and personalized care recommendations.

---

## ✨ Features

### 🎤 Voice & Chat
- Natural voice conversations with LiveKit
- Text chat interface
- Hybrid mode (switch between voice/text)
- Real-time responses

### 🧠 Intelligence Layer
- **Trend Detection** - Analyzes mood, symptoms, nutrition, tasks
- **Risk Scoring** - Normal/Watch/Critical levels (0-30/31-60/61+)
- **Personalization** - Learns from user interactions
- **Smart Reports** - Weekly/monthly/full pregnancy reports
- **Decision Support** - Prioritized action plans

### 🔒 Safety First
- **Emergency Detection** - 35 critical keywords
- **Response Validation** - Unsafe advice suppression
- **Healthcare Referrals** - Automatic escalation when needed

### ✅ Task Management
- **Todoist Integration** - Task sync via MCP
- **End-of-Conversation Tasks** - Automatic small care task assignment
- **Notion Backup** - Journal entries saved to Notion

---

## 🚀 Quick Start

### 1. Backend (Python Agent)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env.local
# Add your API keys to .env.local
python src/agent.py
```

### 2. Frontend (Next.js UI)
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

### 3. API Backend (Intelligence Layer)
```bash
cd api-backend
npm install
npm start
```

Open `http://localhost:3000` and start your pregnancy journey!

---

## 🎯 New Feature: End-of-Conversation Tasks

When you end a conversation with "thank you", "done", or "bye", the agent automatically:
1. ✅ Assigns ONE small pregnancy care task
2. ✅ Saves it internally
3. ✅ Syncs to Todoist
4. ✅ Confirms with you

**Example**:
```
User: "Thank you!"

Agent: "Before you go, I've added one small care task for you today:
📝 Drink one glass of water now
I've saved it to Todoist for you 💗"
```

**See**: [CONVERSATION_CLOSER_QUICK_START.md](CONVERSATION_CLOSER_QUICK_START.md)

---

## 📚 Documentation

- **[PHASE3_README.md](PHASE3_README.md)** - Intelligence layer features and API reference
- **[CONVERSATION_CLOSER_QUICK_START.md](CONVERSATION_CLOSER_QUICK_START.md)** - End-of-conversation task assignment guide

---

## 🔧 Configuration

### Environment Variables

**Backend** (`.env.local`):
```bash
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
GOOGLE_API_KEY=your-google-api-key
TODOIST_API_TOKEN=your-todoist-token
NOTION_API_KEY=your-notion-key
NOTION_DATABASE_ID=your-database-id
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

**API Backend** (`.env`):
```bash
PORT=3001
```

---

## 📊 Project Structure

```
ten-days-of-voice-agents-2025/
├── backend/                    # Python voice agent
│   ├── src/
│   │   ├── agent.py           # Main agent
│   │   ├── conversation_closer.py  # End-of-convo tasks
│   │   ├── todoist_handler.py
│   │   ├── notion_handler.py
│   │   └── ...
│   └── test_conversation_closer.py
│
├── frontend/                   # Next.js UI
│   ├── app/
│   ├── components/
│   └── ...
│
├── api-backend/               # Node.js intelligence API
│   ├── intelligence/          # Intelligence modules
│   │   ├── trend-detector.js
│   │   ├── risk-scorer.js
│   │   ├── personalization-engine.js
│   │   ├── smart-report-generator.js
│   │   ├── decision-engine.js
│   │   └── safety-engine.js
│   └── server.js
│
└── challenges/                # Daily challenges
```

---

## 🧪 Testing

### Test Conversation Closer
```bash
cd backend
python test_conversation_closer.py
```

### Test Intelligence API
```bash
cd api-backend
npm start

# In another terminal
curl http://localhost:3001/health
curl -X POST http://localhost:3001/intelligence/safety-check \
  -H "Content-Type: application/json" \
  -d '{"message": "I have severe bleeding"}'
```

---

## 📈 Intelligence API Endpoints

```
POST   /intelligence/analyze/:userId
GET    /intelligence/report/weekly/:userId
GET    /intelligence/report/monthly/:userId
GET    /intelligence/report/full/:userId
POST   /intelligence/action-plan/:userId
POST   /intelligence/safety-check
POST   /intelligence/validate-response
POST   /intelligence/learn/:userId
```

See [PHASE3_README.md](PHASE3_README.md) for complete API reference.

---

## 🎓 Usage

### Start a Conversation
1. Open frontend: `http://localhost:3000`
2. Click "Start Voice Session" or use text chat
3. Share how you're feeling
4. Get personalized pregnancy support

### End Conversation
Say "thank you" or "done" to:
- Get a small care task
- Sync to Todoist
- End gracefully

### View Reports
Ask: "How was my week?" or "Show my pregnancy summary"

---

## 🐛 Troubleshooting

### Agent won't start
- Check `.env.local` has all required keys
- Verify Python dependencies installed
- Check LiveKit connection

### Todoist sync fails
- Verify `TODOIST_API_TOKEN` is set
- Check token permissions
- Review logs: `logs/agent.log`

### Intelligence API errors
- Ensure `api-backend` is running on port 3001
- Check Node.js version (16+)
- Verify intelligence modules exist

---

## 💡 Tips

- Keep conversations natural and conversational
- Share symptoms, emotions, and concerns openly
- Complete assigned tasks for better health
- Check weekly reports for insights
- Use both voice and text as needed

---

**Built with ❤️ for expecting mothers**
