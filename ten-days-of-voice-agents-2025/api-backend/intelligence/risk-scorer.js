/**
 * Risk Scoring System
 * Evaluates pregnancy health risks based on patterns
 */

class RiskScorer {
  constructor() {
    // Emergency keywords that trigger critical risk
    this.emergencyKeywords = [
      'bleeding', 'heavy bleeding', 'blood',
      'fainting', 'fainted', 'passed out',
      'severe pain', 'intense pain', 'unbearable pain',
      'swelling', 'sudden swelling', 'face swelling',
      'shortness of breath', "can't breathe",
      'severe headache', 'vision changes', 'blurred vision',
      'high fever', 'fever above 101',
      'contractions', 'regular contractions', 'water broke'
    ];
  }

  /**
   * Calculate overall risk score
   * @param {Object} userData - Complete user data
   * @param {Object} trends - Trend analysis from TrendDetector
   * @returns {Object} Risk assessment
   */
  calculateRiskScore(userData, trends) {
    const riskFactors = [];
    let totalScore = 0;

    // 1. Check for emergency symptoms
    const emergencyRisk = this.assessEmergencyRisk(userData.symptom_log || []);
    if (emergencyRisk.score > 0) {
      riskFactors.push(emergencyRisk);
      totalScore += emergencyRisk.score;
    }

    // 2. Check symptom patterns
    const symptomRisk = this.assessSymptomRisk(trends.symptoms);
    if (symptomRisk.score > 0) {
      riskFactors.push(symptomRisk);
      totalScore += symptomRisk.score;
    }

    // 3. Check mood patterns
    const moodRisk = this.assessMoodRisk(trends.moods);
    if (moodRisk.score > 0) {
      riskFactors.push(moodRisk);
      totalScore += moodRisk.score;
    }

    // 4. Check task adherence
    const taskRisk = this.assessTaskRisk(trends.tasks);
    if (taskRisk.score > 0) {
      riskFactors.push(taskRisk);
      totalScore += taskRisk.score;
    }

    // 5. Check nutrition patterns
    const nutritionRisk = this.assessNutritionRisk(trends.nutrition);
    if (nutritionRisk.score > 0) {
      riskFactors.push(nutritionRisk);
      totalScore += nutritionRisk.score;
    }

    // Determine risk level
    let riskLevel = 'normal';
    let recommendation = 'Continue current care routine';

    if (totalScore >= 50) {
      riskLevel = 'critical';
      recommendation = '⚠️ Please contact your healthcare provider immediately';
    } else if (totalScore >= 25) {
      riskLevel = 'watch';
      recommendation = 'Monitor closely and consider consulting healthcare provider';
    }

    return {
      timestamp: new Date().toISOString(),
      risk_level: riskLevel,
      total_score: totalScore,
      risk_factors: riskFactors,
      recommendation,
      requires_escalation: riskLevel === 'critical'
    };
  }

  /**
   * Assess emergency risk from symptoms
   */
  assessEmergencyRisk(symptomLog) {
    const risk = {
      category: 'emergency_symptoms',
      score: 0,
      severity: 'normal',
      details: []
    };

    if (!symptomLog || symptomLog.length === 0) {
      return risk;
    }

    // Check recent symptoms (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSymptoms = symptomLog.filter(s => new Date(s.timestamp) >= oneDayAgo);

    recentSymptoms.forEach(entry => {
      const symptomLower = entry.symptom.toLowerCase();
      
      // Check for emergency keywords
      const hasEmergency = this.emergencyKeywords.some(keyword => 
        symptomLower.includes(keyword)
      );

      if (hasEmergency || entry.is_emergency) {
        risk.score += 50; // Critical score
        risk.severity = 'critical';
        risk.details.push({
          symptom: entry.symptom,
          timestamp: entry.timestamp,
          reason: 'Emergency keyword detected'
        });
      }
    });

    return risk;
  }

  /**
   * Assess symptom pattern risk
   */
  assessSymptomRisk(symptomTrends) {
    const risk = {
      category: 'symptom_patterns',
      score: 0,
      severity: 'normal',
      details: []
    };

    // Check for repeating symptoms
    if (symptomTrends.repeating_symptoms && symptomTrends.repeating_symptoms.length > 0) {
      symptomTrends.repeating_symptoms.forEach(symptom => {
        if (symptom.count >= 5) {
          risk.score += 15;
          risk.severity = 'watch';
          risk.details.push({
            symptom: symptom.symptom,
            count: symptom.count,
            reason: 'Symptom repeated 5+ times'
          });
        } else if (symptom.count >= 3) {
          risk.score += 10;
          risk.severity = risk.severity === 'normal' ? 'watch' : risk.severity;
          risk.details.push({
            symptom: symptom.symptom,
            count: symptom.count,
            reason: 'Symptom repeated 3+ times'
          });
        }
      });
    }

    return risk;
  }

  /**
   * Assess mood pattern risk
   */
  assessMoodRisk(moodTrends) {
    const risk = {
      category: 'mood_patterns',
      score: 0,
      severity: 'normal',
      details: []
    };

    // Check for consistent negative moods
    if (moodTrends.mood_pattern === 'consistently_negative') {
      risk.score += 20;
      risk.severity = 'watch';
      risk.details.push({
        pattern: 'consistently_negative',
        reason: 'Frequent negative emotions detected'
      });
    }

    // Check for negative streak
    if (moodTrends.negative_streak >= 5) {
      risk.score += 15;
      risk.severity = 'watch';
      risk.details.push({
        streak: moodTrends.negative_streak,
        reason: 'Extended period of negative emotions'
      });
    } else if (moodTrends.negative_streak >= 3) {
      risk.score += 10;
      risk.details.push({
        streak: moodTrends.negative_streak,
        reason: 'Multiple consecutive negative moods'
      });
    }

    return risk;
  }

  /**
   * Assess task adherence risk
   */
  assessTaskRisk(taskTrends) {
    const risk = {
      category: 'task_adherence',
      score: 0,
      severity: 'normal',
      details: []
    };

    // Check completion rate
    if (taskTrends.completion_rate < 40) {
      risk.score += 15;
      risk.severity = 'watch';
      risk.details.push({
        completion_rate: taskTrends.completion_rate,
        reason: 'Low task completion rate'
      });
    }

    // Check missed high-priority tasks
    if (taskTrends.missed_tasks && taskTrends.missed_tasks.length >= 3) {
      risk.score += 10;
      risk.severity = 'watch';
      risk.details.push({
        missed_count: taskTrends.missed_tasks.length,
        reason: 'Multiple high-priority tasks incomplete'
      });
    }

    return risk;
  }

  /**
   * Assess nutrition risk
   */
  assessNutritionRisk(nutritionTrends) {
    const risk = {
      category: 'nutrition_patterns',
      score: 0,
      severity: 'normal',
      details: []
    };

    // Check for repeated unsafe food queries
    if (nutritionTrends.unsafe_food_queries >= 5) {
      risk.score += 10;
      risk.severity = 'watch';
      risk.details.push({
        count: nutritionTrends.unsafe_food_queries,
        reason: 'Multiple queries about unsafe foods'
      });
    }

    // Check for allergen warnings
    if (nutritionTrends.allergen_warnings >= 3) {
      risk.score += 5;
      risk.details.push({
        count: nutritionTrends.allergen_warnings,
        reason: 'Multiple allergen conflicts detected'
      });
    }

    return risk;
  }
}

module.exports = RiskScorer;
