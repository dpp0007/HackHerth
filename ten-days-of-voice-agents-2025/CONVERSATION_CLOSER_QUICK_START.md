# Conversation Closer - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Verify Installation (30 seconds)

```bash
cd backend

# Check new files exist
ls src/conversation_closer.py
ls test_conversation_closer.py

# Check agent was updated
grep "conversation_closer" src/agent.py
```

Expected output:
```
✅ src/conversation_closer.py exists
✅ test_conversation_closer.py exists
✅ agent.py contains conversation_closer imports
```

---

### 2. Run Tests (1 minute)

```bash
python test_conversation_closer.py
```

Expected output:
```
🚀 Running Conversation Closer Tests
====================================

🧪 Testing closure detection...
  ✅ 'thank you' -> True
  ✅ 'thanks' -> True
  ✅ 'done' -> True
  ...
✅ ALL TESTS PASSED!
```

---

### 3. Test Live (3 minutes)

#### Start Agent
```bash
python src/agent.py
```

#### Have Conversation
```
User: "How are you feeling today?"
Agent: "I'm here to support you..."

User: "I'm feeling anxious"
Agent: [records emotional state]

User: "Thank you"
Agent: "Before you go, I've added one small care task for you today:

📝 Take 5 slow deep breaths

I've saved it to Todoist for you 💗

Take care and check back anytime."
```

#### Verify Task Saved
```bash
# Check internal storage
cat pregnancy_data/closure_tasks.json

# Check Todoist
# Open Todoist app/website
# Look for task: "🤰 Take 5 slow deep breaths"
```

---

## 🎯 How It Works

### Trigger Phrases
User says any of these:
- "thank you" / "thanks"
- "done" / "that's all"
- "okay" / "got it"
- "bye" / "goodbye"

### What Happens
1. ✅ Agent detects closure phrase
2. ✅ Selects ONE small task based on context
3. ✅ Saves task internally
4. ✅ Syncs to Todoist
5. ✅ Confirms to user
6. ✅ Ends conversation gracefully

### Task Selection Logic
- **Anxious** → Breathing exercises
- **Exhausted** → Rest tasks
- **Nausea** → Nutrition tasks
- **Default** → Hydration tasks

---

## 📝 Example Tasks

### Hydration
- "Drink one glass of water now"
- "Have a glass of water before your next meal"

### Rest
- "Rest on your left side for 10 minutes"
- "Lie down and elevate your feet for 5 minutes"

### Breathing
- "Take 5 slow deep breaths"
- "Practice 3 minutes of calm breathing"

### Nutrition
- "Eat something light like fruit or nuts"
- "Have a healthy snack within the hour"

### Connection
- "Send a message to someone you trust"
- "Call or text a loved one"

### Movement
- "Take a gentle 5-minute walk"
- "Do 3 gentle stretches"

### Self-care
- "Listen to calming music for 10 minutes"
- "Write down one thing you're grateful for"

---

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
TODOIST_API_TOKEN=your_token_here
TODOIST_PROJECT_ID=your_project_id  # Optional
```

### Customize Tasks
Edit `src/conversation_closer.py`:
```python
CARE_TASKS = {
    "hydration": [
        "Drink one glass of water now",
        # Add your custom tasks here
    ]
}
```

### Add Closure Phrases
Edit `src/conversation_closer.py`:
```python
CLOSURE_PHRASES = [
    "thank you", "thanks",
    # Add your custom phrases here
    "all set", "perfect"
]
```

---

## 🐛 Troubleshooting

### Issue: Task not assigned
**Check**:
1. Did you say a closure phrase?
2. Check logs: `grep "🔚" logs/agent.log`
3. Verify LLM is calling the function

**Fix**: Add more explicit closure phrase

---

### Issue: Todoist sync failed
**Check**:
1. Is `TODOIST_API_TOKEN` set?
2. Is token valid?
3. Check logs: `grep "Todoist" logs/agent.log`

**Fix**: Verify token in `.env.local`

---

### Issue: Wrong task selected
**Check**:
1. What was the context?
2. Check logs: `grep "Selected task" logs/agent.log`

**Fix**: Adjust task selection logic in `conversation_closer.py`

---

## 📊 Monitoring

### Check Internal Storage
```bash
cat pregnancy_data/closure_tasks.json | jq '.'
```

### Check Logs
```bash
# Watch for closure events
tail -f logs/agent.log | grep "🔚\|📝\|✅"
```

### Check Todoist
```bash
# Via API
curl https://api.todoist.com/rest/v2/tasks \
  -H "Authorization: Bearer $TODOIST_API_TOKEN"
```

---

## ✅ Success Checklist

- [ ] Tests pass
- [ ] Agent starts without errors
- [ ] Closure phrase detected
- [ ] Task assigned
- [ ] Task saved internally
- [ ] Task synced to Todoist
- [ ] Confirmation message shown
- [ ] No breaking changes to existing features

---

## 🎓 Usage Tips

### Do's ✅
- Say clear closure phrases
- Let agent finish response
- Check Todoist for tasks
- Complete assigned tasks

### Don'ts ❌
- Don't say closure phrase mid-conversation
- Don't expect multiple tasks
- Don't rely on it for medical tasks

---

## 📚 Full Documentation

For complete details, see:
- `CONVERSATION_CLOSER_FEATURE.md` - Full feature documentation
- `src/conversation_closer.py` - Source code with comments
- `test_conversation_closer.py` - Test suite

---

## 🎉 You're Ready!

The feature is installed and ready to use. Just:
1. Start the agent
2. Have a conversation
3. Say "thank you"
4. Get your care task!

**Happy pregnancy journey! 💗**
