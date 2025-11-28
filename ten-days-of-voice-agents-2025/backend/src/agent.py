import logging

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
    tokenize,
    function_tool,
    RunContext,
    llm
)
from livekit import rtc
import json
import os
from datetime import datetime
from typing import Optional
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from todoist_handler import TodoistHandler
from notion_handler import NotionHandler
from pregnancy_profile import PregnancyProfile
from symptom_analyzer import SymptomAnalyzer
from nutrition_engine import NutritionEngine

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class PregnancyCompanion(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a Pregnancy Companion AI. You support pregnant users emotionally, physically, and informationally. You speak like a caring friend and pregnancy guide. You understand pregnancy weeks, symptoms, nutrition, and emotional changes. You never diagnose. You escalate on danger signs with support and urgency. You keep answers short, calm, and reassuring.

CORE PRINCIPLES:
- Never diagnose medical conditions
- Always escalate emergency symptoms immediately
- Be supportive, warm, and encouraging
- Celebrate positive pregnancy moments
- Comfort during difficult symptoms
- Provide evidence-based pregnancy guidance
- Keep responses short and natural

CONVERSATION STARTER:
"Hi! I'm here to support you through your pregnancy. Which week are you in, or would you like me to calculate it for you?"

PREGNANCY CONVERSATION FLOW:
1. Ask about pregnancy week (if not known)
2. Ask: "How are you feeling? Any symptoms today?" → call analyze_symptom(symptom)
3. Ask: "How's your mood and emotional state?" → call record_emotional_state(emotion)
4. Ask: "How are you managing fatigue?" → call record_fatigue_level(fatigue)
5. Ask: "Any nutrition questions or cravings?" → call check_nutrition(food_query)
6. Ask: "Any pregnancy care tasks for today? 2-3 things like taking vitamins, resting, or appointments." → call record_pregnancy_tasks(tasks)
7. Provide recap and confirm
8. Call save_pregnancy_journal()
9. Offer: "Would you like reminders in Todoist? Save to Notion?"

EMERGENCY DETECTION - IMMEDIATE ESCALATION:
If user mentions: bleeding, heavy bleeding, fainting, severe pain, sudden swelling, shortness of breath, severe headache, vision changes, blurred vision, high fever, regular contractions, water breaking
→ IMMEDIATELY respond: "⚠️ This sounds like something you should discuss with your healthcare provider right away. If you're experiencing severe symptoms, please call your doctor or go to the emergency room. Your health and baby's health come first."

PREGNANCY CARE TASKS (NOT GOALS):
Focus on pregnancy-specific care:
- Take prenatal vitamins
- Drink 8 glasses of water
- Rest for 30 minutes
- Gentle walk or prenatal yoga
- Doctor appointment
- Track baby movements
- Prepare hospital bag
- Practice breathing exercises

WEEKLY PREGNANCY REPORT:
When user asks about their week, call get_weekly_pregnancy_report().
Trigger phrases: "How was my week?", "Show my pregnancy summary", "How am I doing?"

NUTRITION GUIDANCE:
When user asks about food, call check_nutrition(food_query).
Provide pregnancy-safe recommendations.
Warn about foods to avoid.
Check for allergen conflicts.

SYMPTOM SUPPORT:
When user mentions symptoms, call analyze_symptom(symptom).
Provide trimester-appropriate guidance.
Detect emergency keywords.
Never diagnose - always support and guide.

EMOTIONAL SUPPORT:
When user shares emotions, call record_emotional_state(emotion).
Acknowledge pregnancy hormones.
Validate feelings.
Encourage when positive.
Comfort when struggling.

TONE:
- Warm, calm, reassuring
- Short, natural responses
- Pregnancy-aware language
- Friend + guide combination
- Never medical advice
- Always supportive

IMPORTANT: Call function tools when user provides information. Let the tools handle the logic.""",
        )
        
        # Initialize pregnancy profile and engines
        self.pregnancy_profile = PregnancyProfile()
        self.symptom_analyzer = SymptomAnalyzer()
        self.nutrition_engine = NutritionEngine(self.pregnancy_profile)
        
        # Initialize pregnancy journal state
        self.journal_state = {
            "symptoms": [],
            "emotional_state": "",
            "fatigue_level": "",
            "nutrition_notes": [],
            "pregnancy_tasks": [],
            "summary": ""
        }
        
        # Track input mode for hybrid text/voice
        self.current_input_mode = "voice"  # "voice" or "text"
        
        # Load previous entries
        self.previous_entries = self._load_previous_entries()

    def _load_previous_entries(self) -> list:
        """Load previous pregnancy journal entries from JSON file."""
        journal_file = "pregnancy_data/pregnancy_journal.json"
        try:
            if os.path.exists(journal_file):
                with open(journal_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading pregnancy journal: {e}")
        return []
    
    async def on_enter(self) -> None:
        """Called when the agent starts - greet the user"""
        # Get pregnancy week info
        week_info = self.pregnancy_profile.get_week_info()
        
        if week_info:
            week = week_info["week"]
            trimester = week_info["trimester"]
            baby_size = week_info["baby_size"]
            greeting = (
                f"Hi! Welcome to your pregnancy update. You're in week {week} of trimester {trimester}. "
                f"Your baby is about the size of a {baby_size}. How are you feeling today? Any symptoms?"
            )
        else:
            greeting = (
                "Hi! Welcome to your pregnancy companion. I'm here to support you through your journey. "
                "How are you feeling today?"
            )
        
        # Reference previous entry if available
        if self.previous_entries:
            last_entry = self.previous_entries[-1]
            if "emotional_state" in last_entry and last_entry["emotional_state"]:
                emotion = last_entry["emotional_state"]
                greeting += f" Last time you were feeling {emotion}."
        
        await self.session.say(greeting)
        
        # Set up text message listener for hybrid mode
        self.session.room.on("data_received", self._on_data_received)
    
    def _on_data_received(self, data: rtc.DataPacket):
        """Handle incoming text messages from the frontend."""
        try:
            message = data.data.decode('utf-8')
            
            # Check if it's a text chat message
            if message.startswith("TEXT_CHAT:"):
                text_message = message.replace("TEXT_CHAT:", "").strip()
                logger.info(f"📝 Received text message: {text_message}")
                
                # Set input mode to text
                self.current_input_mode = "text"
                
                # Process the text message through the LLM
                # This will be handled by the session's chat context
                # The agent will respond without TTS
                
        except Exception as e:
            logger.error(f"Error handling text message: {e}")
    
    async def handle_text_message(self, message: str) -> str:
        """
        Handle text input from user and return text response.
        This bypasses TTS and provides text-only interaction.
        
        Args:
            message: User's text message
            
        Returns:
            Agent's text response
        """
        logger.info(f"💬 Processing text message: {message}")
        
        # Set input mode to text (no TTS)
        self.current_input_mode = "text"
        
        # Process through the same logic as voice
        # The LLM will handle intent detection and call appropriate function tools
        
        # For now, return a simple acknowledgment
        # The actual processing will be handled by the LLM through the session
        return f"Received your message: {message}"
    
    @function_tool()
    async def analyze_symptom(self, context: RunContext, symptom: str) -> str:
        """Analyze a pregnancy symptom and provide safe guidance.
        
        Args:
            symptom: User's symptom description (e.g., "nausea", "back pain", "bleeding")
        """
        trimester = self.pregnancy_profile.profile.get("trimester", 1)
        is_emergency, response = self.symptom_analyzer.analyze_symptom(symptom, trimester)
        
        # Log symptom
        self.journal_state["symptoms"].append({
            "symptom": symptom,
            "is_emergency": is_emergency,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"Analyzed symptom: {symptom}, Emergency: {is_emergency}")
        
        if is_emergency:
            return response
        
        return response + " Now, how's your emotional state today?"
    
    @function_tool()
    async def record_emotional_state(self, context: RunContext, emotion: str) -> str:
        """Record the user's emotional state with supportive response.
        
        Args:
            emotion: User's emotional state (e.g., "happy", "anxious", "overwhelmed", "excited", "scared")
        """
        self.journal_state["emotional_state"] = emotion
        logger.info(f"Recorded emotional state: {emotion}")
        
        # Detect sentiment and respond appropriately
        positive_words = ["happy", "excited", "joyful", "grateful", "peaceful", "content"]
        negative_words = ["anxious", "scared", "overwhelmed", "sad", "worried", "stressed"]
        
        emotion_lower = emotion.lower()
        
        if any(word in emotion_lower for word in positive_words):
            response = "That's wonderful! I'm so glad you're feeling good. Positive emotions are great for you and baby."
        elif any(word in emotion_lower for word in negative_words):
            response = "I hear you. Pregnancy can bring up a lot of emotions, and that's completely normal. Be gentle with yourself."
        else:
            response = "Thank you for sharing how you're feeling. Your emotions matter."
        
        return response + " How are you managing fatigue today?"

    @function_tool()
    async def record_fatigue_level(self, context: RunContext, fatigue: str) -> str:
        """Record the user's fatigue level.
        
        Args:
            fatigue: User's fatigue level (e.g., "exhausted", "tired", "okay", "energetic", "low energy")
        """
        self.journal_state["fatigue_level"] = fatigue
        logger.info(f"Recorded fatigue level: {fatigue}")
        
        # Provide supportive response based on fatigue
        fatigue_lower = fatigue.lower()
        if "exhaust" in fatigue_lower or "drain" in fatigue_lower or "very tired" in fatigue_lower:
            response = "Fatigue is so common in pregnancy. Your body is doing amazing work. Rest when you can."
        elif "energetic" in fatigue_lower or "good" in fatigue_lower:
            response = "That's great! Having energy is wonderful. Make the most of it while being mindful not to overdo it."
        else:
            response = "I understand. Fatigue levels can fluctuate a lot during pregnancy."
        
        return response + " What about nutrition? Any cravings, concerns, or foods you're wondering about?"

    @function_tool()
    async def check_nutrition(self, context: RunContext, food_query: str) -> str:
        """Check nutrition and provide pregnancy-safe food guidance.
        
        Args:
            food_query: User's food question or craving (e.g., "sushi", "coffee", "spinach")
        """
        trimester = self.pregnancy_profile.profile.get("trimester", 1)
        
        # Check if asking about specific food
        if len(food_query.split()) <= 3:
            is_safe, message = self.nutrition_engine.check_food_safety(food_query)
            self.journal_state["nutrition_notes"].append({
                "query": food_query,
                "response": message,
                "timestamp": datetime.now().isoformat()
            })
            response = message
        else:
            # General nutrition guidance
            recommendations = self.nutrition_engine.get_safe_recommendations_text(trimester, limit=3)
            self.journal_state["nutrition_notes"].append({
                "query": food_query,
                "response": recommendations,
                "timestamp": datetime.now().isoformat()
            })
            response = recommendations
        
        logger.info(f"Nutrition check: {food_query}")
        return response + " Now, any pregnancy care tasks for today? Keep it to 2 or 3 things."
    
    @function_tool()
    async def record_pregnancy_tasks(self, context: RunContext, tasks: str) -> str:
        """Record pregnancy care tasks for today.
        
        Args:
            tasks: Comma-separated list of tasks (e.g., "take prenatal vitamin, drink water, rest")
        """
        tasks_list = [task.strip() for task in tasks.split(",")][:3]  # Limit to 3
        self.journal_state["pregnancy_tasks"] = tasks_list
        logger.info(f"Recorded pregnancy tasks: {tasks_list}")
        
        # Check if we have everything for recap
        if self.journal_state["emotional_state"] and self.journal_state["fatigue_level"]:
            # Provide recap
            tasks_text = ", ".join(tasks_list)
            emotion = self.journal_state["emotional_state"]
            fatigue = self.journal_state["fatigue_level"]
            
            recap = (
                f"Let me recap your pregnancy update. You're feeling {emotion} emotionally, "
                f"with {fatigue} fatigue levels. "
            )
            
            if self.journal_state["symptoms"]:
                symptoms_text = ", ".join([s["symptom"] for s in self.journal_state["symptoms"]])
                recap += f"You mentioned: {symptoms_text}. "
            
            recap += f"Your pregnancy care tasks today are: {tasks_text}. Does that sound right?"
            
            return recap
        
        return "Thanks for sharing. Let me know if there's anything else."

    @function_tool()
    async def provide_recap(self, context: RunContext) -> str:
        """Provide a recap of the pregnancy update before saving."""
        
        if not self.journal_state["emotional_state"] or not self.journal_state["fatigue_level"]:
            return "I still need to know your emotional state and fatigue level. Can you share those?"
        
        if not self.journal_state["pregnancy_tasks"]:
            return "What about your pregnancy care tasks for today? Anything you'd like to focus on?"
        
        # Build recap
        tasks_text = ", ".join(self.journal_state["pregnancy_tasks"])
        emotion = self.journal_state["emotional_state"]
        fatigue = self.journal_state["fatigue_level"]
        
        recap = f"You're feeling {emotion} emotionally with {fatigue} fatigue levels. "
        
        if self.journal_state["symptoms"]:
            symptoms_text = ", ".join([s["symptom"] for s in self.journal_state["symptoms"]])
            recap += f"You mentioned: {symptoms_text}. "
        
        recap += f"Your pregnancy care tasks today are: {tasks_text}. Does this sound right?"
        
        logger.info(f"Pregnancy journal recap: {self.journal_state}")
        return recap

    @function_tool()
    async def save_pregnancy_journal(self, context: RunContext) -> str:
        """Save the pregnancy journal entry to JSON file.
        Call this after the user confirms the recap is correct."""
        
        # Validate required fields
        if not all([
            self.journal_state["emotional_state"],
            self.journal_state["fatigue_level"],
            self.journal_state["pregnancy_tasks"]
        ]):
            return "I need your emotional state, fatigue level, and at least one pregnancy care task before I can save this journal entry."
        
        # Get pregnancy profile info
        week_info = self.pregnancy_profile.get_week_info()
        
        # Create summary
        emotion = self.journal_state["emotional_state"]
        fatigue = self.journal_state["fatigue_level"]
        tasks_text = ", ".join(self.journal_state["pregnancy_tasks"])
        
        summary = f"Week {week_info['week'] if week_info else 'N/A'}: Feeling {emotion}, {fatigue} energy. Tasks: {tasks_text}"
        
        if self.journal_state["symptoms"]:
            symptoms_text = ", ".join([s["symptom"] for s in self.journal_state["symptoms"]])
            summary += f". Symptoms: {symptoms_text}"
        
        # Prepare entry
        entry = {
            "datetime": datetime.now().isoformat(),
            "pregnancy_week": week_info["week"] if week_info else None,
            "trimester": week_info["trimester"] if week_info else None,
            "emotional_state": self.journal_state["emotional_state"],
            "fatigue_level": self.journal_state["fatigue_level"],
            "symptoms": self.journal_state["symptoms"],
            "nutrition_notes": self.journal_state["nutrition_notes"],
            "pregnancy_tasks": self.journal_state["pregnancy_tasks"],
            "summary": summary
        }
        
        # Ensure pregnancy_data directory exists
        os.makedirs("pregnancy_data", exist_ok=True)
        journal_file = "pregnancy_data/pregnancy_journal.json"
        
        # Load existing entries
        entries = []
        if os.path.exists(journal_file):
            try:
                with open(journal_file, 'r') as f:
                    entries = json.load(f)
            except Exception as e:
                logger.error(f"Error loading pregnancy journal: {e}")
        
        # Append new entry
        entries.append(entry)
        
        # Save to file
        with open(journal_file, 'w') as f:
            json.dump(entries, f, indent=2)
        
        # Log the JSON output
        json_str = json.dumps(entry, separators=(',', ':'))
        logger.info(f"PREGNANCY_JOURNAL_JSON: {json_str}")
        logger.info(f"Pregnancy journal entry saved")
        
        # Send JSON as data message to frontend
        try:
            await self.session.room.local_participant.publish_data(
                json_str.encode('utf-8'),
                reliable=True
            )
            logger.info("✅ Pregnancy journal entry sent via data message")
        except Exception as e:
            logger.error(f"❌ Failed to send pregnancy journal entry: {e}")
        
        # Reset state for next pregnancy update
        self.journal_state = {
            "symptoms": [],
            "emotional_state": "",
            "fatigue_level": "",
            "nutrition_notes": [],
            "pregnancy_tasks": [],
            "summary": ""
        }
        
        # Ask if user wants to create reminders and save to Notion
        return "Perfect! Your pregnancy journal is saved. Would you like me to create reminders in Todoist for your tasks? And should I save this to Notion?"

    @function_tool()
    async def emit_intent(self, context: RunContext, intent: str) -> str:
        """Emit an intent signal for the backend to detect and process with MCP tools.
        
        Args:
            intent: The intent to emit (e.g., "CREATE_TASKS", "SAVE_TO_NOTION", "CREATE_REMINDER", "WEEKLY_REFLECTION", "MARK_TASK_DONE")
        """
        logger.info(f"INTENT:{intent}")
        
        # Send intent as data message to frontend/backend
        try:
            intent_message = f"INTENT:{intent}"
            await self.session.room.local_participant.publish_data(
                intent_message.encode('utf-8'),
                reliable=True
            )
            logger.info(f"✅ Intent emitted: {intent}")
        except Exception as e:
            logger.error(f"❌ Failed to emit intent: {e}")
        
        # Return appropriate confirmation based on intent
        responses = {
            "CREATE_TASKS": "I'll help you create pregnancy care reminders.",
            "SAVE_TO_NOTION": "I'll save this to your Notion workspace.",
            "CREATE_REMINDER": "I'll set up that reminder for you.",
            "WEEKLY_REFLECTION": "Let me pull up your weekly summary.",
            "MARK_TASK_DONE": "Great! I'll mark that as complete."
        }
        
        return responses.get(intent, "Got it, processing that request.")

    @function_tool()
    async def get_weekly_pregnancy_report(self, context: RunContext) -> str:
        """Get a comprehensive pregnancy report from the past week.
        Call this when user asks about their week, progress, or patterns."""
        
        from datetime import timedelta
        from collections import Counter
        
        journal_file = "pregnancy_data/pregnancy_journal.json"
        
        # Load all entries
        entries = []
        if os.path.exists(journal_file):
            try:
                with open(journal_file, 'r') as f:
                    entries = json.load(f)
            except Exception as e:
                logger.error(f"Error loading pregnancy journal: {e}")
                return "I couldn't load your pregnancy journal right now."
        
        if not entries:
            return "You don't have any journal entries yet. Let's start tracking your pregnancy journey!"
        
        # Filter entries from the past 7 days
        now = datetime.now()
        week_ago = now - timedelta(days=7)
        
        recent_entries = []
        for entry in entries:
            try:
                entry_date = datetime.fromisoformat(entry["datetime"])
                if entry_date >= week_ago:
                    recent_entries.append(entry)
            except Exception:
                continue
        
        if not recent_entries:
            return "You don't have any entries from the past week. Let's start fresh today!"
        
        # Analyze the week
        emotions = [e.get("emotional_state", "") for e in recent_entries if e.get("emotional_state")]
        fatigue_levels = [e.get("fatigue_level", "") for e in recent_entries if e.get("fatigue_level")]
        all_symptoms = []
        all_tasks = []
        nutrition_count = 0
        
        for e in recent_entries:
            all_symptoms.extend([s["symptom"] for s in e.get("symptoms", [])])
            all_tasks.extend(e.get("pregnancy_tasks", []))
            nutrition_count += len(e.get("nutrition_notes", []))
        
        # Count frequencies
        emotion_counts = Counter(emotions)
        symptom_counts = Counter(all_symptoms)
        most_common_emotion = emotion_counts.most_common(1)[0] if emotion_counts else None
        most_common_symptom = symptom_counts.most_common(1)[0] if symptom_counts else None
        
        # Calculate streak
        streak = len(recent_entries)
        
        # Build conversational summary
        summary_parts = []
        
        # Update frequency
        if streak == 1:
            summary_parts.append("You've updated once this week.")
        elif streak >= 5:
            summary_parts.append(f"Amazing! You've checked in {streak} times this week.")
        else:
            summary_parts.append(f"You've checked in {streak} times this week.")
        
        # Emotional pattern
        if most_common_emotion:
            emotion_name, emotion_count = most_common_emotion
            if emotion_count > 1:
                summary_parts.append(f"Emotionally, you've been feeling {emotion_name} most often.")
            else:
                summary_parts.append(f"Your emotional state has been {emotion_name}.")
        
        # Symptom trend
        if most_common_symptom:
            symptom_name, symptom_count = most_common_symptom
            if symptom_count > 1:
                summary_parts.append(f"The most common symptom was {symptom_name}, which you mentioned {symptom_count} times.")
            else:
                summary_parts.append(f"You mentioned {symptom_name} as a symptom.")
        
        # Nutrition engagement
        if nutrition_count > 0:
            summary_parts.append(f"You asked about nutrition {nutrition_count} times - great job staying informed!")
        
        # Tasks
        if all_tasks:
            summary_parts.append(f"You set {len(all_tasks)} pregnancy care tasks.")
        
        # Encouragement
        if streak >= 3:
            summary_parts.append("You're doing wonderful staying connected with your pregnancy journey!")
        
        summary = " ".join(summary_parts)
        
        logger.info(f"Weekly pregnancy report generated: {len(recent_entries)} entries")
        logger.info(f"WEEKLY_PREGNANCY_REPORT: {summary}")
        
        # Emit intent for tracking
        await self.emit_intent(context, "WEEKLY_REFLECTION")
        
        return summary

    @function_tool()
    async def create_pregnancy_reminders(self, context: RunContext) -> str:
        """Create Todoist reminders from the user's pregnancy care tasks.
        Call this when user asks to create reminders, add to todo list, etc."""
        
        # Step 1: Get current tasks
        tasks = self.journal_state.get("pregnancy_tasks", [])
        
        # Step 2: If no current tasks, try to load from latest entry
        if not tasks:
            tasks = self._get_latest_pregnancy_tasks()
        
        # Step 3: Validate we have tasks
        if not tasks:
            return "I don't see any pregnancy care tasks to create reminders from. Would you like to set some tasks first?"
        
        # Step 4: Initialize Todoist handler
        try:
            api_token = os.getenv("TODOIST_API_TOKEN")
            project_id = os.getenv("TODOIST_PROJECT_ID")
            
            if not api_token:
                logger.error("TODOIST_API_TOKEN not found in environment")
                return "I'm having trouble connecting to Todoist right now."
            
            logger.info(f"Creating Todoist reminders for {len(tasks)} pregnancy tasks")
            handler = TodoistHandler(api_token, project_id)
            
            # Add pregnancy emoji to tasks
            pregnancy_tasks = [f"🤰 {task}" for task in tasks]
            
            # Step 5: Create tasks
            result = await handler.create_tasks(pregnancy_tasks)
            
            # Step 6: Log success
            logger.info(f"✅ Created {result['created']} Todoist reminders")
            
            # Step 7: Emit intent for tracking
            await self.emit_intent(context, "CREATE_TASKS")
            
            # Step 8: Return confirmation
            task_count = result['created']
            if task_count == 0:
                return "I had trouble creating those reminders. Please check your Todoist connection."
            elif task_count == 1:
                return "Perfect! Your pregnancy reminder has been saved to Todoist. Take care!"
            else:
                return f"Wonderful! All {task_count} pregnancy reminders have been saved to your Todoist. Take care of yourself!"
                
        except Exception as e:
            logger.error(f"❌ Error creating Todoist reminders: {e}")
            return "I had trouble creating those reminders. Please try again later."

    def _get_latest_pregnancy_tasks(self) -> list[str]:
        """Get tasks from the most recent pregnancy journal entry."""
        journal_file = "pregnancy_data/pregnancy_journal.json"
        
        if not os.path.exists(journal_file):
            return []
        
        try:
            with open(journal_file, 'r') as f:
                entries = json.load(f)
            
            if entries:
                latest = entries[-1]
                return latest.get("pregnancy_tasks", [])
        except Exception as e:
            logger.error(f"Error loading latest pregnancy tasks: {e}")
        
        return []

    @function_tool()
    async def save_to_notion(self, context: RunContext) -> str:
        """Save the latest pregnancy journal entry to Notion database.
        Call this when user asks to save to Notion, add to Notion, etc."""
        
        # Step 1: Get latest entry
        entry = self._get_latest_entry()
        
        # Step 2: Validate we have data
        if not entry:
            return "I don't see a journal entry to save. Would you like to do a pregnancy update first?"
        
        # Step 3: Initialize Notion handler
        try:
            api_key = os.getenv("NOTION_API_KEY")
            database_id = os.getenv("NOTION_DATABASE_ID")
            
            if not api_key or not database_id:
                logger.error("Notion credentials not found in environment")
                return "I'm having trouble connecting to Notion right now."
            
            logger.info("Saving pregnancy journal entry to Notion")
            handler = NotionHandler(api_key, database_id)
            
            # Step 4: Save to Notion
            result = await handler.save_pregnancy_entry(entry)
            
            # Step 5: Check result
            if result["success"]:
                logger.info(f"✅ Saved to Notion: {result['page_id']}")
                
                # Step 6: Emit intent
                await self.emit_intent(context, "SAVE_TO_NOTION")
                
                return "Perfect! Your pregnancy journal has been saved to Notion. Everything is backed up!"
            else:
                logger.error(f"Failed to save to Notion: {result.get('error')}")
                return "I had trouble saving to Notion. Please try again later."
                
        except Exception as e:
            logger.error(f"❌ Error saving to Notion: {e}")
            return "I had trouble saving to Notion. Please try again later."

    def _get_latest_entry(self) -> dict:
        """Get the most recent pregnancy journal entry."""
        journal_file = "pregnancy_data/pregnancy_journal.json"
        
        if not os.path.exists(journal_file):
            return None
        
        try:
            with open(journal_file, 'r') as f:
                entries = json.load(f)
            
            if entries:
                return entries[-1]
        except Exception as e:
            logger.error(f"Error loading latest entry: {e}")
        
        return None


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-2.5-flash",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="anisha", 
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # Metrics collection, to measure pipeline performance
    # For more information, see https://docs.livekit.io/agents/build/metrics/
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Create the pregnancy companion agent
    pregnancy_agent = PregnancyCompanion()
    
    # Set up text message handler for hybrid mode
    @ctx.room.on("data_received")
    def on_data_received(data: rtc.DataPacket):
        """Handle incoming text messages for hybrid text/voice mode."""
        try:
            message = data.data.decode('utf-8')
            
            # Check if it's a text chat message
            if message.startswith("TEXT_CHAT:"):
                text_message = message.replace("TEXT_CHAT:", "").strip()
                logger.info(f"📝 Received text message: {text_message}")
                
                # Set input mode to text (no TTS response)
                pregnancy_agent.current_input_mode = "text"
                
                # Send text message to chat context
                # The LLM will process it and respond via text only
                session.chat_ctx.append(
                    role="user",
                    text=text_message
                )
                
        except Exception as e:
            logger.error(f"Error handling text message: {e}")
    
    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=pregnancy_agent,
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
