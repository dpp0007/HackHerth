/**
 * Decision Priority Engine
 * Prioritizes actions and recommendations based on intelligence
 */

class DecisionEngine {
  constructor() {
    this.weights = {
      emergency: 100,
      risk_level: 50,
      trend_severity: 30,
      personalization: 20,
      completion_rate: 15
    };
  }

  /**
   * Generate prioritized action plan
   */
  generateActionPlan(userData, trends, riskAssessment, personalization) {
    const actions = [];

    // 1. Emergency actions
    if (riskAssessment.requires_escalation) {
      actions.push({
        priority: 1,
        category: 'emergency',
        action: 'immediate_healthcare_consultation',
        title: '🚨 Contact Healthcare Provider',
        description: riskAssessment.recommendation,
        urgency: 'critical',
        score: this.weights.emergency
      });
    }

    // 2. Risk-based actions
    if (riskAssessment.risk_level === 'watch') {
      riskAssessment.risk_factors.forEach(factor => {
        actions.push({
          priority: 2,
          category: 'risk_mitigation',
          action: `address_${factor.category}`,
          title: `⚠️ Address ${factor.category.replace('_', ' ')}`,
          description: this.generateRiskMitigationAdvice(factor),
          urgency: 'high',
          score: this.weights.risk_level
        });
      });
    }

    // 3. Trend-based actions
    this.addTrendBasedActions(actions, trends);

    // 4. Personalized actions
    this.addPersonalizedActions(actions, personalization);

    // 5. Preventive actions
    this.addPreventiveActions(actions, userData);

    // Sort by score
    actions.sort((a, b) => b.score - a.score);

    // Assign final priorities
    actions.forEach((action, index) => {
      action.final_priority = index + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      user_id: userData.user_id,
      total_actions: actions.length,
      high_priority_count: actions.filter(a => a.urgency === 'critical' || a.urgency === 'high').length,
      actions: actions.slice(0, 10)
    };
  }

  addTrendBasedActions(actions, trends) {
    // Mood trends
    if (trends.moods.mood_pattern === 'consistently_negative') {
      actions.push({
        priority: 3,
        category: 'emotional_support',
        action: 'mood_support',
        title: '💙 Emotional Support',
        description: 'Consider talking to someone you trust or practicing relaxation techniques',
        urgency: 'medium',
        score: this.weights.trend_severity + 10
      });
    }

    if (trends.moods.negative_streak >= 3) {
      actions.push({
        priority: 3,
        category: 'emotional_support',
        action: 'break_negative_streak',
        title: '🌈 Break Negative Pattern',
        description: 'Try a mood-lifting activity: gentle walk, music, or calling a friend',
        urgency: 'medium',
        score: this.weights.trend_severity + 5
      });
    }

    // Symptom trends
    if (trends.symptoms.repeating_symptoms.length > 0) {
      const topSymptom = trends.symptoms.repeating_symptoms[0];
      actions.push({
        priority: 3,
        category: 'symptom_management',
        action: 'address_recurring_symptom',
        title: `🩺 Address ${topSymptom.symptom}`,
        description: this.getSymptomAdvice(topSymptom.symptom),
        urgency: topSymptom.severity === 'high' ? 'high' : 'medium',
        score: this.weights.trend_severity + (topSymptom.count * 2)
      });
    }

    // Task trends
    if (trends.tasks.completion_rate < 50) {
      actions.push({
        priority: 4,
        category: 'task_improvement',
        action: 'improve_task_completion',
        title: '📝 Improve Task Completion',
        description: 'Start with 1-2 small, achievable tasks daily',
        urgency: 'medium',
        score: this.weights.completion_rate + (50 - trends.tasks.completion_rate)
      });
    }
  }

  addPersonalizedActions(actions, personalization) {
    if (personalization.personalized_recommendations) {
      personalization.personalized_recommendations.forEach(rec => {
        const priorityScore = rec.priority === 'high' ? 15 : rec.priority === 'medium' ? 10 : 5;
        
        actions.push({
          priority: 4,
          category: 'personalized',
          action: `personalized_${rec.category}`,
          title: `⭐ ${rec.suggestion}`,
          description: rec.reason,
          urgency: rec.priority === 'high' ? 'medium' : 'low',
          score: this.weights.personalization + priorityScore
        });
      });
    }
  }

  addPreventiveActions(actions, userData) {
    const profile = userData.profile || {};
    
    actions.push({
      priority: 5,
      category: 'preventive',
      action: 'hydration_reminder',
      title: '💧 Stay Hydrated',
      description: 'Drink 8-10 glasses of water daily for you and baby',
      urgency: 'low',
      score: 10
    });

    actions.push({
      priority: 5,
      category: 'preventive',
      action: 'vitamin_reminder',
      title: '💊 Take Prenatal Vitamins',
      description: 'Essential nutrients for baby\'s development',
      urgency: 'low',
      score: 12
    });

    actions.push({
      priority: 5,
      category: 'preventive',
      action: 'rest_reminder',
      title: '😴 Get Adequate Rest',
      description: 'Aim for 7-9 hours of sleep and rest when tired',
      urgency: 'low',
      score: 8
    });

    // Trimester-specific
    if (profile.trimester === 1) {
      actions.push({
        priority: 5,
        category: 'trimester_specific',
        action: 'first_trimester_care',
        title: '🌱 First Trimester Care',
        description: 'Focus on folic acid, managing nausea, and regular checkups',
        urgency: 'low',
        score: 15
      });
    } else if (profile.trimester === 2) {
      actions.push({
        priority: 5,
        category: 'trimester_specific',
        action: 'second_trimester_care',
        title: '🌿 Second Trimester Care',
        description: 'Maintain nutrition, gentle exercise, and monitor baby movements',
        urgency: 'low',
        score: 15
      });
    } else if (profile.trimester === 3) {
      actions.push({
        priority: 5,
        category: 'trimester_specific',
        action: 'third_trimester_care',
        title: '🌸 Third Trimester Care',
        description: 'Prepare for birth, monitor contractions, and rest frequently',
        urgency: 'low',
        score: 15
      });
    }
  }

  generateRiskMitigationAdvice(riskFactor) {
    const advice = {
      emergency_symptoms: 'Monitor symptoms closely and contact healthcare provider if they worsen',
      symptom_patterns: 'Track recurring symptoms and discuss patterns with your doctor',
      mood_patterns: 'Consider emotional support resources and stress management techniques',
      task_adherence: 'Break tasks into smaller steps and set realistic daily goals',
      nutrition_patterns: 'Focus on pregnancy-safe foods and consult a nutritionist if needed'
    };

    return advice[riskFactor.category] || 'Monitor this area and consult healthcare provider if concerned';
  }

  getSymptomAdvice(symptom) {
    const advice = {
      nausea: 'Try ginger tea, small frequent meals, and crackers before getting up',
      fatigue: 'Rest when possible, take short naps, and don\'t overexert yourself',
      'back pain': 'Practice good posture, use supportive pillows, and try prenatal yoga',
      heartburn: 'Eat smaller meals, avoid spicy foods, and don\'t lie down after eating',
      'leg cramps': 'Stay hydrated, stretch before bed, and ensure adequate magnesium',
      constipation: 'Increase fiber intake, drink plenty of water, and stay active',
      'breast tenderness': 'Wear a supportive bra and use warm or cold compresses',
      'frequent urination': 'Stay hydrated but limit fluids before bedtime',
      'mood swings': 'Practice relaxation techniques and talk about your feelings',
      headache: 'Stay hydrated, rest in a quiet room, and use a cold compress'
    };

    return advice[symptom.toLowerCase()] || 'Discuss this symptom with your healthcare provider for personalized advice';
  }

  getTopPriorityActions(actionPlan, count = 3) {
    return actionPlan.actions.slice(0, count);
  }

  getActionsByCategory(actionPlan, category) {
    return actionPlan.actions.filter(action => action.category === category);
  }
}

module.exports = DecisionEngine;
