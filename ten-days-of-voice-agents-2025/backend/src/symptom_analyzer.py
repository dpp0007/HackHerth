"""Pregnancy symptom analyzer with safety checks."""

import json
import os
import logging
from typing import Tuple

logger = logging.getLogger("symptom_analyzer")


class SymptomAnalyzer:
    """Analyzes pregnancy symptoms and provides safe guidance."""
    
    def __init__(self):
        self.symptoms_guide = self._load_symptoms_guide()
    
    def _load_symptoms_guide(self) -> dict:
        """Load symptoms guide from JSON."""
        guide_file = "pregnancy_data/symptoms_guide.json"
        if os.path.exists(guide_file):
            try:
                with open(guide_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading symptoms guide: {e}")
        return {"emergency_keywords": [], "common_symptoms": {}}
    
    def analyze_symptom(self, symptom_text: str, trimester: int) -> Tuple[bool, str]:
        """
        Analyze a symptom and return (is_emergency, response).
        
        Args:
            symptom_text: User's symptom description
            trimester: Current trimester (1, 2, or 3)
            
        Returns:
            Tuple of (is_emergency: bool, response: str)
        """
        symptom_lower = symptom_text.lower()
        
        # Check for emergency keywords
        emergency_keywords = self.symptoms_guide.get("emergency_keywords", [])
        for keyword in emergency_keywords:
            if keyword in symptom_lower:
                escalation_msg = self.symptoms_guide.get(
                    "escalation_message",
                    "⚠️ Please contact your healthcare provider immediately."
                )
                logger.warning(f"Emergency keyword detected: {keyword}")
                return True, escalation_msg
        
        # Check common symptoms for trimester
        trimester_key = f"trimester_{trimester}"
        common_symptoms = self.symptoms_guide.get("common_symptoms", {}).get(trimester_key, [])
        
        for symptom_info in common_symptoms:
            if symptom_info["symptom"] in symptom_lower:
                return False, symptom_info["response"]
        
        # Generic supportive response
        return False, (
            "I hear you. Every pregnancy is unique. If this symptom is concerning you "
            "or getting worse, it's always best to check with your healthcare provider. "
            "They know your specific situation best."
        )
    
    def get_emergency_guidance(self) -> str:
        """Get emergency escalation message."""
        return self.symptoms_guide.get(
            "escalation_message",
            "⚠️ Please contact your healthcare provider immediately."
        )
