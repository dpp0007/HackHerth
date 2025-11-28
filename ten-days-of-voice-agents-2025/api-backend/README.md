# 🤰 Pregnancy Companion - Central Backend

## Overview

This is the central Node.js backend for the Pregnancy Companion AI system. It serves as the single source of truth for all user data, replacing local JSON storage.

## Features

- ✅ Session management with UUID
- ✅ User profile storage
- ✅ Mood logging
- ✅ Symptom tracking
- ✅ Nutrition query logging
- ✅ Todo list management
- ✅ Agent interaction logging
- ✅ Weekly & overall report generation
- ✅ JSON file-based storage

## Installation

```bash
cd api-backend
npm install
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Session Management

#### Start Session
```http
POST /session/start
```

**Response:**
```json
{
  "success": true,
  "user_id": "uuid-here",
  "message": "Session started successfully"
}
```

---

### User Profile

#### Get Profile
```http
GET /user/profile/:userId
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "lmp": "2024-09-01",
    "due_date": "2025-06-08",
    "current_week": 12,
    "trimester": 1,
    "allergies": ["peanuts"],
    "food_preferences": ["vegetarian"],
    "created_at": "2024-11-28T00:00:00.000Z"
  }
}
```

#### Update Profile
```http
POST /user/profile/:userId
Content-Type: application/json

{
  "lmp": "2024-09-01",
  "allergies": ["peanuts", "shellfish"],
  "food_preferences": ["vegetarian"]
}
```

---

### Mood Logging

#### Log Mood
```http
POST /mood/:userId
Content-Type: application/json

{
  "emotional_state": "anxious but excited",
  "notes": "Feeling nervous about upcoming appointment"
}
```

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "timestamp": "2024-11-28T12:00:00.000Z",
    "emotional_state": "anxious but excited",
    "notes": "Feeling nervous about upcoming appointment",
    "week": 12
  }
}
```

---

### Symptom Logging

#### Log Symptom
```http
POST /symptoms/:userId
Content-Type: application/json

{
  "symptom": "nausea",
  "severity": "moderate",
  "is_emergency": false,
  "agent_response": "Very common in first trimester. Try ginger tea..."
}
```

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "timestamp": "2024-11-28T12:00:00.000Z",
    "symptom": "nausea",
    "severity": "moderate",
    "is_emergency": false,
    "agent_response": "Very common in first trimester...",
    "week": 12
  }
}
```

---

### Nutrition Logging

#### Log Nutrition Query
```http
POST /nutrition/:userId
Content-Type: application/json

{
  "food_query": "sushi",
  "is_safe": false,
  "agent_response": "⚠️ Raw fish should be avoided during pregnancy",
  "allergen_warning": false
}
```

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "timestamp": "2024-11-28T12:00:00.000Z",
    "food_query": "sushi",
    "is_safe": false,
    "agent_response": "⚠️ Raw fish should be avoided...",
    "allergen_warning": false,
    "week": 12
  }
}
```

---

### Todo Management

#### Get Todos
```http
GET /todo/:userId
```

**Response:**
```json
{
  "success": true,
  "todos": [
    {
      "id": "uuid",
      "timestamp": "2024-11-28T12:00:00.000Z",
      "task": "Take prenatal vitamin",
      "priority": "high",
      "due_date": "2024-11-28",
      "completed": false,
      "week": 12
    }
  ]
}
```

#### Add Todo
```http
POST /todo/:userId
Content-Type: application/json

{
  "task": "Take prenatal vitamin",
  "priority": "high",
  "due_date": "2024-11-28"
}
```

---

### Agent Logging

#### Log Agent Interaction
```http
POST /agent/log/:userId
Content-Type: application/json

{
  "event": "symptom_analysis",
  "message": "Analyzed nausea symptom",
  "data": {
    "symptom": "nausea",
    "response": "Very common in first trimester"
  }
}
```

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "timestamp": "2024-11-28T12:00:00.000Z",
    "event": "symptom_analysis",
    "message": "Analyzed nausea symptom",
    "data": {...},
    "week": 12
  }
}
```

---

### Reports

#### Generate Report
```http
GET /report/:userId?type=weekly
```

**Query Parameters:**
- `type`: `weekly` or `overall` (default: overall)

**Response:**
```json
{
  "success": true,
  "report": {
    "user_id": "uuid",
    "report_type": "weekly",
    "generated_at": "2024-11-28T12:00:00.000Z",
    "pregnancy_info": {
      "current_week": 12,
      "trimester": 1,
      "due_date": "2025-06-08"
    },
    "summary": {
      "total_mood_entries": 5,
      "total_symptoms": 3,
      "total_nutrition_queries": 2,
      "total_todos": 4,
      "completed_todos": 2
    },
    "mood_analysis": {
      "entries": 5,
      "most_common": "anxious but excited",
      "recent_moods": [...]
    },
    "symptom_analysis": {
      "entries": 3,
      "most_common": "nausea",
      "emergency_count": 0,
      "recent_symptoms": [...]
    },
    "nutrition_analysis": {
      "queries": 2,
      "unsafe_foods_checked": 1,
      "allergen_warnings": 0
    },
    "todo_analysis": {
      "total": 4,
      "completed": 2,
      "pending": 2,
      "completion_rate": 50
    }
  }
}
```

---

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Pregnancy Companion Backend is running",
  "timestamp": "2024-11-28T12:00:00.000Z"
}
```

---

## Data Storage

Data is stored in JSON files in the `data/` directory:
- Format: `user_{userId}.json`
- One file per user
- Automatic creation on first access

### Data Structure

```json
{
  "user_id": "uuid",
  "profile": {
    "lmp": "2024-09-01",
    "due_date": "2025-06-08",
    "current_week": 12,
    "trimester": 1,
    "allergies": ["peanuts"],
    "food_preferences": ["vegetarian"],
    "created_at": "2024-11-28T00:00:00.000Z"
  },
  "mood_log": [...],
  "symptom_log": [...],
  "nutrition_log": [...],
  "todo_list": [...],
  "agent_log": [...],
  "pregnancy_journal": [...]
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `500` - Server Error

---

## Development

### Project Structure
```
api-backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment template
├── README.md          # This file
└── data/              # User data storage (auto-created)
    └── user_*.json    # User data files
```

### Adding New Endpoints

1. Add route in `server.js`
2. Use `loadUserData()` and `saveUserData()` helpers
3. Follow existing patterns for consistency
4. Update this README

---

## Testing

### Using curl

```bash
# Start session
curl -X POST http://localhost:3001/session/start

# Get profile
curl http://localhost:3001/user/profile/YOUR_USER_ID

# Log mood
curl -X POST http://localhost:3001/mood/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{"emotional_state":"happy","notes":"Feeling great today"}'

# Get report
curl http://localhost:3001/report/YOUR_USER_ID?type=weekly
```

### Using Postman

Import the endpoints above into Postman for easy testing.

---

## Production Deployment

1. Set environment variables:
   ```bash
   export PORT=3001
   export NODE_ENV=production
   ```

2. Install dependencies:
   ```bash
   npm install --production
   ```

3. Start server:
   ```bash
   npm start
   ```

4. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name pregnancy-backend
   ```

---

## Security Considerations

- ✅ CORS enabled for frontend access
- ✅ Body parser limits in place
- ⚠️ Add authentication for production
- ⚠️ Add rate limiting for production
- ⚠️ Add input validation
- ⚠️ Consider database instead of JSON files for scale

---

## Future Enhancements

- [ ] Add authentication (JWT)
- [ ] Add rate limiting
- [ ] Add input validation (Joi/Yup)
- [ ] Migrate to database (MongoDB/PostgreSQL)
- [ ] Add WebSocket support for real-time updates
- [ ] Add file upload for images
- [ ] Add email notifications
- [ ] Add backup/restore functionality

---

**🤰 Pregnancy Companion Backend - Central Source of Truth** 💚
