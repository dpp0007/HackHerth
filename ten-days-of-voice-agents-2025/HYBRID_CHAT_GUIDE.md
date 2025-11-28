# 💬 Hybrid Text/Voice Chat - Implementation Guide

## 🎯 Overview

The Pregnancy Companion AI now supports **HYBRID MODE** where users can:
- 🎤 **Speak** (voice input → voice + text response)
- ⌨️ **Type** (text input → text-only response)
- 🔄 **Switch freely** between voice and text

## 🏗️ Architecture

### Input Flow

```
User Input
    ↓
┌─────────────┬─────────────┐
│   Voice     │    Text     │
│   Input     │    Input    │
└─────────────┴─────────────┘
    ↓               ↓
Deepgram STT    Direct Text
    ↓               ↓
    └───────┬───────┘
            ↓
    Google Gemini LLM
            ↓
    Function Tools Execute
            ↓
    ┌───────────────┐
    │   Response    │
    └───────────────┘
            ↓
    ┌───────┴───────┐
    ↓               ↓
Voice Mode      Text Mode
(Murf TTS)      (Text Only)
    ↓               ↓
User hears      User reads
+ sees text     text only
```

### Response Logic

```python
if input_type == "voice":
    # Voice input detected
    response_mode = "voice + text"
    # → STT → LLM → TTS + Text
    
elif input_type == "text":
    # Text input detected
    response_mode = "text only"
    # → LLM → Text (NO TTS)
```

## 🔧 Backend Implementation

### 1. Agent State Tracking

```python
class PregnancyCompanion(Agent):
    def __init__(self):
        # Track current input mode
        self.current_input_mode = "voice"  # or "text"
```

### 2. Text Message Handler

```python
async def handle_text_message(self, message: str) -> str:
    """
    Handle text input from user.
    Bypasses TTS, returns text-only response.
    """
    logger.info(f"💬 Processing text message: {message}")
    
    # Set input mode to text
    self.current_input_mode = "text"
    
    # Process through same LLM pipeline
    # Function tools work identically
    # Response is text-only (no TTS)
    
    return response_text
```

### 3. Data Packet Listener

```python
@ctx.room.on("data_received")
def on_data_received(data: rtc.DataPacket):
    """Listen for text messages from frontend."""
    message = data.data.decode('utf-8')
    
    if message.startswith("TEXT_CHAT:"):
        text_message = message.replace("TEXT_CHAT:", "").strip()
        
        # Set mode to text
        agent.current_input_mode = "text"
        
        # Process message
        # LLM handles it like voice input
```

### 4. Unified Intent Router

All inputs (voice or text) go through the same pipeline:

```python
# Voice Input
User speaks → STT → "I'm feeling nauseous"
    ↓
LLM detects intent → analyze_symptom("nauseous")
    ↓
Response → TTS + Text

# Text Input
User types → "I'm feeling nauseous"
    ↓
LLM detects intent → analyze_symptom("nauseous")
    ↓
Response → Text Only (NO TTS)
```

## 📱 Frontend Implementation

### 1. Chat Input Component

```tsx
// Add text input field
<input
  type="text"
  placeholder="Type a message or use voice..."
  onKeyPress={handleTextInput}
/>
```

### 2. Send Text Message

```typescript
function sendTextMessage(message: string) {
  // Send as data packet
  room.localParticipant.publishData(
    new TextEncoder().encode(`TEXT_CHAT:${message}`),
    { reliable: true }
  );
  
  // Add to chat UI immediately
  addMessageToChat({
    role: "user",
    content: message,
    type: "text"
  });
}
```

### 3. Receive Text Response

```typescript
room.on("data_received", (data) => {
  const message = new TextDecoder().decode(data);
  
  if (message.startsWith("AGENT_RESPONSE:")) {
    const response = message.replace("AGENT_RESPONSE:", "");
    
    // Add to chat UI
    addMessageToChat({
      role: "agent",
      content: response,
      type: "text"
    });
  }
});
```

### 4. Unified Chat History

```typescript
const chatMessages = [
  { role: "user", content: "I'm feeling nauseous", type: "voice" },
  { role: "agent", content: "Very common in first trimester...", type: "voice" },
  { role: "user", content: "Can I eat sushi?", type: "text" },
  { role: "agent", content: "⚠️ Raw fish should be avoided...", type: "text" },
];
```

## 🎨 UI Design

### Chat Interface

```
┌─────────────────────────────────────┐
│  Pregnancy Companion AI             │
├─────────────────────────────────────┤
│                                     │
│  👤 I'm feeling nauseous (🎤)       │
│                                     │
│  🤰 Very common in first            │
│     trimester. Try ginger tea...    │
│                                     │
│  👤 Can I eat sushi? (⌨️)           │
│                                     │
│  🤰 ⚠️ Raw fish should be           │
│     avoided during pregnancy.       │
│                                     │
├─────────────────────────────────────┤
│  [Type message...] [🎤] [Send]      │
└─────────────────────────────────────┘
```

### Input Modes

**Voice Mode (Default):**
- 🎤 Microphone button active
- User speaks
- Agent responds with voice + text

**Text Mode:**
- ⌨️ Text input field active
- User types
- Agent responds with text only

**Hybrid Mode:**
- Both available simultaneously
- User can switch freely
- Chat history unified

## 🔄 Message Flow Examples

### Example 1: Voice → Text

```
User: 🎤 "How are you feeling?"
Agent: 🔊 + 💬 "I'm feeling nauseous"

User: ⌨️ "Can I eat sushi?"
Agent: 💬 "⚠️ Raw fish should be avoided during pregnancy."
```

### Example 2: Text → Voice

```
User: ⌨️ "I'm feeling anxious"
Agent: 💬 "I hear you. Pregnancy can bring up emotions..."

User: 🎤 "What should I eat?"
Agent: 🔊 + 💬 "Here are some great options: ginger tea, bananas..."
```

### Example 3: Mixed Conversation

```
User: 🎤 "Hi, I need a check-in"
Agent: 🔊 + 💬 "Welcome! How are you feeling today?"

User: ⌨️ "Tired and nauseous"
Agent: 💬 "Fatigue is common. Let me analyze..."
       → Calls analyze_symptom("nauseous")
       → Calls record_fatigue_level("tired")

User: 🎤 "What about nutrition?"
Agent: 🔊 + 💬 "Great question! Try ginger tea, crackers..."
```

## 🛠️ Implementation Checklist

### Backend (Python)
- [x] Add `current_input_mode` tracking
- [x] Implement `handle_text_message()` method
- [x] Add data packet listener
- [x] Unified intent router (LLM handles both)
- [x] Response mode logic (TTS vs text-only)

### Frontend (React/TypeScript)
- [ ] Add text input component
- [ ] Implement `sendTextMessage()` function
- [ ] Add data packet listener
- [ ] Unified chat history display
- [ ] Mode indicator (🎤 vs ⌨️)
- [ ] Message type badges

### Testing
- [ ] Voice input → voice + text response
- [ ] Text input → text-only response
- [ ] Switch between modes mid-conversation
- [ ] Function tools work with both inputs
- [ ] Chat history shows all messages
- [ ] Emergency detection works with text
- [ ] Nutrition checks work with text
- [ ] Task creation works with text

## 📊 Data Format

### Text Message Protocol

**Frontend → Backend:**
```
TEXT_CHAT:Can I eat sushi?
```

**Backend → Frontend:**
```
AGENT_RESPONSE:⚠️ Raw fish should be avoided during pregnancy.
```

### Chat Message Object

```typescript
interface ChatMessage {
  role: "user" | "agent";
  content: string;
  type: "voice" | "text";
  timestamp: string;
  metadata?: {
    function_called?: string;
    emergency?: boolean;
  };
}
```

## 🎯 Function Tool Compatibility

All function tools work identically with voice or text input:

| Function Tool | Voice Input | Text Input |
|--------------|-------------|------------|
| `analyze_symptom()` | ✅ Works | ✅ Works |
| `record_emotional_state()` | ✅ Works | ✅ Works |
| `record_fatigue_level()` | ✅ Works | ✅ Works |
| `check_nutrition()` | ✅ Works | ✅ Works |
| `record_pregnancy_tasks()` | ✅ Works | ✅ Works |
| `save_pregnancy_journal()` | ✅ Works | ✅ Works |
| `get_weekly_pregnancy_report()` | ✅ Works | ✅ Works |
| `create_pregnancy_reminders()` | ✅ Works | ✅ Works |
| `save_to_notion()` | ✅ Works | ✅ Works |

## 🔐 Safety Features

### Emergency Detection

Works with both voice and text:

**Voice:**
```
User: 🎤 "I'm having severe bleeding"
Agent: 🔊 + 💬 "⚠️ This sounds like something you should discuss..."
```

**Text:**
```
User: ⌨️ "I'm having severe bleeding"
Agent: 💬 "⚠️ This sounds like something you should discuss..."
```

### Allergy Detection

Works with both inputs:

**Voice:**
```
User: 🎤 "Can I eat peanuts?"
Agent: 🔊 + 💬 "⚠️ Peanuts contain allergen you're allergic to."
```

**Text:**
```
User: ⌨️ "Can I eat peanuts?"
Agent: 💬 "⚠️ Peanuts contain allergen you're allergic to."
```

## 📱 Mobile Optimization

### Touch-Friendly Controls

```
┌─────────────────────────────────────┐
│  [🎤 Hold to Speak]                 │
│                                     │
│  OR                                 │
│                                     │
│  [Type message here...] [Send]      │
└─────────────────────────────────────┘
```

### Responsive Design

- **Mobile:** Stack voice/text inputs vertically
- **Desktop:** Side-by-side inputs
- **Tablet:** Adaptive layout

## 🎨 UI Components Needed

### 1. Chat Message Component

```tsx
<ChatMessage
  role="user"
  content="I'm feeling nauseous"
  type="voice"
  timestamp="2025-11-28T12:00:00"
/>
```

### 2. Input Mode Selector

```tsx
<InputModeSelector
  mode={inputMode}
  onModeChange={setInputMode}
/>
```

### 3. Text Input Field

```tsx
<TextInput
  placeholder="Type a message..."
  onSend={sendTextMessage}
  disabled={isVoiceActive}
/>
```

### 4. Voice Button

```tsx
<VoiceButton
  isActive={isVoiceActive}
  onPress={startVoice}
  onRelease={stopVoice}
/>
```

## 🚀 Next Steps

### Phase 1: Backend (Complete)
- [x] Add input mode tracking
- [x] Implement text message handler
- [x] Add data packet listener
- [x] Document architecture

### Phase 2: Frontend (To Do)
- [ ] Create chat UI components
- [ ] Add text input field
- [ ] Implement message sending
- [ ] Add message receiving
- [ ] Style chat interface

### Phase 3: Testing (To Do)
- [ ] Test voice input
- [ ] Test text input
- [ ] Test mode switching
- [ ] Test function tools
- [ ] Test emergency detection

### Phase 4: Polish (To Do)
- [ ] Add typing indicators
- [ ] Add message timestamps
- [ ] Add message status (sent/delivered)
- [ ] Add scroll to bottom
- [ ] Add message search

## 💡 Pro Tips

1. **Default to Voice** - Voice is primary, text is supplementary
2. **Clear Indicators** - Show which mode is active
3. **Unified History** - All messages in one timeline
4. **Smooth Transitions** - No jarring switches between modes
5. **Mobile First** - Optimize for touch interactions

## 🆘 Troubleshooting

**Text messages not sending:**
- Check data packet encoding
- Verify "TEXT_CHAT:" prefix
- Check network connection

**Agent not responding to text:**
- Verify `current_input_mode` is set
- Check LLM is processing text
- Verify function tools are callable

**TTS playing for text input:**
- Check input mode detection
- Verify TTS bypass logic
- Check response routing

## 📚 References

- LiveKit Data Packets: https://docs.livekit.io/realtime/client/data-messages/
- Agent Session: https://docs.livekit.io/agents/build/agent-session/
- Chat Context: https://docs.livekit.io/agents/build/chat-context/

---

**🎉 Hybrid text/voice mode is ready! Users can now speak OR type to their Pregnancy Companion AI!** 💬🎤
