"""Todoist integration handler for pregnancy care tasks."""

import os
from typing import Optional
from todoist_api_python.api import TodoistAPI
import logging

logger = logging.getLogger("todoist_handler")


class TodoistHandler:
    """Handler for creating and managing Todoist tasks from pregnancy care tasks."""
    
    def __init__(self, api_token: str, project_id: Optional[str] = None):
        """Initialize Todoist API client.
        
        Args:
            api_token: Todoist API token
            project_id: Optional project ID to add tasks to
        """
        self.api = TodoistAPI(api_token)
        self.project_id = project_id
        logger.info("Todoist handler initialized")
    
    async def create_tasks(self, tasks: list[str]) -> dict:
        """Create Todoist tasks from pregnancy care tasks.
        
        Args:
            tasks: List of pregnancy care task strings
            
        Returns:
            dict with 'created' count and 'task_ids' list
        """
        created_tasks = []
        
        for task in tasks:
            try:
                # Format task content
                content = self._format_task_content(task)
                
                # Prepare task parameters
                task_params = {
                    "content": content,
                    "due_string": "today",
                    "priority": 3,  # High priority for pregnancy care (1=lowest, 4=highest)
                }
                
                # Add project if specified
                if self.project_id:
                    task_params["project_id"] = self.project_id
                
                # Create task
                task_obj = self.api.add_task(**task_params)
                
                created_tasks.append(task_obj.id)
                logger.info(f"✅ Created Todoist task: {content} (ID: {task_obj.id})")
                
            except Exception as e:
                logger.error(f"❌ Failed to create task for '{task}': {e}")
                continue
        
        return {
            "created": len(created_tasks),
            "task_ids": created_tasks
        }
    
    def _format_task_content(self, task: str) -> str:
        """Format pregnancy task as task content.
        
        Args:
            task: Raw task string
            
        Returns:
            Formatted task content
        """
        # Clean up the task
        content = task.strip()
        
        # Capitalize first letter if needed
        if content and content[0].islower():
            content = content[0].upper() + content[1:]
        
        # Add pregnancy emoji if not already present
        if "🤰" not in content and len(content) < 50:
            content = f"🤰 {content}"
        
        return content
