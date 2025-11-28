# 🧪 Hybrid Chat Testing Guide

## 🎯 Quick Test Steps

### ✅ **Test 1: Enable Text Chat (30 seconds)**

1. Start backend:
   ```bash
   cd backend
   uv run python src/agent.py dev
   ```

2. Start frontend:
   ```bash
   cd frontend
   pnpm dev
   ```

3. Open http://localhost:3000

4. Click "Begin Session"

5. Click the chat icon (💬) in the control bar

6. **Expected:** Text input field appears at bottom

---

### ✅ **Test 2: Send Text Message (1 minute)**

1. Type in the text field: "Hello"

2. Click Send button or press Enter

3. **Expected:**
   - Message appears in chat with ⌨️ icon
   - Message shows on right side (coral background)
   - Console shows: "📝 Received agent text response: ..."

4. Check browser console (F12) for:
   ```
   Sending text message via data packet
   ```

---

### ✅ **Test 3: Voice Still Works (1 minute)**

1. Click microphone button (🎤)

2. Speak: "I'm feeling nauseous"

3. **Expected:**
   - Transcription appears with 🎤 icon
   - Agent responds with voice + text
   - Both messages in chat history

---

### ✅ **Test 4: Hybrid Mode (2 minutes)**

1. **Text:** Type "Can I eat sushi?"
   - Should appear with ⌨️ icon

2. **Voice:** Speak "What about nutrition?"
   - Should appear with 🎤 icon

3. **Text:** Type "How was my week?"
   - Should appear with ⌨️ icon

4. **Expected:**
   - All messages in unified history
   - Correct icons for each type
   - Auto-scroll to bottom
   - No conflicts

---

### ✅ **Test 5: Mobile View (1 minute)**

1. Resize browser to mobile width (< 640px)

2. Click chat icon

3. Type a message

4. **Expected:**
   - Text input visible and usable
   - Send button tappable (≥ 44px)
   - Keyboard doesn't hide messages
   - Chat scrolls smoothly

---

## 🐛 **Troubleshooting**

### Issue: Text input not visible
**Solution:** Click the chat icon (💬) to toggle it open

### Issue: Send button disabled
**Solution:** 
- Check if agent is connected (wait a few seconds)
- Type some text (button disabled when empty)

### Issue: Messages not appearing
**Solution:**
- Check browser console for errors
- Verify backend is running
- Check network tab for data packets

### Issue: No agent response
**Solution:**
- Backend needs to send `AGENT_RESPONSE:` messages
- Check backend logs for text message handling
- Verify `TEXT_CHAT:` prefix is sent

---

## 📊 **Expected Console Output**

### Frontend Console
```
📝 Received agent text response: Very common in first trimester...
Sending text message via data packet
```

### Backend Console
```
📝 Received text message: Can I eat sushi?
💬 Processing text message: Can I eat sushi?
```

---

## ✅ **Success Criteria**

- [x] Text input appears when chat icon clicked
- [x] Can type and send messages
- [x] Messages appear in chat with ⌨️ icon
- [x] Voice input still works with 🎤 icon
- [x] Both types in unified history
- [x] Auto-scroll works
- [x] Mobile-friendly
- [x] No errors in console

---

## 🎉 **Quick Verification**

Run this 2-minute test:

1. ✅ Open app → Click "Begin Session"
2. ✅ Click chat icon (💬)
3. ✅ Type "Hello" → Send
4. ✅ See message with ⌨️ icon
5. ✅ Click mic → Speak "Hi"
6. ✅ See message with 🎤 icon
7. ✅ Both messages in chat

**If all 7 steps work → SUCCESS! 🎊**

---

## 📝 **Test Scenarios**

### Scenario 1: Symptom Check via Text
```
User types: "I'm feeling nauseous"
Expected: Agent analyzes symptom, responds with text
```

### Scenario 2: Nutrition Query via Text
```
User types: "Can I eat sushi?"
Expected: Agent checks food safety, responds with ⚠️ warning
```

### Scenario 3: Weekly Report via Text
```
User types: "How was my week?"
Expected: Agent provides weekly summary
```

### Scenario 4: Mixed Conversation
```
User speaks: "I'm feeling anxious" (🎤)
Agent responds: "I hear you..." (🎤)
User types: "What should I eat?" (⌨️)
Agent responds: "Try ginger tea..." (⌨️)
```

---

## 🚀 **Ready to Test!**

1. Start backend
2. Start frontend
3. Open browser
4. Click "Begin Session"
5. Click chat icon
6. Start typing!

**🎊 Enjoy your hybrid text/voice Pregnancy Companion AI!** 💬🎤
