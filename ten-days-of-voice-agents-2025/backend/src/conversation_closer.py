"""
Conversation Closer - End-of-Conversation Task Assignment
Non-invasive add-on for assigning small pregnancy care tasks when user ends conversation.
"""

import logging
import random
from typing import Optional, Tuple
from datetime import datetime

logger = logging.getLogger("conversation_closer")


class ConversationCloser:
    """Handles end-of-conversation detection and task assignment."""
    
    # Trigger phrases for conversation closure
    CLOSURE_PHRASES = [
        "thank you", "thanks", "thank u", "thx", "ty",
        "done", "i'm done", "that's all", "that's it",
        "ok", "okay", "ok thanks", "okay thanks",
        "got it", "understood", "appreciate it",
        "bye", "goodbye", "see you", "talk later",
        "that helps", "perfect", "sounds good"
    ]
    
    # Small pregnancy care tasks (context-aware)
    CARE_TASKS = {
        # Hydration tasks
        "hydration": [
            "Drink one glass of water now",
            "Have a glass of water before your next meal",
            "Sip some water slowly right now"
        ],
        # Rest tasks
        "rest": [
            "Rest on your left side for 10 minutes",
            "Lie down and elevate your feet for 5 minutes",
            "Take a 10-minute rest break"
        ],
        # Breathing tasks
        "breathing": [
            "Take 5 slow deep breaths",
            "Practice 3 minutes of calm breathing",
            "Do 5 deep belly breaths"
        ],
        # Nutrition tasks
        "nutrition": [
            "Eat something light like fruit or nuts",
            "Have a healthy snack within the hour",
            "Eat a small protein-rich snack"
        ],
        # Connection tasks
        "connection": [
            "Send a message to someone you trust",
            "Call or text a loved one",
            "Share something positive with your partner"
        ],
        # Movement tasks
        "movement": [
            "Take a gentle 5-minute walk",
            "Do 3 gentle stretches",
            "Stand up and move around for 2 minutes"
        ],
        # Self-care tasks
        "self_care": [
            "Put your feet up and relax for 5 minutes",
            "Listen to calming music for 10 minutes",
            "Write down one thing you're grateful for"
        ]
    }
    
    def __init__(self):
        """Initialize conversation closer."""
        self.last_task_assigned = None
        self.task_assignment_count = 0
        logger.info("Conversation closer initialized")
    
    def detect_closure(self, message: str) -> bool:
        """
        Detect if user message indicates conversation closure.
        
        Args:
            message: User's message
            
        Returns:
            True if closure detected, False otherwise
        """
        message_lower = message.lower().strip()
        
        # Remove punctuation for matching
        message_clean = message_lower.replace(".", "").replace("!", "").replace("?", "")
        
        # Check for exact matches or phrases contained in message
        for phrase in self.CLOSURE_PHRASES:
            if phrase == message_clean or phrase in message_clean:
                logger.info(f"🔚 Closure detected: '{message}' matched '{phrase}'")
                return True
        
        return False
    
    def select_task(
        self,
        emotional_state: Optional[str] = None,
        symptoms: Optional[list] = None,
        fatigue_level: Optional[str] = None,
        pregnancy_week: Optional[int] = None
    ) -> str:
        """
        Select an appropriate small care task based on context.
        
        Args:
            emotional_state: User's emotional state (e.g., "anxious", "happy")
            symptoms: List of recent symptoms
            fatigue_level: User's fatigue level (e.g., "exhausted", "energetic")
            pregnancy_week: Current pregnancy week
            
        Returns:
            Selected task string
        """
        # Determine task category based on context
        category = self._determine_category(
            emotional_state, symptoms, fatigue_level, pregnancy_week
        )
        
        # Get tasks from category
        tasks = self.CARE_TASKS.get(category, self.CARE_TASKS["hydration"])
        
        # Select random task from category
        task = random.choice(tasks)
        
        # Avoid repeating the same task
        if task == self.last_task_assigned and len(tasks) > 1:
            # Pick a different one
            remaining = [t for t in tasks if t != task]
            task = random.choice(remaining)
        
        self.last_task_assigned = task
        self.task_assignment_count += 1
        
        logger.info(f"📝 Selected task (category: {category}): {task}")
        return task
    
    def _determine_category(
        self,
        emotional_state: Optional[str],
        symptoms: Optional[list],
        fatigue_level: Optional[str],
        pregnancy_week: Optional[int]
    ) -> str:
        """
        Determine the most appropriate task category based on context.
        
        Args:
            emotional_state: User's emotional state
            symptoms: List of recent symptoms
            fatigue_level: User's fatigue level
            pregnancy_week: Current pregnancy week
            
        Returns:
            Task category string
        """
        # Priority 1: Address emotional state
        if emotional_state:
            emotion_lower = emotional_state.lower()
            
            if any(word in emotion_lower for word in ["anxious", "stressed", "overwhelmed", "worried"]):
                return "breathing"
            
            if any(word in emotion_lower for word in ["sad", "lonely", "isolated"]):
                return "connection"
            
            if any(word in emotion_lower for word in ["tired", "exhausted"]):
                return "rest"
        
        # Priority 2: Address fatigue
        if fatigue_level:
            fatigue_lower = fatigue_level.lower()
            
            if any(word in fatigue_lower for word in ["exhausted", "drained", "very tired"]):
                return "rest"
            
            if any(word in fatigue_lower for word in ["energetic", "good"]):
                return "movement"
        
        # Priority 3: Address symptoms
        if symptoms:
            symptom_list = [s.get("symptom", "").lower() if isinstance(s, dict) else str(s).lower() 
                          for s in symptoms]
            
            if any("nausea" in s or "sick" in s for s in symptom_list):
                return "nutrition"
            
            if any("back pain" in s or "pain" in s for s in symptom_list):
                return "rest"
            
            if any("headache" in s for s in symptom_list):
                return "hydration"
        
        # Priority 4: Trimester-specific defaults
        if pregnancy_week:
            if pregnancy_week <= 13:  # First trimester
                return "rest"  # More rest needed
            elif pregnancy_week <= 27:  # Second trimester
                return "movement"  # Energy boost
            else:  # Third trimester
                return "rest"  # More rest again
        
        # Default: Hydration (always safe and beneficial)
        return "hydration"
    
    def format_confirmation(
        self,
        task: str,
        todoist_success: bool = True
    ) -> str:
        """
        Format the confirmation message for the user.
        
        Args:
            task: The assigned task
            todoist_success: Whether Todoist sync succeeded
            
        Returns:
            Formatted confirmation message
        """
        if todoist_success:
            message = (
                f"Before you go, I've added one small care task for you today:\n\n"
                f"📝 {task}\n\n"
                f"I've saved it to Todoist for you 💗\n\n"
                f"Take care and check back anytime."
            )
        else:
            message = (
                f"I saved a small care task for you here:\n\n"
                f"📝 {task}\n\n"
                f"I wasn't able to sync it to Todoist, but it's safe here for you 💗"
            )
        
        logger.info(f"✅ Confirmation formatted: Todoist success = {todoist_success}")
        return message
    
    def create_task_log_entry(
        self,
        task: str,
        todoist_success: bool,
        trigger_phrase: str,
        context: dict
    ) -> dict:
        """
        Create a log entry for the task assignment.
        
        Args:
            task: The assigned task
            todoist_success: Whether Todoist sync succeeded
            trigger_phrase: The phrase that triggered closure
            context: Context information (emotional_state, symptoms, etc.)
            
        Returns:
            Log entry dict
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "end_of_conversation_task",
            "task": task,
            "todoist_synced": todoist_success,
            "trigger_phrase": trigger_phrase,
            "context": context,
            "assignment_count": self.task_assignment_count
        }
        
        logger.info(f"📊 Task log entry created: {entry}")
        return entry
    
    def get_stats(self) -> dict:
        """
        Get statistics about task assignments.
        
        Returns:
            Stats dict
        """
        return {
            "total_assignments": self.task_assignment_count,
            "last_task": self.last_task_assigned
        }
