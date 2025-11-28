"""
Intelligence Client for Pregnancy Companion Agent
Provides access to PHASE 3 intelligence features
"""

import requests
import logging
from typing import Optional, Dict, List, Any

logger = logging.getLogger("intelligence_client")


class IntelligenceClient:
    """Client for accessing intelligence features from the backend."""
    
    def __init__(self, base_url: str = "http://localhost:3001", user_id: Optional[str] = None):
        """
        Initialize intelligence client.
        
        Args:
            base_url: Backend API base URL
            user_id: User ID for this session
        """
        self.base_url = base_url.rstrip('/')
        self.user_id = user_id
        logger.info(f"Intelligence client initialized: {self.base_url}")
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make HTTP request to backend."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Intelligence request failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ============================================
    # TREND DETECTION & RISK SCORING
    # ============================================
    
    def analyze_user_data(self) -> Optional[Dict]:
        """
        Analyze user data for trends and risks.
        
        Returns:
            Analysis dict with trends, risk_assessment, and personalization
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("POST", f"/intelligence/analyze/{self.user_id}")
        
        if result.get("success"):
            return result.get("analysis")
        
        return None
    
    def get_risk_level(self) -> Optional[str]:
        """
        Get current risk level for user.
        
        Returns:
            Risk level string: 'normal', 'watch', or 'critical'
        """
        analysis = self.analyze_user_data()
        
        if analysis and "risk_assessment" in analysis:
            return analysis["risk_assessment"].get("risk_level")
        
        return None
    
    def get_trends(self) -> Optional[Dict]:
        """
        Get trend analysis for user.
        
        Returns:
            Trends dict with mood, symptom, nutrition, and task trends
        """
        analysis = self.analyze_user_data()
        
        if analysis and "trends" in analysis:
            return analysis["trends"]
        
        return None
    
    # ============================================
    # SMART REPORTS
    # ============================================
    
    def get_weekly_report(self) -> Optional[Dict]:
        """
        Get weekly intelligence report.
        
        Returns:
            Weekly report dict
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("GET", f"/intelligence/report/weekly/{self.user_id}")
        
        if result.get("success"):
            logger.info("Weekly report generated")
            return result.get("report")
        
        return None
    
    def get_monthly_report(self) -> Optional[Dict]:
        """
        Get monthly intelligence report.
        
        Returns:
            Monthly report dict
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("GET", f"/intelligence/report/monthly/{self.user_id}")
        
        if result.get("success"):
            logger.info("Monthly report generated")
            return result.get("report")
        
        return None
    
    def get_full_report(self) -> Optional[Dict]:
        """
        Get full pregnancy intelligence report.
        
        Returns:
            Full report dict
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("GET", f"/intelligence/report/full/{self.user_id}")
        
        if result.get("success"):
            logger.info("Full report generated")
            return result.get("report")
        
        return None
    
    # ============================================
    # DECISION ENGINE
    # ============================================
    
    def get_action_plan(self) -> Optional[Dict]:
        """
        Get prioritized action plan based on intelligence analysis.
        
        Returns:
            Action plan dict with prioritized actions
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("POST", f"/intelligence/action-plan/{self.user_id}")
        
        if result.get("success"):
            logger.info("Action plan generated")
            return result.get("action_plan")
        
        return None
    
    def get_top_priorities(self, count: int = 3) -> List[Dict]:
        """
        Get top priority actions for user.
        
        Args:
            count: Number of top actions to return
            
        Returns:
            List of top priority action dicts
        """
        action_plan = self.get_action_plan()
        
        if action_plan and "actions" in action_plan:
            return action_plan["actions"][:count]
        
        return []
    
    # ============================================
    # SAFETY ENGINE
    # ============================================
    
    def check_message_safety(self, message: str) -> Optional[Dict]:
        """
        Check user message for safety concerns.
        
        Args:
            message: User message to analyze
            
        Returns:
            Safety analysis dict
        """
        data = {"message": message}
        result = self._make_request("POST", "/intelligence/safety-check", data)
        
        if result.get("success"):
            return result.get("safety_analysis")
        
        return None
    
    def validate_agent_response(self, user_message: str, agent_response: str) -> Optional[Dict]:
        """
        Validate agent response for safety before sending to user.
        
        Args:
            user_message: Original user message
            agent_response: Agent's proposed response
            
        Returns:
            Validation dict with is_valid, final_response, and safety info
        """
        data = {
            "user_message": user_message,
            "agent_response": agent_response
        }
        
        result = self._make_request("POST", "/intelligence/validate-response", data)
        
        if result.get("success"):
            return result.get("validation")
        
        return None
    
    def get_safe_response(self, user_message: str, agent_response: str) -> str:
        """
        Get safe version of agent response.
        
        Args:
            user_message: Original user message
            agent_response: Agent's proposed response
            
        Returns:
            Safe response string
        """
        validation = self.validate_agent_response(user_message, agent_response)
        
        if validation:
            return validation.get("final_response", agent_response)
        
        return agent_response
    
    def is_emergency(self, message: str) -> bool:
        """
        Check if message indicates an emergency.
        
        Args:
            message: User message to check
            
        Returns:
            True if emergency detected, False otherwise
        """
        safety = self.check_message_safety(message)
        
        if safety:
            return safety.get("requires_escalation", False)
        
        return False
    
    # ============================================
    # PERSONALIZATION & LEARNING
    # ============================================
    
    def record_learning(
        self,
        suggestion_id: str,
        was_helpful: bool,
        user_feedback: str = ""
    ) -> bool:
        """
        Record learning data for personalization.
        
        Args:
            suggestion_id: ID of the suggestion
            was_helpful: Whether the suggestion was helpful
            user_feedback: Optional user feedback
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        data = {
            "suggestion_id": suggestion_id,
            "was_helpful": was_helpful,
            "user_feedback": user_feedback
        }
        
        result = self._make_request("POST", f"/intelligence/learn/{self.user_id}", data)
        
        if result.get("success"):
            logger.info(f"Learning recorded: {suggestion_id} -> {was_helpful}")
            return True
        
        return False
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    def get_intelligence_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive intelligence summary for user.
        
        Returns:
            Dict with risk level, top priorities, and key insights
        """
        summary = {
            "risk_level": "unknown",
            "top_priorities": [],
            "key_insights": [],
            "requires_attention": False
        }
        
        # Get risk level
        risk_level = self.get_risk_level()
        if risk_level:
            summary["risk_level"] = risk_level
            summary["requires_attention"] = risk_level in ["watch", "critical"]
        
        # Get top priorities
        priorities = self.get_top_priorities(3)
        if priorities:
            summary["top_priorities"] = priorities
        
        # Get trends for insights
        trends = self.get_trends()
        if trends:
            insights = []
            
            # Mood insights
            if trends.get("moods", {}).get("concerning_patterns"):
                insights.append("Emotional support may be beneficial")
            
            # Symptom insights
            if trends.get("symptoms", {}).get("repeating_symptoms"):
                top_symptom = trends["symptoms"]["repeating_symptoms"][0]
                insights.append(f"Recurring symptom: {top_symptom['symptom']}")
            
            # Task insights
            task_rate = trends.get("tasks", {}).get("completion_rate", 0)
            if task_rate < 50:
                insights.append("Task completion could improve")
            elif task_rate >= 80:
                insights.append("Excellent task adherence")
            
            summary["key_insights"] = insights
        
        return summary
