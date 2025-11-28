"""Notion integration handler for pregnancy journal entries."""

import logging
from datetime import datetime
from notion_client import Client

logger = logging.getLogger("notion_handler")


class NotionHandler:
    """Handler for saving pregnancy journal entries to Notion database."""
    
    def __init__(self, api_key: str, database_id: str):
        """Initialize Notion API client.
        
        Args:
            api_key: Notion integration token
            database_id: Notion database ID
        """
        self.client = Client(auth=api_key)
        self.database_id = database_id
        logger.info("Notion handler initialized")
    
    async def save_pregnancy_entry(self, entry: dict) -> dict:
        """Save pregnancy journal entry to Notion database.
        
        Args:
            entry: Pregnancy journal entry dict with datetime, pregnancy_week, trimester, 
                   emotional_state, fatigue_level, symptoms, nutrition_notes, pregnancy_tasks, summary
            
        Returns:
            dict with 'success' bool and 'page_id' string
        """
        try:
            # Format data for Notion
            properties = self._format_pregnancy_properties(entry)
            
            # Create page in database
            response = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties=properties
            )
            
            page_id = response["id"]
            logger.info(f"✅ Created Notion page: {page_id}")
            
            return {
                "success": True,
                "page_id": page_id
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to save to Notion: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def save_wellness_entry(self, entry: dict) -> dict:
        """Legacy method for backward compatibility."""
        return await self.save_pregnancy_entry(entry)
    
    def _format_pregnancy_properties(self, entry: dict) -> dict:
        """Format pregnancy journal entry for Notion properties.
        
        Uses rich_text format for all fields - compatible with Text/Rich Text properties.
        """
        # Parse datetime for title
        dt = datetime.fromisoformat(entry["datetime"])
        week = entry.get("pregnancy_week", "N/A")
        title = f"Week {week} - {dt.strftime('%Y-%m-%d %H:%M')}"
        
        # Build properties
        properties = {
            "Name": {
                "title": [{"text": {"content": title}}]
            }
        }
        
        # Add Date (required)
        properties["Date"] = {
            "date": {"start": entry["datetime"]}
        }
        
        # Add Pregnancy Week (optional)
        if entry.get("pregnancy_week"):
            properties["Week"] = {
                "rich_text": [{"text": {"content": str(entry["pregnancy_week"])}}]
            }
        
        # Add Trimester (optional)
        if entry.get("trimester"):
            properties["Trimester"] = {
                "rich_text": [{"text": {"content": f"Trimester {entry['trimester']}"}}]
            }
        
        # Add Emotional State (optional)
        if entry.get("emotional_state"):
            properties["Emotional State"] = {
                "rich_text": [{"text": {"content": entry["emotional_state"]}}]
            }
        
        # Add Fatigue Level (optional)
        if entry.get("fatigue_level"):
            properties["Fatigue"] = {
                "rich_text": [{"text": {"content": entry["fatigue_level"]}}]
            }
        
        # Add Symptoms (optional)
        if entry.get("symptoms"):
            symptoms_text = ", ".join([s["symptom"] for s in entry["symptoms"]])
            properties["Symptoms"] = {
                "rich_text": [{"text": {"content": symptoms_text}}]
            }
        
        # Add Pregnancy Tasks (optional)
        if entry.get("pregnancy_tasks"):
            tasks_text = ", ".join(entry["pregnancy_tasks"])
            properties["Tasks"] = {
                "rich_text": [{"text": {"content": tasks_text}}]
            }
        
        # Add Summary (optional)
        if entry.get("summary"):
            properties["Summary"] = {
                "rich_text": [{"text": {"content": entry["summary"]}}]
            }
        
        return properties
    
    def _format_properties(self, entry: dict) -> dict:
        """Legacy method for backward compatibility."""
        return self._format_pregnancy_properties(entry)
