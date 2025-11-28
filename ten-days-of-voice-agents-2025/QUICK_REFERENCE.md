# 🤰 Pregnancy Companion AI - Quick Reference

## 🚀 Start Commands

```bash
# Backend
cd backend && uv run python src/agent.py dev

# Frontend
cd frontend && pnpm dev

# Access: http://localhost:3000
```

## 💬 Conversation Flow

1. **Symptom Check** → "How are you feeling? Any symptoms?"
2. **Emotional State** → "How's your emotional state?"
3. **Fatigue Level** → "How are your energy levels?"
4. **Nutrition** → "Any cravings or food concerns?"
5. **Tasks** → "Any pregnancy care tasks? 2-3 things."
6. **Recap** → Confirms everything
7. **Save** → Saves to JSON
8. **Integrate** → Todoist + Notion (optional)

## 🚨 Emergency Keywords

If you mention these, agent escalates immediately:
- bleeding, fainting, severe pain
- swelling, shortness of breath
- severe headache, vision changes
- high fever, contractions

## 🍎 Nutrition Features

- **Check food safety:** "Can I eat sushi?"
- **Get recommendations:** "What should I eat?"
- **Allergy aware:** ⚠️ warnings for conflicts

## 📊 Weekly Report

**Say:** "How was my week?"
**Get:**
- Emotional patterns
- Symptom trends
- Nutrition engagement
- Tasks completed
- Encouragement

## 📁 Data Locations

```
backend/pregnancy_data/
├── profile.json              # Your pregnancy profile
├── pregnancy_journal.json    # Daily entries
├── week_guide.json           # Week-by-week info
├── foods.json                # Nutrition database
└── symptoms_guide.json       # Symptom responses
```

## 🔧 Quick Fixes

**Backend not starting:**
```bash
cd backend
uv sync
uv run python src/agent.py download-files
```

**Frontend timeout:**
- Refresh browser (Ctrl + Shift + R)
- Check backend is running
- Verify .env.local credentials

**No audio:**
- Grant microphone permissions
- Use Chrome or Edge
- Check audio input device

## 🎯 Function Tools

| Tool | Purpose |
|------|---------|
| `analyze_symptom()` | Check symptoms, detect emergencies |
| `record_emotional_state()` | Track emotions with support |
| `record_fatigue_level()` | Monitor energy levels |
| `check_nutrition()` | Verify food safety |
| `record_pregnancy_tasks()` | Set 2-3 daily tasks |
| `save_pregnancy_journal()` | Save entry to JSON |
| `get_weekly_pregnancy_report()` | Weekly summary |
| `create_pregnancy_reminders()` | Todoist tasks |
| `save_to_notion()` | Notion backup |

## 🔐 Safety Rules

- ❌ Never diagnoses
- ✅ Always escalates emergencies
- ✅ Evidence-based only
- ✅ Encourages healthcare consultation
- ✅ Allergy-aware recommendations

## 📱 Mobile Access

**Local Network:** http://192.168.0.238:3000

**With ngrok:**
```bash
ngrok http 3000
# Use the https URL on your phone
```

## 🎨 Customization

**Change personality:**
Edit `backend/src/agent.py` instructions

**Add foods:**
Edit `backend/pregnancy_data/foods.json`

**Add symptoms:**
Edit `backend/pregnancy_data/symptoms_guide.json`

**Update profile:**
Edit `backend/pregnancy_data/profile.json`

## 📚 Full Documentation

- **TRANSFORMATION_SUMMARY.md** - What changed
- **PREGNANCY_TRANSFORMATION.md** - Technical details
- **PREGNANCY_SETUP.md** - Complete setup guide
- **README.md** - Original project info

## 💡 Pro Tips

1. **Daily check-ins** - Same time each day
2. **Be honest** - About symptoms and feelings
3. **Track patterns** - Use weekly reports
4. **Update allergies** - Keep profile current
5. **Consult providers** - For medical decisions

## 🆘 Support

**Common Issues:**
- Connection timeout → Refresh browser
- Import errors → `uv sync --reinstall`
- No profile → Create `pregnancy_data/profile.json`
- Tasks not creating → Check Todoist token

**Emergency:** Always contact healthcare provider for medical concerns!

---

**🎉 You're all set! Enjoy your pregnancy journey with your AI companion!** 💚
