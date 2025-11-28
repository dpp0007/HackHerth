"""
Backend API Client for Pregnancy Companion Agent
Replaces local JSON storage with central backend API calls
"""

import requests
import logging
from typing import Optional, Dict, List, Any

logger = logging.getLogger("backend_client")


class BackendClient:
    """Client for interacting with the central Pregnancy Companion backend."""
    
    def __init__(self, base_url: str = "http://localhost:3001", user_id: Optional[str] = None):
        """
        Initialize backend client.
        
        Args:
            base_url: Backend API base URL
            user_id: User ID for this session
        """
        self.base_url = base_url.rstrip('/')
        self.user_id = user_id
        logger.info(f"Backend client initialized: {self.base_url}")
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make HTTP request to backend."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=5)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Backend request failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ============================================
    # SESSION MANAGEMENT
    # ============================================
    
    def start_session(self) -> Optional[str]:
        """
        Start a new session and get user ID.
        
        Returns:
            User ID if successful, None otherwise
        """
        result = self._make_request("POST", "/session/start")
        
        if result.get("success"):
            self.user_id = result.get("user_id")
            logger.info(f"Session started: {self.user_id}")
            return self.user_id
        
        return None
    
    # ============================================
    # USER PROFILE
    # ============================================
    
    def get_profile(self) -> Optional[Dict]:
        """
        Get user profile.
        
        Returns:
            Profile dict if successful, None otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("GET", f"/user/profile/{self.user_id}")
        
        if result.get("success"):
            return result.get("profile")
        
        return None
    
    def update_profile(self, profile_data: Dict) -> bool:
        """
        Update user profile.
        
        Args:
            profile_data: Profile fields to update
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        result = self._make_request("POST", f"/user/profile/{self.user_id}", profile_data)
        return result.get("success", False)
    
    # ============================================
    # MOOD LOGGING
    # ============================================
    
    def log_mood(self, emotional_state: str, notes: str = "") -> bool:
        """
        Log mood entry.
        
        Args:
            emotional_state: User's emotional state
            notes: Optional notes
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        data = {
            "emotional_state": emotional_state,
            "notes": notes
        }
        
        result = self._make_request("POST", f"/mood/{self.user_id}", data)
        
        if result.get("success"):
            logger.info(f"Mood logged: {emotional_state}")
            return True
        
        return False
    
    # ============================================
    # SYMPTOM LOGGING
    # ============================================
    
    def log_symptom(
        self, 
        symptom: str, 
        severity: str = "moderate",
        is_emergency: bool = False,
        agent_response: str = ""
    ) -> bool:
        """
        Log symptom entry.
        
        Args:
            symptom: Symptom description
            severity: Severity level (mild, moderate, severe)
            is_emergency: Whether this is an emergency
            agent_response: Agent's response to symptom
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        data = {
            "symptom": symptom,
            "severity": severity,
            "is_emergency": is_emergency,
            "agent_response": agent_response
        }
        
        result = self._make_request("POST", f"/symptoms/{self.user_id}", data)
        
        if result.get("success"):
            logger.info(f"Symptom logged: {symptom}")
            return True
        
        return False
    
    # ============================================
    # NUTRITION LOGGING
    # ============================================
    
    def log_nutrition(
        self,
        food_query: str,
        is_safe: bool = True,
        agent_response: str = "",
        allergen_warning: bool = False
    ) -> bool:
        """
        Log nutrition query.
        
        Args:
            food_query: Food item queried
            is_safe: Whether food is safe during pregnancy
            agent_response: Agent's response
            allergen_warning: Whether allergen warning was given
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        data = {
            "food_query": food_query,
            "is_safe": is_safe,
            "agent_response": agent_response,
            "allergen_warning": allergen_warning
        }
        
        result = self._make_request("POST", f"/nutrition/{self.user_id}", data)
        
        if result.get("success"):
            logger.info(f"Nutrition logged: {food_query}")
            return True
        
        return False
    
    # ============================================
    # TODO MANAGEMENT
    # ============================================
    
    def get_todos(self) -> List[Dict]:
        """
        Get all todos.
        
        Returns:
            List of todo dicts
        """
        if not self.user_id:
            logger.error("No user_id set")
            return []
        
        result = self._make_request("GET", f"/todo/{self.user_id}")
        
        if result.get("success"):
            return result.get("todos", [])
        
        return []
    
    def add_todo(
        self,
        task: str,
        priority: str = "medium",
        due_date: Optional[str] = None
    ) -> bool:
        """
        Add todo item.
        
        Args:
            task: Task description
            priority: Priority level (low, medium, high)
            due_date: Due date (YYYY-MM-DD format)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        data = {
            "task": task,
            "priority": priority
        }
        
        if due_date:
            data["due_date"] = due_date
        
        result = self._make_request("POST", f"/todo/{self.user_id}", data)
        
        if result.get("success"):
            logger.info(f"Todo added: {task}")
            return True
        
        return False
    
    # ============================================
    # AGENT LOGGING
    # ============================================
    
    def log_agent_interaction(
        self,
        event: str,
        message: str,
        data: Optional[Dict] = None
    ) -> bool:
        """
        Log agent interaction.
        
        Args:
            event: Event type (e.g., "symptom_analysis", "nutrition_check")
            message: Log message
            data: Additional data
            
        Returns:
            True if successful, False otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return False
        
        log_data = {
            "event": event,
            "message": message,
            "data": data or {}
        }
        
        result = self._make_request("POST", f"/agent/log/{self.user_id}", log_data)
        
        if result.get("success"):
            logger.info(f"Agent interaction logged: {event}")
            return True
        
        return False
    
    # ============================================
    # REPORTS
    # ============================================
    
    def get_report(self, report_type: str = "weekly") -> Optional[Dict]:
        """
        Get pregnancy report.
        
        Args:
            report_type: Type of report ("weekly" or "overall")
            
        Returns:
            Report dict if successful, None otherwise
        """
        if not self.user_id:
            logger.error("No user_id set")
            return None
        
        result = self._make_request("GET", f"/report/{self.user_id}?type={report_type}")
        
        if result.get("success"):
            return result.get("report")
        
        return None
    
    # ============================================
    # HEALTH CHECK
    # ============================================
    
    def health_check(self) -> bool:
        """
        Check if backend is healthy.
        
        Returns:
            True if backend is running, False otherwise
        """
        result = self._make_request("GET", "/health")
        return result.get("success", False)
