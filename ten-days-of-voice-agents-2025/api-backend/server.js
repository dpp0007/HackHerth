const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Intelligence modules
const TrendDetector = require('./intelligence/trend-detector');
const RiskScorer = require('./intelligence/risk-scorer');
const PersonalizationEngine = require('./intelligence/personalization-engine');
const SmartReportGenerator = require('./intelligence/smart-report-generator');
const DecisionEngine = require('./intelligence/decision-engine');
const SafetyEngine = require('./intelligence/safety-engine');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize intelligence engines
const trendDetector = new TrendDetector();
const riskScorer = new RiskScorer();
const personalizationEngine = new PersonalizationEngine();
const smartReportGenerator = new SmartReportGenerator();
const decisionEngine = new DecisionEngine();
const safetyEngine = new SafetyEngine();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Helper: Get user data file path
function getUserDataPath(userId) {
  return path.join(DATA_DIR, `user_${userId}.json`);
}

// Helper: Load user data
async function loadUserData(userId) {
  try {
    const filePath = getUserDataPath(userId);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default structure if file doesn't exist
    return {
      user_id: userId,
      profile: {
        lmp: null,
        due_date: null,
        current_week: null,
        trimester: null,
        allergies: [],
        food_preferences: [],
        created_at: new Date().toISOString()
      },
      mood_log: [],
      symptom_log: [],
      nutrition_log: [],
      todo_list: [],
      agent_log: [],
      pregnancy_journal: []
    };
  }
}

// Helper: Save user data
async function saveUserData(userId, data) {
  try {
    const filePath = getUserDataPath(userId);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// ============================================
// SESSION ENDPOINTS
// ============================================

// POST /session/start - Start a new session
app.post('/session/start', async (req, res) => {
  try {
    const userId = uuidv4();
    const userData = await loadUserData(userId);
    
    // Log session start
    userData.agent_log.push({
      timestamp: new Date().toISOString(),
      event: 'session_start',
      message: 'New session started'
    });
    
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      user_id: userId,
      message: 'Session started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// GET /user/profile - Get user profile
app.get('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    res.json({
      success: true,
      profile: userData.profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /user/profile - Update user profile
app.post('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileUpdate = req.body;
    
    const userData = await loadUserData(userId);
    userData.profile = { ...userData.profile, ...profileUpdate };
    
    // Calculate pregnancy week if LMP or due date provided
    if (profileUpdate.lmp || profileUpdate.due_date) {
      const dueDate = profileUpdate.due_date 
        ? new Date(profileUpdate.due_date)
        : new Date(new Date(profileUpdate.lmp).getTime() + 280 * 24 * 60 * 60 * 1000);
      
      const today = new Date();
      const daysUntilDue = Math.floor((dueDate - today) / (24 * 60 * 60 * 1000));
      const weeksPregnant = Math.max(1, Math.min(42, 40 - Math.floor(daysUntilDue / 7)));
      
      userData.profile.current_week = weeksPregnant;
      userData.profile.trimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 27 ? 2 : 3;
      userData.profile.due_date = dueDate.toISOString();
    }
    
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      profile: userData.profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// MOOD ENDPOINTS
// ============================================

// POST /mood - Log mood entry
app.post('/mood/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { emotional_state, notes } = req.body;
    
    const userData = await loadUserData(userId);
    
    const moodEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      emotional_state,
      notes: notes || '',
      week: userData.profile.current_week
    };
    
    userData.mood_log.push(moodEntry);
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      entry: moodEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SYMPTOM ENDPOINTS
// ============================================

// POST /symptoms - Log symptom entry
app.post('/symptoms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { symptom, severity, is_emergency, agent_response } = req.body;
    
    const userData = await loadUserData(userId);
    
    const symptomEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      symptom,
      severity: severity || 'moderate',
      is_emergency: is_emergency || false,
      agent_response: agent_response || '',
      week: userData.profile.current_week
    };
    
    userData.symptom_log.push(symptomEntry);
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      entry: symptomEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// NUTRITION ENDPOINTS
// ============================================

// POST /nutrition - Log nutrition query
app.post('/nutrition/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { food_query, is_safe, agent_response, allergen_warning } = req.body;
    
    const userData = await loadUserData(userId);
    
    const nutritionEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      food_query,
      is_safe: is_safe !== undefined ? is_safe : true,
      agent_response: agent_response || '',
      allergen_warning: allergen_warning || false,
      week: userData.profile.current_week
    };
    
    userData.nutrition_log.push(nutritionEntry);
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      entry: nutritionEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TODO ENDPOINTS
// ============================================

// GET /todo - Get all todos
app.get('/todo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    res.json({
      success: true,
      todos: userData.todo_list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /todo - Add todo
app.post('/todo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { task, priority, due_date } = req.body;
    
    const userData = await loadUserData(userId);
    
    const todoEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      task,
      priority: priority || 'medium',
      due_date: due_date || new Date().toISOString().split('T')[0],
      completed: false,
      week: userData.profile.current_week
    };
    
    userData.todo_list.push(todoEntry);
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      todo: todoEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// AGENT LOG ENDPOINTS
// ============================================

// POST /agent/log - Log agent interaction
app.post('/agent/log/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { event, message, data } = req.body;
    
    const userData = await loadUserData(userId);
    
    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      event,
      message,
      data: data || {},
      week: userData.profile.current_week
    };
    
    userData.agent_log.push(logEntry);
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      entry: logEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// REPORT ENDPOINTS
// ============================================

// GET /report - Generate pregnancy report
app.get('/report/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'weekly' or 'overall'
    
    const userData = await loadUserData(userId);
    
    // Calculate date range for weekly report
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter data based on report type
    const filterByDate = (items) => {
      if (type === 'weekly') {
        return items.filter(item => new Date(item.timestamp) >= weekAgo);
      }
      return items;
    };
    
    const moodEntries = filterByDate(userData.mood_log);
    const symptomEntries = filterByDate(userData.symptom_log);
    const nutritionEntries = filterByDate(userData.nutrition_log);
    const todoEntries = filterByDate(userData.todo_list);
    
    // Generate report
    const report = {
      user_id: userId,
      report_type: type || 'overall',
      generated_at: new Date().toISOString(),
      pregnancy_info: {
        current_week: userData.profile.current_week,
        trimester: userData.profile.trimester,
        due_date: userData.profile.due_date
      },
      summary: {
        total_mood_entries: moodEntries.length,
        total_symptoms: symptomEntries.length,
        total_nutrition_queries: nutritionEntries.length,
        total_todos: todoEntries.length,
        completed_todos: todoEntries.filter(t => t.completed).length
      },
      mood_analysis: {
        entries: moodEntries.length,
        most_common: getMostCommon(moodEntries.map(m => m.emotional_state)),
        recent_moods: moodEntries.slice(-5).map(m => ({
          date: m.timestamp.split('T')[0],
          mood: m.emotional_state
        }))
      },
      symptom_analysis: {
        entries: symptomEntries.length,
        most_common: getMostCommon(symptomEntries.map(s => s.symptom)),
        emergency_count: symptomEntries.filter(s => s.is_emergency).length,
        recent_symptoms: symptomEntries.slice(-5).map(s => ({
          date: s.timestamp.split('T')[0],
          symptom: s.symptom,
          severity: s.severity
        }))
      },
      nutrition_analysis: {
        queries: nutritionEntries.length,
        unsafe_foods_checked: nutritionEntries.filter(n => !n.is_safe).length,
        allergen_warnings: nutritionEntries.filter(n => n.allergen_warning).length
      },
      todo_analysis: {
        total: todoEntries.length,
        completed: todoEntries.filter(t => t.completed).length,
        pending: todoEntries.filter(t => !t.completed).length,
        completion_rate: todoEntries.length > 0 
          ? Math.round((todoEntries.filter(t => t.completed).length / todoEntries.length) * 100)
          : 0
      }
    };
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to get most common item
function getMostCommon(arr) {
  if (arr.length === 0) return null;
  
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  let maxCount = 0;
  let mostCommon = null;
  
  for (const [item, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = item;
    }
  }
  
  return mostCommon;
}

// ============================================
// INTELLIGENCE ENDPOINTS (PHASE 3)
// ============================================

// POST /intelligence/analyze - Analyze user data for trends and risks
app.post('/intelligence/analyze/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    // Run intelligence analysis
    const trends = trendDetector.analyzeTrends(userData);
    const riskAssessment = riskScorer.calculateRiskScore(userData, trends);
    const personalization = personalizationEngine.calculatePersonalizationScore(userData);
    
    res.json({
      success: true,
      analysis: {
        trends,
        risk_assessment: riskAssessment,
        personalization
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /intelligence/report/weekly - Generate weekly intelligence report
app.get('/intelligence/report/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    const report = smartReportGenerator.generateWeeklyReport(userData);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /intelligence/report/monthly - Generate monthly intelligence report
app.get('/intelligence/report/monthly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    const report = smartReportGenerator.generateMonthlyReport(userData);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /intelligence/report/full - Generate full pregnancy intelligence report
app.get('/intelligence/report/full/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    const report = smartReportGenerator.generateFullReport(userData);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /intelligence/action-plan - Generate prioritized action plan
app.post('/intelligence/action-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await loadUserData(userId);
    
    // Run analysis
    const trends = trendDetector.analyzeTrends(userData);
    const riskAssessment = riskScorer.calculateRiskScore(userData, trends);
    const personalization = personalizationEngine.calculatePersonalizationScore(userData);
    
    // Generate action plan
    const actionPlan = decisionEngine.generateActionPlan(
      userData,
      trends,
      riskAssessment,
      personalization
    );
    
    res.json({
      success: true,
      action_plan: actionPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /intelligence/safety-check - Check message for safety concerns
app.post('/intelligence/safety-check', async (req, res) => {
  try {
    const { message, response } = req.body;
    
    // Analyze message safety
    const safetyAnalysis = safetyEngine.analyzeSafety(message);
    
    // Check response safety if provided
    let responseSafety = null;
    if (response) {
      responseSafety = safetyEngine.checkResponseSafety(response);
    }
    
    res.json({
      success: true,
      safety_analysis: safetyAnalysis,
      response_safety: responseSafety
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /intelligence/validate-response - Validate agent response before sending
app.post('/intelligence/validate-response', async (req, res) => {
  try {
    const { user_message, agent_response } = req.body;
    
    const validation = safetyEngine.validateResponse(agent_response, user_message);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /intelligence/learn - Record learning data for personalization
app.post('/intelligence/learn/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { suggestion_id, was_helpful, user_feedback } = req.body;
    
    const userData = await loadUserData(userId);
    
    // Add learning entry
    if (!userData.learning_data) {
      userData.learning_data = [];
    }
    
    userData.learning_data.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      suggestion_id,
      was_helpful,
      user_feedback: user_feedback || '',
      week: userData.profile.current_week
    });
    
    await saveUserData(userId, userData);
    
    res.json({
      success: true,
      message: 'Learning data recorded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pregnancy Companion Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

ensureDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`🤰 Pregnancy Companion Backend running on port ${PORT}`);
    console.log(`📊 Data directory: ${DATA_DIR}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
});

module.exports = app;
