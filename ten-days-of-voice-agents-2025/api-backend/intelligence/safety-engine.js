/**
 * Safety Engine
 * Enhanced safety features for pregnancy companion
 */

class SafetyEngine {
  constructor() {
    // Critical emergency keywords
    this.criticalKeywords = [
      'bleeding', 'heavy bleeding', 'blood', 'hemorrhage',
      'fainting', 'fainted', 'passed out', 'unconscious',
      'severe pain', 'intense pain', 'unbearable pain', 'excruciating',
      'water broke', 'water breaking', 'fluid leaking',
      'contractions', 'regular contractions', 'labor pains',
      'can\'t breathe', 'difficulty breathing', 'shortness of breath',
      'chest pain', 'heart racing', 'palpitations',
      'severe headache', 'migraine', 'vision changes', 'blurred vision',
      'high fever', 'fever above 101', 'burning up',
      'sudden swelling', 'face swelling', 'hand swelling',
      'dizziness', 'lightheaded', 'going to faint'
    ];

    // Warning keywords
    this.warningKeywords = [
      'spotting', 'light bleeding', 'cramping', 'sharp pain',
      'nausea', 'vomiting', 'can\'t keep food down',
      'headache', 'tired', 'exhausted', 'weak',
      'swelling', 'puffy', 'tight rings',
      'back pain', 'pelvic pressure', 'round ligament pain'
    ];

    // Unsafe advice patterns
    this.unsafeAdvicePatterns = [
      'diagnose', 'diagnosis', 'you have', 'it is definitely',
      'take medication', 'stop taking', 'increase dosage',
      'don\'t see a doctor', 'avoid medical care', 'skip appointment',
      'this is normal', 'nothing to worry about', 'ignore it'
    ];

    // Safe response templates
    this.safeResponses = {
      critical: {
        template: "⚠️ This sounds like something you should discuss with your healthcare provider right away. If you're experiencing severe symptoms, please call your doctor or go to the emergency room. Your health and baby's health come first.",
        followUp: "Would you like me to help you find emergency contact information?"
      },
      warning: {
        template: "I understand you're experiencing {symptom}. While this can be common in pregnancy, it's always best to mention any concerns to your healthcare provider. They know your specific situation best.",
        followUp: "In the meantime, here are some general comfort measures that might help: {suggestions}"
      },
      supportive: {
        template: "Thank you for sharing that with me. Every pregnancy is unique, and it's important to listen to your body. If this symptom is concerning you or getting worse, don't hesitate to contact your healthcare provider.",
        followUp: "Remember, you know your body best, and it's always okay to seek professional guidance."
      }
    };
  }

  /**
   * Analyze message for safety concerns
   */
  analyzeSafety(message) {
    const messageLower = message.toLowerCase();
    
    const analysis = {
      safety_level: 'safe',
      requires_escalation: false,
      detected_keywords: [],
      recommended_response: null,
      suppressed_advice: [],
      escalation_message: null
    };

    // Check critical keywords
    const criticalMatches = this.criticalKeywords.filter(keyword => 
      messageLower.includes(keyword)
    );

    if (criticalMatches.length > 0) {
      analysis.safety_level = 'critical';
      analysis.requires_escalation = true;
      analysis.detected_keywords = criticalMatches;
      analysis.recommended_response = this.safeResponses.critical;
      analysis.escalation_message = this.generateEscalationMessage(criticalMatches);
      return analysis;
    }

    // Check warning keywords
    const warningMatches = this.warningKeywords.filter(keyword => 
      messageLower.includes(keyword)
    );

    if (warningMatches.length > 0) {
      analysis.safety_level = 'warning';
      analysis.detected_keywords = warningMatches;
      analysis.recommended_response = this.safeResponses.warning;
      return analysis;
    }

    analysis.recommended_response = this.safeResponses.supportive;
    return analysis;
  }

  /**
   * Check if response contains unsafe advice
   */
  checkResponseSafety(response) {
    const responseLower = response.toLowerCase();
    
    const unsafePatterns = this.unsafeAdvicePatterns.filter(pattern => 
      responseLower.includes(pattern)
    );

    return {
      is_safe: unsafePatterns.length === 0,
      unsafe_patterns: unsafePatterns,
      requires_modification: unsafePatterns.length > 0,
      safe_alternative: unsafePatterns.length > 0 
        ? this.generateSafeAlternative(response, unsafePatterns)
        : response
    };
  }

  generateEscalationMessage(keywords) {
    const keywordList = keywords.join(', ');
    return `EMERGENCY KEYWORDS DETECTED: ${keywordList}. Immediate healthcare consultation recommended.`;
  }

  generateSafeAlternative(originalResponse, unsafePatterns) {
    let safeResponse = originalResponse;

    const replacements = {
      'diagnose': 'suggest you discuss with your healthcare provider',
      'diagnosis': 'possible concern to discuss with your doctor',
      'you have': 'you might be experiencing',
      'it is definitely': 'it could be',
      'take medication': 'ask your doctor about medication options',
      'stop taking': 'discuss with your doctor before stopping',
      'increase dosage': 'consult your healthcare provider about dosage',
      'don\'t see a doctor': 'consider seeing your healthcare provider',
      'avoid medical care': 'seek appropriate medical guidance',
      'skip appointment': 'keep your scheduled appointments',
      'this is normal': 'this can be common, but discuss with your doctor',
      'nothing to worry about': 'worth mentioning to your healthcare provider',
      'ignore it': 'monitor and discuss with your doctor if it continues'
    };

    unsafePatterns.forEach(pattern => {
      if (replacements[pattern]) {
        const regex = new RegExp(pattern, 'gi');
        safeResponse = safeResponse.replace(regex, replacements[pattern]);
      }
    });

    safeResponse += "\n\n💙 Remember: I'm here to support you, but always consult your healthcare provider for medical concerns.";

    return safeResponse;
  }

  generateSafeSymptomResponse(symptom, safetyAnalysis) {
    if (safetyAnalysis.safety_level === 'critical') {
      return safetyAnalysis.recommended_response.template;
    }

    if (safetyAnalysis.safety_level === 'warning') {
      const suggestions = this.getComfortMeasures(symptom);
      return safetyAnalysis.recommended_response.template
        .replace('{symptom}', symptom)
        .replace('{suggestions}', suggestions);
    }

    return safetyAnalysis.recommended_response.template;
  }

  getComfortMeasures(symptom) {
    const measures = {
      'nausea': 'try ginger tea, eat small frequent meals, and keep crackers by your bed',
      'headache': 'rest in a quiet, dark room, stay hydrated, and try a cold compress',
      'back pain': 'use proper posture, wear supportive shoes, and try gentle stretching',
      'fatigue': 'rest when you can, take short naps, and don\'t overexert yourself',
      'cramping': 'rest, stay hydrated, and use a warm compress if comfortable',
      'swelling': 'elevate your feet, stay hydrated, and avoid standing for long periods'
    };

    const symptomLower = symptom.toLowerCase();
    for (const [key, measure] of Object.entries(measures)) {
      if (symptomLower.includes(key)) {
        return measure;
      }
    }

    return 'rest, stay hydrated, and listen to your body';
  }

  createSafetyReport(interactions) {
    const report = {
      timestamp: new Date().toISOString(),
      total_interactions: interactions.length,
      safety_incidents: [],
      escalations: 0,
      warnings: 0,
      safe_interactions: 0
    };

    interactions.forEach(interaction => {
      if (interaction.data && interaction.data.safety_analysis) {
        const safety = interaction.data.safety_analysis;
        
        if (safety.safety_level === 'critical') {
          report.escalations++;
          report.safety_incidents.push({
            timestamp: interaction.timestamp,
            level: 'critical',
            keywords: safety.detected_keywords,
            escalated: safety.requires_escalation
          });
        } else if (safety.safety_level === 'warning') {
          report.warnings++;
          report.safety_incidents.push({
            timestamp: interaction.timestamp,
            level: 'warning',
            keywords: safety.detected_keywords
          });
        } else {
          report.safe_interactions++;
        }
      }
    });

    return report;
  }

  validateResponse(response, userMessage) {
    const safetyAnalysis = this.analyzeSafety(userMessage);
    const responseSafety = this.checkResponseSafety(response);

    return {
      is_valid: responseSafety.is_safe && !safetyAnalysis.requires_escalation,
      safety_analysis: safetyAnalysis,
      response_safety: responseSafety,
      final_response: safetyAnalysis.requires_escalation 
        ? safetyAnalysis.recommended_response.template
        : responseSafety.safe_alternative,
      requires_escalation: safetyAnalysis.requires_escalation
    };
  }
}

module.exports = SafetyEngine;
