/**
 * Personalization Engine
 * Learns from user behavior and improves suggestions
 */

class PersonalizationEngine {
  /**
   * Track suggestion success
   * @param {Object} userData - User data
   * @returns {Object} Suggestion effectiveness scores
   */
  trackSuggestionSuccess(userData) {
    const suggestions = {
      emotional_support: {},
      symptom_relief: {},
      nutrition_preferences: {},
      task_preferences: {}
    };

    // Analyze which emotional support worked
    if (userData.mood_log && userData.mood_log.length >= 2) {
      const moodLog = userData.mood_log;
      
      for (let i = 1; i < moodLog.length; i++) {
        const prev = moodLog[i - 1];
        const curr = moodLog[i];
        
        // Check if mood improved
        const improved = this.isMoodImproved(prev.emotional_state, curr.emotional_state);
        
        if (improved && prev.notes) {
          const key = prev.notes.substring(0, 50);
          suggestions.emotional_support[key] = {
            success_count: (suggestions.emotional_support[key]?.success_count || 0) + 1,
            last_used: prev.timestamp
          };
        }
      }
    }

    // Analyze which symptom relief worked
    if (userData.symptom_log && userData.symptom_log.length >= 2) {
      const symptomLog = userData.symptom_log;
      const symptomCounts = {};
      
      symptomLog.forEach(entry => {
        const symptom = entry.symptom.toLowerCase();
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });

      // If symptom stopped appearing, the suggestion likely worked
      Object.entries(symptomCounts).forEach(([symptom, count]) => {
        if (count <= 2) {
          suggestions.symptom_relief[symptom] = {
            success_score: 1.0,
            occurrences: count
          };
        }
      });
    }

    // Analyze nutrition preferences
    if (userData.nutrition_log) {
      const foodCounts = {};
      
      userData.nutrition_log.forEach(entry => {
        const food = entry.food_query.toLowerCase();
        foodCounts[food] = (foodCounts[food] || 0) + 1;
      });

      // Frequently queried foods indicate interest
      Object.entries(foodCounts).forEach(([food, count]) => {
        if (count >= 2) {
          suggestions.nutrition_preferences[food] = {
            query_count: count,
            interest_level: count >= 3 ? 'high' : 'moderate'
          };
        }
      });
    }

    // Analyze task preferences
    if (userData.todo_list) {
      const taskTypes = {};
      
      userData.todo_list.forEach(todo => {
        const taskLower = todo.task.toLowerCase();
        let category = 'other';
        
        if (taskLower.includes('vitamin') || taskLower.includes('medication')) {
          category = 'medication';
        } else if (taskLower.includes('water') || taskLower.includes('drink')) {
          category = 'hydration';
        } else if (taskLower.includes('rest') || taskLower.includes('sleep')) {
          category = 'rest';
        } else if (taskLower.includes('walk') || taskLower.includes('exercise')) {
          category = 'exercise';
        } else if (taskLower.includes('appointment') || taskLower.includes('doctor')) {
          category = 'medical';
        }
        
        if (!taskTypes[category]) {
          taskTypes[category] = { total: 0, completed: 0 };
        }
        
        taskTypes[category].total++;
        if (todo.completed) {
          taskTypes[category].completed++;
        }
      });

      // Calculate completion rates by category
      Object.entries(taskTypes).forEach(([category, stats]) => {
        const completionRate = stats.total > 0 
          ? Math.round((stats.completed / stats.total) * 100)
          : 0;
        
        suggestions.task_preferences[category] = {
          total: stats.total,
          completed: stats.completed,
          completion_rate: completionRate,
          adherence: completionRate >= 70 ? 'high' : completionRate >= 40 ? 'moderate' : 'low'
        };
      });
    }

    return suggestions;
  }

  /**
   * Check if mood improved
   */
  isMoodImproved(prevMood, currMood) {
    const negativeKeywords = ['anxious', 'sad', 'worried', 'stressed', 'overwhelmed', 'scared'];
    const positiveKeywords = ['happy', 'excited', 'joyful', 'grateful', 'peaceful', 'content', 'better', 'calm'];

    const prevNegative = negativeKeywords.some(k => prevMood.toLowerCase().includes(k));
    const currPositive = positiveKeywords.some(k => currMood.toLowerCase().includes(k));

    return prevNegative && currPositive;
  }

  /**
   * Generate personalized recommendations
   * @param {Object} userData - User data
   * @param {Object} suggestions - Suggestion success tracking
   * @returns {Array} Prioritized recommendations
   */
  generateRecommendations(userData, suggestions) {
    const recommendations = [];

    // Emotional support recommendations
    if (suggestions.emotional_support) {
      const topEmotionalSupport = Object.entries(suggestions.emotional_support)
        .sort((a, b) => b[1].success_count - a[1].success_count)
        .slice(0, 3);

      topEmotionalSupport.forEach(([support, data]) => {
        recommendations.push({
          category: 'emotional',
          suggestion: support,
          priority: 'high',
          success_rate: data.success_count,
          reason: 'Previously helped improve mood'
        });
      });
    }

    // Task recommendations based on adherence
    if (suggestions.task_preferences) {
      Object.entries(suggestions.task_preferences).forEach(([category, stats]) => {
        if (stats.adherence === 'high') {
          recommendations.push({
            category: 'task',
            suggestion: `Continue ${category} tasks - you're doing great!`,
            priority: 'medium',
            completion_rate: stats.completion_rate,
            reason: 'High adherence to this task type'
          });
        } else if (stats.adherence === 'low') {
          recommendations.push({
            category: 'task',
            suggestion: `Focus on ${category} tasks - they're important`,
            priority: 'high',
            completion_rate: stats.completion_rate,
            reason: 'Low adherence needs attention'
          });
        }
      });
    }

    // Nutrition recommendations
    if (suggestions.nutrition_preferences) {
      const topFoods = Object.entries(suggestions.nutrition_preferences)
        .filter(([food, data]) => data.interest_level === 'high')
        .slice(0, 3);

      topFoods.forEach(([food, data]) => {
        recommendations.push({
          category: 'nutrition',
          suggestion: `You've asked about ${food} ${data.query_count} times`,
          priority: 'medium',
          query_count: data.query_count,
          reason: 'High interest in this food'
        });
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations;
  }

  /**
   * Calculate personalization score
   * @param {Object} userData - User data
   * @returns {Object} Personalization metrics
   */
  calculatePersonalizationScore(userData) {
    const suggestions = this.trackSuggestionSuccess(userData);
    const recommendations = this.generateRecommendations(userData, suggestions);

    return {
      timestamp: new Date().toISOString(),
      user_id: userData.user_id,
      learning_data: suggestions,
      personalized_recommendations: recommendations,
      personalization_level: recommendations.length >= 5 ? 'high' : 
                            recommendations.length >= 2 ? 'moderate' : 'low'
    };
  }
}

module.exports = PersonalizationEngine;
