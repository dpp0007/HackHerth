/**
 * Trend Detection Engine
 * Analyzes time-series data to detect patterns and trends
 */

class TrendDetector {
  /**
   * Detect repeating symptoms
   * @param {Array} symptomLog - Array of symptom entries
   * @returns {Object} Detected symptom trends
   */
  detectSymptomTrends(symptomLog) {
    const trends = {
      repeating_symptoms: [],
      symptom_frequency: {},
      concerning_patterns: [],
      emergency_count: 0
    };

    if (!symptomLog || symptomLog.length === 0) {
      return trends;
    }

    // Count symptom frequency
    symptomLog.forEach(entry => {
      const symptom = entry.symptom.toLowerCase();
      trends.symptom_frequency[symptom] = (trends.symptom_frequency[symptom] || 0) + 1;
      
      if (entry.is_emergency) {
        trends.emergency_count++;
      }
    });

    // Detect repeating symptoms (> 3 occurrences)
    Object.entries(trends.symptom_frequency).forEach(([symptom, count]) => {
      if (count >= 3) {
        trends.repeating_symptoms.push({
          symptom,
          count,
          severity: count >= 5 ? 'high' : count >= 3 ? 'moderate' : 'low'
        });
      }
    });

    // Check for concerning patterns (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSymptoms = symptomLog.filter(s => new Date(s.timestamp) >= sevenDaysAgo);
    
    if (recentSymptoms.length >= 5) {
      trends.concerning_patterns.push({
        pattern: 'high_symptom_frequency',
        count: recentSymptoms.length,
        message: 'Multiple symptoms reported in past week'
      });
    }

    return trends;
  }

  /**
   * Detect mood patterns
   * @param {Array} moodLog - Array of mood entries
   * @returns {Object} Detected mood trends
   */
  detectMoodTrends(moodLog) {
    const trends = {
      mood_pattern: 'stable',
      negative_streak: 0,
      positive_streak: 0,
      most_common_mood: null,
      mood_volatility: 'low',
      concerning_patterns: []
    };

    if (!moodLog || moodLog.length === 0) {
      return trends;
    }

    // Negative mood keywords
    const negativeKeywords = ['anxious', 'sad', 'worried', 'stressed', 'overwhelmed', 'scared', 'depressed', 'crying'];
    const positiveKeywords = ['happy', 'excited', 'joyful', 'grateful', 'peaceful', 'content', 'calm'];

    // Analyze recent moods (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMoods = moodLog.filter(m => new Date(m.timestamp) >= sevenDaysAgo);

    let negativeCount = 0;
    let positiveCount = 0;
    let consecutiveNegative = 0;
    let maxNegativeStreak = 0;

    recentMoods.forEach((entry, index) => {
      const mood = entry.emotional_state.toLowerCase();
      const isNegative = negativeKeywords.some(keyword => mood.includes(keyword));
      const isPositive = positiveKeywords.some(keyword => mood.includes(keyword));

      if (isNegative) {
        negativeCount++;
        consecutiveNegative++;
        maxNegativeStreak = Math.max(maxNegativeStreak, consecutiveNegative);
      } else {
        consecutiveNegative = 0;
      }

      if (isPositive) {
        positiveCount++;
      }
    });

    trends.negative_streak = maxNegativeStreak;

    // Determine mood pattern
    if (negativeCount > recentMoods.length * 0.6) {
      trends.mood_pattern = 'consistently_negative';
      trends.concerning_patterns.push({
        pattern: 'frequent_negative_moods',
        count: negativeCount,
        message: 'Frequent negative emotions detected'
      });
    } else if (positiveCount > recentMoods.length * 0.6) {
      trends.mood_pattern = 'consistently_positive';
    } else {
      trends.mood_pattern = 'mixed';
    }

    // Check for mood drops (3+ consecutive negative)
    if (maxNegativeStreak >= 3) {
      trends.concerning_patterns.push({
        pattern: 'mood_drop_streak',
        count: maxNegativeStreak,
        message: 'Consecutive negative moods detected'
      });
    }

    // Mood volatility
    if (recentMoods.length >= 5) {
      const changes = recentMoods.length - 1;
      trends.mood_volatility = changes >= 4 ? 'high' : changes >= 2 ? 'moderate' : 'low';
    }

    return trends;
  }

  /**
   * Detect task completion patterns
   * @param {Array} todoList - Array of todo entries
   * @returns {Object} Detected task trends
   */
  detectTaskTrends(todoList) {
    const trends = {
      completion_rate: 0,
      missed_tasks: [],
      consistent_completion: false,
      task_adherence: 'unknown',
      concerning_patterns: []
    };

    if (!todoList || todoList.length === 0) {
      return trends;
    }

    const completed = todoList.filter(t => t.completed).length;
    const total = todoList.length;
    trends.completion_rate = Math.round((completed / total) * 100);

    // Determine adherence level
    if (trends.completion_rate >= 80) {
      trends.task_adherence = 'excellent';
      trends.consistent_completion = true;
    } else if (trends.completion_rate >= 60) {
      trends.task_adherence = 'good';
    } else if (trends.completion_rate >= 40) {
      trends.task_adherence = 'moderate';
    } else {
      trends.task_adherence = 'poor';
      trends.concerning_patterns.push({
        pattern: 'low_task_completion',
        rate: trends.completion_rate,
        message: 'Many tasks remain incomplete'
      });
    }

    // Find missed high-priority tasks
    trends.missed_tasks = todoList
      .filter(t => !t.completed && t.priority === 'high')
      .map(t => ({
        task: t.task,
        priority: t.priority,
        due_date: t.due_date
      }));

    if (trends.missed_tasks.length >= 3) {
      trends.concerning_patterns.push({
        pattern: 'missed_high_priority_tasks',
        count: trends.missed_tasks.length,
        message: 'Multiple high-priority tasks incomplete'
      });
    }

    return trends;
  }

  /**
   * Detect nutrition gaps
   * @param {Array} nutritionLog - Array of nutrition entries
   * @returns {Object} Detected nutrition trends
   */
  detectNutritionTrends(nutritionLog) {
    const trends = {
      unsafe_food_queries: 0,
      allergen_warnings: 0,
      query_frequency: 'low',
      concerning_patterns: [],
      common_queries: []
    };

    if (!nutritionLog || nutritionLog.length === 0) {
      return trends;
    }

    // Count unsafe foods and allergen warnings
    nutritionLog.forEach(entry => {
      if (!entry.is_safe) {
        trends.unsafe_food_queries++;
      }
      if (entry.allergen_warning) {
        trends.allergen_warnings++;
      }
    });

    // Determine query frequency
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentQueries = nutritionLog.filter(n => new Date(n.timestamp) >= sevenDaysAgo);
    
    if (recentQueries.length >= 10) {
      trends.query_frequency = 'high';
    } else if (recentQueries.length >= 5) {
      trends.query_frequency = 'moderate';
    }

    // Check for repeated unsafe food queries
    if (trends.unsafe_food_queries >= 3) {
      trends.concerning_patterns.push({
        pattern: 'repeated_unsafe_food_queries',
        count: trends.unsafe_food_queries,
        message: 'Multiple queries about unsafe foods'
      });
    }

    return trends;
  }

  /**
   * Generate comprehensive trend summary
   * @param {Object} userData - Complete user data
   * @returns {Object} Complete trend analysis
   */
  analyzeTrends(userData) {
    return {
      timestamp: new Date().toISOString(),
      user_id: userData.user_id,
      symptoms: this.detectSymptomTrends(userData.symptom_log || []),
      moods: this.detectMoodTrends(userData.mood_log || []),
      tasks: this.detectTaskTrends(userData.todo_list || []),
      nutrition: this.detectNutritionTrends(userData.nutrition_log || [])
    };
  }
}

module.exports = TrendDetector;
