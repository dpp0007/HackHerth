# Pregnancy Companion AI - Setup Guide

## 🚀 Quick Start

The Pregnancy Companion AI is ready to use! Follow these steps to get started.

## 📋 Prerequisites

All prerequisites are already installed:
- ✅ Python 3.13.2
- ✅ Node.js v22.14.0
- ✅ pnpm 10.23.0
- ✅ uv 0.9.11

## 🔧 Configuration

### 1. Set Up Pregnancy Profile (Optional)

Create a pregnancy profile for personalized guidance:

```bash
cd backend
```

Create `pregnancy_data/profile.json`:

```json
{
  "lmp": "2024-09-01",
  "due_date": "2025-06-08",
  "current_week": 12,
  "trimester": 1,
  "allergies": ["peanuts", "shellfish"],
  "food_preferences": ["vegetarian"],
  "created_at": "2024-11-28T00:00:00"
}
```

**Or let the agent calculate it:**
- Provide Last Menstrual Period (LMP) date
- Agent will calculate due date and current week automatically

### 2. Customize Data (Optional)

#### Add Custom Foods
Edit `backend/pregnancy_data/foods.json` to add your favorite foods or regional dishes.

#### Add Custom Symptoms
Edit `backend/pregnancy_data/symptoms_guide.json` to add more symptom responses.

#### Customize Week Guide
Edit `backend/pregnancy_data/week_guide.json` for personalized week-by-week tips.

## 🎯 Running the Application

### Start Backend
```bash
cd backend
uv run python src/agent.py dev
```

### Start Frontend
```bash
cd frontend
pnpm dev
```

### Access the App
- **Local:** http://localhost:3000
- **Network:** http://192.168.0.238:3000 (for mobile testing)

## 💬 Using the Pregnancy Companion

### First Interaction

1. **Click "Begin Session"**
2. **Grant microphone permissions**
3. **Agent greets you:**
   - "Hi! Welcome to your pregnancy check-in. You're in week 12 of trimester 1. Your baby is about the size of a lemon. How are you feeling today? Any symptoms?"

### Conversation Flow

#### 1. Symptom Check
**You:** "I've been feeling nauseous"
**Agent:** Analyzes symptom → Provides guidance → Asks about emotional state

#### 2. Emotional State
**You:** "I'm feeling anxious but excited"
**Agent:** Supportive response → Asks about energy

#### 3. Fatigue Level
**You:** "I'm pretty tired"
**Agent:** Acknowledges fatigue → Asks about nutrition

#### 4. Nutrition Check
**You:** "Can I eat sushi?"
**Agent:** "⚠️ Raw fish should be avoided during pregnancy" → Asks about tasks

#### 5. Pregnancy Tasks
**You:** "Take prenatal vitamin, drink water, rest"
**Agent:** Recaps everything → Asks for confirmation

#### 6. Save & Integrate
**Agent:** "Would you like me to create reminders in Todoist? And should I save this to Notion?"
**You:** "Yes to both"
**Agent:** Creates reminders and saves to Notion

### Weekly Report

**You:** "How was my week?"
**Agent:** Provides comprehensive report:
- Check-in frequency
- Emotional patterns
- Symptom trends
- Nutrition engagement
- Tasks completed
- Encouragement

## 🚨 Emergency Handling

If you mention emergency keywords:
- bleeding
- fainting
- severe pain
- sudden swelling
- shortness of breath
- severe headache
- vision changes
- high fever
- regular contractions

**Agent will immediately respond:**
"⚠️ This sounds like something you should discuss with your healthcare provider right away. If you're experiencing severe symptoms, please call your doctor or go to the emergency room. Your health and baby's health come first."

## 📊 Data Storage

### Pregnancy Journal
**Location:** `backend/pregnancy_data/pregnancy_journal.json`

**Contains:**
- Date and time
- Pregnancy week and trimester
- Emotional state
- Fatigue level
- Symptoms with timestamps
- Nutrition queries and responses
- Pregnancy care tasks
- Summary

### Pregnancy Profile
**Location:** `backend/pregnancy_data/profile.json`

**Contains:**
- LMP and due date
- Current week and trimester
- Allergies
- Food preferences

## 🔗 Integrations

### Todoist
**What it does:**
- Creates pregnancy care reminders
- Adds 🤰 emoji prefix
- Sets high priority (3)
- Due date: today

**Example tasks:**
- 🤰 Take prenatal vitamin
- 🤰 Drink 8 glasses of water
- 🤰 Rest for 30 minutes

### Notion
**What it does:**
- Backs up pregnancy journal entries
- Creates database pages with:
  - Week and trimester
  - Emotional state
  - Fatigue level
  - Symptoms
  - Tasks
  - Summary

**Database properties needed:**
- Name (title)
- Date (date)
- Week (rich_text)
- Trimester (rich_text)
- Emotional State (rich_text)
- Fatigue (rich_text)
- Symptoms (rich_text)
- Tasks (rich_text)
- Summary (rich_text)

## 🎨 Customization

### Change Agent Personality

Edit `backend/src/agent.py` instructions:

```python
instructions="""You are a warm, supportive pregnancy companion...
```

### Add Custom Responses

Edit symptom responses in `backend/pregnancy_data/symptoms_guide.json`:

```json
{
  "symptom": "back pain",
  "response": "Your custom supportive response here..."
}
```

### Modify Nutrition Database

Add foods in `backend/pregnancy_data/foods.json`:

```json
{
  "name": "Avocado toast",
  "benefit": "Healthy fats and folate",
  "allergens": ["gluten"]
}
```

## 🔐 Safety Features

### 1. No Diagnosis
- Agent never diagnoses conditions
- Always encourages professional consultation
- Evidence-based information only

### 2. Emergency Escalation
- Real-time keyword monitoring
- Immediate supportive guidance
- Clear escalation messages

### 3. Allergy Protection
- Cross-references user allergies
- ⚠️ Warning symbols for conflicts
- Prevents unsafe recommendations

### 4. Trimester Awareness
- Adjusts guidance by pregnancy stage
- Week-specific information
- Appropriate symptom responses

## 📱 Mobile Testing

### Using ngrok (for HTTPS)

1. **Install ngrok:**
   ```bash
   choco install ngrok
   ```

2. **Start tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Open ngrok URL on phone**

4. **Grant microphone permissions**

5. **Start your pregnancy check-in!**

### Using Local Network

1. **Find your IP:** Already shown as http://192.168.0.238:3000

2. **Open on phone** (same WiFi network)

3. **Grant microphone permissions**

## 🐛 Troubleshooting

### Backend Issues

**Agent not starting:**
```bash
cd backend
uv sync
uv run python src/agent.py download-files
uv run python src/agent.py dev
```

**Import errors:**
```bash
cd backend
uv sync --reinstall
```

### Frontend Issues

**Connection timeout:**
- Check LiveKit credentials in `.env.local`
- Verify backend is running
- Try refreshing browser (Ctrl + Shift + R)

**No audio:**
- Grant microphone permissions
- Use Chrome or Edge browser
- Check audio input device

### Data Issues

**Profile not loading:**
- Check `pregnancy_data/profile.json` exists
- Verify JSON format is valid
- Check file permissions

**Journal not saving:**
- Check `pregnancy_data/` directory exists
- Verify write permissions
- Check backend logs for errors

## 📈 Monitoring

### Backend Logs

Watch for:
- `PREGNANCY_JOURNAL_JSON:` - Journal entries
- `✅ Created Todoist task:` - Task creation
- `✅ Saved to Notion:` - Notion sync
- `⚠️ Emergency keyword detected:` - Safety alerts

### Frontend Logs

Open browser console (F12) to see:
- Connection status
- WebSocket messages
- Audio stream status

## 🎯 Best Practices

### Daily Check-ins
- Check in at the same time each day
- Be honest about symptoms
- Track patterns over time

### Emergency Awareness
- Know when to escalate
- Have healthcare provider contact ready
- Don't rely solely on AI for medical decisions

### Data Privacy
- All data stored locally
- Todoist and Notion are optional
- Review privacy settings

### Nutrition Safety
- Always verify with healthcare provider
- Consider individual circumstances
- Update allergy profile regularly

## 🆘 Support

### Common Questions

**Q: Can I use this without Todoist/Notion?**
A: Yes! Both integrations are optional. Just say "no" when asked.

**Q: How accurate is the symptom analysis?**
A: It provides general guidance based on common pregnancy symptoms. Always consult your healthcare provider for medical advice.

**Q: Can I change my due date?**
A: Yes! Edit `pregnancy_data/profile.json` and update the `due_date` field.

**Q: What if I have twins?**
A: The agent provides general pregnancy guidance. Consult your healthcare provider for twin-specific advice.

**Q: Is my data private?**
A: Yes! All data is stored locally on your machine. Todoist and Notion integrations are optional and controlled by you.

## 🎉 You're Ready!

Your Pregnancy Companion AI is fully set up and ready to support your pregnancy journey. Remember:

- 💚 Be gentle with yourself
- 🤰 Every pregnancy is unique
- 👩‍⚕️ Always consult healthcare providers
- 📊 Track your patterns
- 🎯 Focus on self-care

**Enjoy your pregnancy journey with your AI companion!** 🌟
