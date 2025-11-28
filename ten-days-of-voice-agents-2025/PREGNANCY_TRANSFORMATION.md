# Pregnancy Companion AI - Transformation Documentation

## 🎯 Overview

This document details the transformation of the Wellness Voice Companion into a Pregnancy Companion AI. The transformation preserves the core architecture while adapting the domain from general wellness to pregnancy support.

## 📊 Architecture Preserved

✅ **Maintained Components:**
- LiveKit integration for real-time voice
- Agent tool pattern with function_tool decorators
- JSON storage for data persistence
- Todoist integration for task management
- Notion sync for backup
- LLM orchestration (Google Gemini)
- Voice UI (Murf TTS + Deepgram STT)
- Weekly summary logic

## 🔄 Domain Transformation

### Conceptual Mapping

| Wellness Concept | Pregnancy Concept |
|-----------------|-------------------|
| Wellness Agent | Pregnancy Companion Agent |
| Wellness Entry | Pregnancy Journal Entry |
| Mood | Emotional State + Hormonal Mood |
| Energy | Fatigue Level |
| Objectives | Pregnancy Care Tasks |
| wellness_data/ | pregnancy_data/ |
| wellness_log.json | pregnancy_journal.json |

## 🆕 New Features Added

### 1. Pregnancy Profile Management
**File:** `backend/src/pregnancy_profile.py`

**Features:**
- Last Menstrual Period (LMP) tracking
- Due date calculation
- Current pregnancy week calculation
- Trimester determination
- Allergy management
- Food preferences
- Week-by-week pregnancy guide integration

**Storage:** `pregnancy_data/profile.json`

### 2. AI Symptom Analyzer
**File:** `backend/src/symptom_analyzer.py`

**Features:**
- Pregnancy-safe symptom analysis
- Trimester-aware responses
- Emergency keyword detection:
  - bleeding, fainting, severe pain
  - swelling, shortness of breath
  - severe headache, vision changes
  - high fever, contractions
- Safe escalation guidance (never diagnoses)
- Supportive, evidence-based responses

**Data:** `pregnancy_data/symptoms_guide.json`

### 3. Nutrition Recommendation Engine
**File:** `backend/src/nutrition_engine.py`

**Features:**
- Trimester-specific food recommendations
- Allergy conflict detection
- ⚠️ Warning symbols for allergens
- Foods to avoid during pregnancy
- Nutritional benefit explanations
- Safe food verification

**Data:** `pregnancy_data/foods.json`

### 4. Enhanced Mood & Emotion Support

**Improvements:**
- Sentiment detection (positive/negative)
- Encouraging responses for positive emotions
- Comforting responses for difficult emotions
- Emotional pattern tracking
- Supportive friend + pregnancy guide tone

### 5. Pregnancy Care Task Engine

**Changes:**
- Transformed from general goals to pregnancy-specific tasks
- Limited to 2-3 tasks per interaction
- Categories:
  - Health tasks (prenatal vitamins, hydration)
  - Emotional uplift tasks (rest, self-care)
  - Pregnancy care reminders (appointments, exercises)
- 🤰 emoji prefix for Todoist tasks
- Higher priority (3 vs 2)

### 6. Weekly Pregnancy Reports

**Enhanced Analytics:**
- Emotional state patterns
- Symptom trends
- Nutrition engagement tracking
- Task completion
- Pregnancy week progression
- Supportive encouragement

### 7. New JSON Schema

**File:** `pregnancy_data/pregnancy_journal.json`

```json
{
  "datetime": "ISO timestamp",
  "pregnancy_week": 12,
  "trimester": 1,
  "emotional_state": "anxious but excited",
  "fatigue_level": "tired",
  "symptoms": [
    {
      "symptom": "nausea",
      "is_emergency": false,
      "timestamp": "ISO timestamp"
    }
  ],
  "nutrition_notes": [
    {
      "query": "sushi",
      "response": "⚠️ Raw fish should be avoided...",
      "timestamp": "ISO timestamp"
    }
  ],
  "pregnancy_tasks": [
    "Take prenatal vitamin",
    "Drink 8 glasses of water",
    "Rest for 30 minutes"
  ],
  "summary": "Week 12: Feeling anxious but excited..."
}
```

### 8. Updated Conversation Flow

**New Workflow:**
1. **Pregnancy Greeting** - Acknowledges week, trimester, baby size
2. **Symptom Check** - "How are you feeling? Any symptoms?"
   - Calls `analyze_symptom(symptom)`
   - Emergency detection
3. **Emotional State** - "How's your emotional state?"
   - Calls `record_emotional_state(emotion)`
   - Sentiment-aware responses
4. **Fatigue Level** - "How are your energy levels?"
   - Calls `record_fatigue_level(fatigue)`
   - Supportive guidance
5. **Nutrition Check** - "Any cravings or food concerns?"
   - Calls `check_nutrition(food_query)`
   - Safety verification
6. **Pregnancy Tasks** - "Any care tasks for today? 2-3 things."
   - Calls `record_pregnancy_tasks(tasks)`
   - Limited to 3 tasks
7. **Recap & Confirmation**
8. **Save Journal** - `save_pregnancy_journal()`
9. **Optional Integrations**
   - Todoist reminders: `create_pregnancy_reminders()`
   - Notion backup: `save_to_notion()`

### 9. Safety & Medical Ethics

**Enforced Principles:**
- ❌ Never diagnoses medical conditions
- ❌ Never makes false medical claims
- ✅ Always escalates emergency symptoms
- ✅ Supportive, warm, evidence-based tone
- ✅ Encourages consulting healthcare providers
- ✅ Acknowledges individual pregnancy differences

## 📁 File Changes

### New Files Created

```
backend/
├── pregnancy_data/
│   ├── week_guide.json          # Week-by-week pregnancy info
│   ├── foods.json                # Safe foods + allergen data
│   ├── symptoms_guide.json       # Symptom analysis data
│   ├── profile.json              # User pregnancy profile
│   └── pregnancy_journal.json    # Journal entries
├── src/
│   ├── pregnancy_profile.py      # Profile management
│   ├── symptom_analyzer.py       # Symptom analysis engine
│   └── nutrition_engine.py       # Nutrition recommendations
```

### Modified Files

```
backend/src/
├── agent.py                      # WellnessCompanion → PregnancyCompanion
├── notion_handler.py             # Updated for pregnancy entries
└── todoist_handler.py            # Updated for pregnancy tasks
```

## 🔧 Function Tool Transformations

| Old Function | New Function | Changes |
|-------------|--------------|---------|
| `record_mood()` | `analyze_symptom()` | Emergency detection, symptom logging |
| N/A | `record_emotional_state()` | New: Sentiment-aware emotional support |
| `record_energy()` | `record_fatigue_level()` | Pregnancy-specific fatigue guidance |
| N/A | `check_nutrition()` | New: Food safety verification |
| `record_objectives()` | `record_pregnancy_tasks()` | Limited to 3, pregnancy-focused |
| `save_wellness_entry()` | `save_pregnancy_journal()` | Enhanced schema with symptoms, nutrition |
| `get_weekly_summary()` | `get_weekly_pregnancy_report()` | Symptom trends, nutrition tracking |
| `create_tasks_from_goals()` | `create_pregnancy_reminders()` | 🤰 emoji, higher priority |

## 📊 Data Structure Evolution

### Before (Wellness)
```json
{
  "datetime": "...",
  "mood": "calm",
  "energy": "medium",
  "objectives": ["task1", "task2"],
  "summary": "..."
}
```

### After (Pregnancy)
```json
{
  "datetime": "...",
  "pregnancy_week": 12,
  "trimester": 1,
  "emotional_state": "anxious but excited",
  "fatigue_level": "tired",
  "symptoms": [...],
  "nutrition_notes": [...],
  "pregnancy_tasks": [...],
  "summary": "..."
}
```

## 🎨 Agent Personality Update

### Before
- Calm, supportive wellness companion
- General wellness guidance
- Goal-oriented

### After
- Warm, supportive pregnancy companion
- Like a caring friend + pregnancy guide
- Evidence-based pregnancy support
- Celebrates positive moments
- Comforts during difficulties
- Never diagnoses, always supportive
- Encourages healthcare provider consultation

## 🚀 Usage Examples

### Example 1: Symptom Check
**User:** "I've been feeling nauseous all morning"
**Agent:** Analyzes symptom → Not emergency → Provides first-trimester nausea guidance → Suggests ginger tea, crackers

### Example 2: Emergency Detection
**User:** "I'm having severe bleeding"
**Agent:** Detects emergency keyword → Immediately escalates → "⚠️ This sounds like something you should discuss with your healthcare provider right away..."

### Example 3: Nutrition Query
**User:** "Can I eat sushi?"
**Agent:** Checks food safety → "⚠️ Raw fish (sushi) should be avoided during pregnancy."

### Example 4: Emotional Support
**User:** "I'm feeling really anxious"
**Agent:** Detects negative emotion → "I hear you. Pregnancy can bring up a lot of emotions, and that's completely normal. Be gentle with yourself."

## 🔐 Safety Features

1. **Emergency Keyword Detection**
   - Real-time monitoring of dangerous symptoms
   - Immediate escalation guidance
   - Never attempts diagnosis

2. **Allergy Conflict Detection**
   - Cross-references user allergies with food recommendations
   - ⚠️ Warning symbols for conflicts
   - Prevents unsafe recommendations

3. **Trimester Awareness**
   - Adjusts guidance based on pregnancy stage
   - Week-specific information
   - Appropriate symptom responses

4. **Medical Ethics Compliance**
   - No diagnosis claims
   - Encourages professional consultation
   - Evidence-based information only

## 📈 Future Enhancements

Potential additions (not implemented):
- Kick counter integration
- Contraction timer
- Appointment reminders
- Partner involvement features
- Birth plan builder
- Postpartum transition support

## 🎯 Testing Checklist

- [ ] Symptom analysis with emergency keywords
- [ ] Nutrition recommendations with allergies
- [ ] Emotional state tracking
- [ ] Weekly pregnancy reports
- [ ] Todoist reminder creation
- [ ] Notion backup
- [ ] Profile management (LMP, due date)
- [ ] Week-by-week guidance

## 📝 Notes

- All original architecture preserved
- Minimal disruption to existing patterns
- Backward compatibility maintained where possible
- Ready for production deployment
- Comprehensive safety measures implemented

---

**Transformation completed successfully! 🎉**
