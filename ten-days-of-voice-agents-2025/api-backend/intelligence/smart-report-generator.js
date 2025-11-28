/**
 * Smart Report Generator
 * Generates intelligent pregnancy reports with insights
 */

const TrendDetector = require('./trend-detector');
const RiskScorer = require('./risk-scorer');
const PersonalizationEngine = require('./personalization-engine');

class SmartReportGenerator {
  constructor() {
    this.trendDetector = new TrendDetector();
    this.riskScorer = new RiskScorer();
    this.personalizationEngine = new PersonalizationEngine();
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(userData) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = {
      ...userData,
      mood_log: (userData.mood_log || []).filter(m => new Date(m.timestamp) >= weekAgo),
      symptom_log: (userData.symptom_log || []).filter(s => new Date(s.timestamp) >= weekAgo),
      nutrition_log: (userData.nutrition_log || []).filter(n => new Date(n.timestamp) >= weekAgo),
      todo_list: (userData.todo_list || []).filter(t => new Date(t.timestamp) >= weekAgo)
    };

    const trends = this.trendDetector.analyzeTrends(weeklyData);
    const riskAssessment = this.riskScorer.calculateRiskScore(weeklyData, trends);
    const personalization = this.personalizationEngine.calculatePersonalizationScore(weeklyData);

    return {
      report_type: 'weekly',
      generated_at: new Date().toISOString(),
      user_id: userData.user_id,
      period: {
        start: weekAgo.toISOString(),
        end: new Date().toISOString()
      },
      pregnancy_info: {
        current_week: userData.profile?.current_week,
        trimester: userData.profile?.trimester,
        due_date: userData.profile?.due_date
      },
      emotional_summary: {
        total_entries: weeklyData.mood_log.length,
        mood_pattern: trends.moods.mood_pattern,
        negative_streak: trends.moods.negative_streak,
        mood_volatility: trends.moods.mood_volatility,
        concerning_patterns: trends.moods.concerning_patterns,
        insights: this.generateEmotionalInsights(trends.moods, weeklyData.mood_log)
      },
      physical_trends: {
        total_symptoms: weeklyData.symptom_log.length,
        repeating_symptoms: trends.symptoms.repeating_symptoms,
        emergency_count: trends.symptoms.emergency_count,
        concerning_patterns: trends.symptoms.concerning_patterns,
        insights: this.generatePhysicalInsights(trends.symptoms, weeklyData.symptom_log)
      },
      nutrition_analysis: {
        total_queries: weeklyData.nutrition_log.length,
        unsafe_food_queries: trends.nutrition.unsafe_food_queries,
        allergen_warnings: trends.nutrition.allergen_warnings,
        query_frequency: trends.nutrition.query_frequency,
        insights: this.generateNutritionInsights(trends.nutrition, weeklyData.nutrition_log)
      },
      task_adherence: {
        total_tasks: weeklyData.todo_list.length,
        completion_rate: trends.tasks.completion_rate,
        task_adherence: trends.tasks.task_adherence,
        missed_tasks: trends.tasks.missed_tasks,
        insights: this.generateTaskInsights(trends.tasks, weeklyData.todo_list)
      },
      risk_evaluation: {
        risk_level: riskAssessment.risk_level,
        total_score: riskAssessment.total_score,
        risk_factors: riskAssessment.risk_factors,
        recommendation: riskAssessment.recommendation,
        requires_escalation: riskAssessment.requires_escalation
      },
      recommendations: personalization.personalized_recommendations,
      agent_notes: this.generateAgentNotes(weeklyData, trends, riskAssessment)
    };
  }

  /**
   * Generate monthly report
   */
  generateMonthlyReport(userData) {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyData = {
      ...userData,
      mood_log: (userData.mood_log || []).filter(m => new Date(m.timestamp) >= monthAgo),
      symptom_log: (userData.symptom_log || []).filter(s => new Date(s.timestamp) >= monthAgo),
      nutrition_log: (userData.nutrition_log || []).filter(n => new Date(n.timestamp) >= monthAgo),
      todo_list: (userData.todo_list || []).filter(t => new Date(t.timestamp) >= monthAgo)
    };

    const trends = this.trendDetector.analyzeTrends(monthlyData);
    const riskAssessment = this.riskScorer.calculateRiskScore(monthlyData, trends);
    const personalization = this.personalizationEngine.calculatePersonalizationScore(monthlyData);

    return {
      report_type: 'monthly',
      generated_at: new Date().toISOString(),
      user_id: userData.user_id,
      period: {
        start: monthAgo.toISOString(),
        end: new Date().toISOString()
      },
      pregnancy_info: {
        current_week: userData.profile?.current_week,
        trimester: userData.profile?.trimester,
        due_date: userData.profile?.due_date
      },
      emotional_summary: {
        total_entries: monthlyData.mood_log.length,
        mood_pattern: trends.moods.mood_pattern,
        negative_streak: trends.moods.negative_streak,
        mood_volatility: trends.moods.mood_volatility,
        concerning_patterns: trends.moods.concerning_patterns,
        insights: this.generateEmotionalInsights(trends.moods, monthlyData.mood_log),
        monthly_trend: 'stable'
      },
      physical_trends: {
        total_symptoms: monthlyData.symptom_log.length,
        repeating_symptoms: trends.symptoms.repeating_symptoms,
        emergency_count: trends.symptoms.emergency_count,
        concerning_patterns: trends.symptoms.concerning_patterns,
        insights: this.generatePhysicalInsights(trends.symptoms, monthlyData.symptom_log),
        symptom_progression: 'improving'
      },
      nutrition_analysis: {
        total_queries: monthlyData.nutrition_log.length,
        unsafe_food_queries: trends.nutrition.unsafe_food_queries,
        allergen_warnings: trends.nutrition.allergen_warnings,
        query_frequency: trends.nutrition.query_frequency,
        insights: this.generateNutritionInsights(trends.nutrition, monthlyData.nutrition_log),
        dietary_patterns: {}
      },
      task_adherence: {
        total_tasks: monthlyData.todo_list.length,
        completion_rate: trends.tasks.completion_rate,
        task_adherence: trends.tasks.task_adherence,
        missed_tasks: trends.tasks.missed_tasks,
        insights: this.generateTaskInsights(trends.tasks, monthlyData.todo_list),
        adherence_trend: 'improving'
      },
      risk_evaluation: riskAssessment,
      recommendations: personalization.personalized_recommendations,
      agent_notes: this.generateAgentNotes(monthlyData, trends, riskAssessment)
    };
  }

  /**
   * Generate full pregnancy report
   */
  generateFullReport(userData) {
    const trends = this.trendDetector.analyzeTrends(userData);
    const riskAssessment = this.riskScorer.calculateRiskScore(userData, trends);
    const personalization = this.personalizationEngine.calculatePersonalizationScore(userData);

    return {
      report_type: 'full',
      generated_at: new Date().toISOString(),
      user_id: userData.user_id,
      pregnancy_info: {
        current_week: userData.profile?.current_week,
        trimester: userData.profile?.trimester,
        due_date: userData.profile?.due_date,
        lmp: userData.profile?.lmp,
        allergies: userData.profile?.allergies,
        food_preferences: userData.profile?.food_preferences
      },
      emotional_summary: {
        total_entries: (userData.mood_log || []).length,
        mood_pattern: trends.moods.mood_pattern,
        negative_streak: trends.moods.negative_streak,
        mood_volatility: trends.moods.mood_volatility,
        concerning_patterns: trends.moods.concerning_patterns,
        overall_trend: 'stable',
        insights: this.generateEmotionalInsights(trends.moods, userData.mood_log || [])
      },
      physical_trends: {
        total_symptoms: (userData.symptom_log || []).length,
        repeating_symptoms: trends.symptoms.repeating_symptoms,
        emergency_count: trends.symptoms.emergency_count,
        concerning_patterns: trends.symptoms.concerning_patterns,
        symptom_timeline: [],
        insights: this.generatePhysicalInsights(trends.symptoms, userData.symptom_log || [])
      },
      nutrition_analysis: {
        total_queries: (userData.nutrition_log || []).length,
        unsafe_food_queries: trends.nutrition.unsafe_food_queries,
        allergen_warnings: trends.nutrition.allergen_warnings,
        query_frequency: trends.nutrition.query_frequency,
        food_interests: {},
        insights: this.generateNutritionInsights(trends.nutrition, userData.nutrition_log || [])
      },
      task_adherence: {
        total_tasks: (userData.todo_list || []).length,
        completion_rate: trends.tasks.completion_rate,
        task_adherence: trends.tasks.task_adherence,
        missed_tasks: trends.tasks.missed_tasks,
        task_categories: {},
        insights: this.generateTaskInsights(trends.tasks, userData.todo_list || [])
      },
      risk_evaluation: riskAssessment,
      recommendations: personalization.personalized_recommendations,
      learning_data: personalization.learning_data,
      agent_notes: this.generateAgentNotes(userData, trends, riskAssessment)
    };
  }

  // Helper methods
  generateEmotionalInsights(moodTrends, moodLog) {
    const insights = [];
    
    if (moodTrends.mood_pattern === 'consistently_positive') {
      insights.push('🌟 You\'ve been maintaining positive emotions - great job!');
    } else if (moodTrends.mood_pattern === 'consistently_negative') {
      insights.push('💙 You\'ve been experiencing challenging emotions. Consider talking to someone you trust.');
    }
    
    if (moodTrends.negative_streak >= 3) {
      insights.push('🤗 Extended difficult periods are normal in pregnancy. Self-care is important.');
    }
    
    return insights;
  }

  generatePhysicalInsights(symptomTrends, symptomLog) {
    const insights = [];
    
    if (symptomTrends.repeating_symptoms.length > 0) {
      const topSymptom = symptomTrends.repeating_symptoms[0];
      insights.push(`📊 ${topSymptom.symptom} has been your most common symptom (${topSymptom.count} times)`);
    }
    
    if (symptomTrends.emergency_count === 0) {
      insights.push('✅ No emergency symptoms detected - that\'s reassuring!');
    }
    
    return insights;
  }

  generateNutritionInsights(nutritionTrends, nutritionLog) {
    const insights = [];
    
    if (nutritionTrends.unsafe_food_queries > 0) {
      insights.push(`⚠️ You've asked about ${nutritionTrends.unsafe_food_queries} foods to avoid - staying informed is great!`);
    }
    
    if (nutritionTrends.query_frequency === 'high') {
      insights.push('🍎 You\'re very engaged with nutrition - excellent for baby\'s development!');
    }
    
    return insights;
  }

  generateTaskInsights(taskTrends, todoList) {
    const insights = [];
    
    if (taskTrends.completion_rate >= 80) {
      insights.push(`🎯 Excellent task completion rate: ${taskTrends.completion_rate}%`);
    } else if (taskTrends.completion_rate < 50) {
      insights.push(`📝 Task completion could improve: ${taskTrends.completion_rate}%. Small steps count!`);
    }
    
    return insights;
  }

  generateAgentNotes(userData, trends, riskAssessment) {
    const notes = [];
    
    if (riskAssessment.risk_level === 'critical') {
      notes.push('🚨 CRITICAL: Immediate healthcare provider consultation recommended');
    } else if (riskAssessment.risk_level === 'watch') {
      notes.push('👀 WATCH: Monitor patterns closely, consider healthcare consultation');
    } else {
      notes.push('✅ NORMAL: Continue current care routine');
    }
    
    if (trends.moods.concerning_patterns.length > 0) {
      notes.push('💭 Emotional support may be beneficial');
    }
    
    if (trends.symptoms.repeating_symptoms.length > 0) {
      notes.push('📋 Discuss recurring symptoms with healthcare provider');
    }
    
    return notes;
  }
}

module.exports = SmartReportGenerator;
