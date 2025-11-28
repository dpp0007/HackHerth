"""Pregnancy profile management."""

import json
import os
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger("pregnancy_profile")


class PregnancyProfile:
    """Manages pregnancy profile data."""
    
    def __init__(self, profile_file: str = "pregnancy_data/profile.json"):
        self.profile_file = profile_file
        self.profile = self._load_profile()
    
    def _load_profile(self) -> dict:
        """Load pregnancy profile from JSON."""
        if os.path.exists(self.profile_file):
            try:
                with open(self.profile_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading profile: {e}")
        
        # Default empty profile
        return {
            "lmp": None,  # Last Menstrual Period
            "due_date": None,
            "current_week": None,
            "trimester": None,
            "allergies": [],
            "food_preferences": [],
            "created_at": datetime.now().isoformat()
        }
    
    def save_profile(self):
        """Save profile to JSON."""
        os.makedirs(os.path.dirname(self.profile_file), exist_ok=True)
        with open(self.profile_file, 'w') as f:
            json.dump(self.profile, f, indent=2)
        logger.info("Pregnancy profile saved")
    
    def set_due_date(self, due_date: str):
        """Set due date and calculate current week."""
        self.profile["due_date"] = due_date
        self._calculate_week()
        self.save_profile()
    
    def set_lmp(self, lmp: str):
        """Set last menstrual period and calculate due date."""
        self.profile["lmp"] = lmp
        # Calculate due date (LMP + 280 days)
        lmp_date = datetime.fromisoformat(lmp)
        due_date = lmp_date + timedelta(days=280)
        self.profile["due_date"] = due_date.isoformat()
        self._calculate_week()
        self.save_profile()
    
    def _calculate_week(self):
        """Calculate current pregnancy week from due date."""
        if not self.profile.get("due_date"):
            return
        
        try:
            due_date = datetime.fromisoformat(self.profile["due_date"])
            today = datetime.now()
            days_until_due = (due_date - today).days
            weeks_pregnant = 40 - (days_until_due // 7)
            
            if weeks_pregnant < 1:
                weeks_pregnant = 1
            elif weeks_pregnant > 42:
                weeks_pregnant = 42
            
            self.profile["current_week"] = weeks_pregnant
            
            # Determine trimester
            if weeks_pregnant <= 13:
                self.profile["trimester"] = 1
            elif weeks_pregnant <= 27:
                self.profile["trimester"] = 2
            else:
                self.profile["trimester"] = 3
                
        except Exception as e:
            logger.error(f"Error calculating week: {e}")
    
    def add_allergy(self, allergy: str):
        """Add an allergy."""
        if allergy not in self.profile["allergies"]:
            self.profile["allergies"].append(allergy.lower())
            self.save_profile()
    
    def add_food_preference(self, preference: str):
        """Add a food preference."""
        if preference not in self.profile["food_preferences"]:
            self.profile["food_preferences"].append(preference)
            self.save_profile()
    
    def get_week_info(self) -> Optional[dict]:
        """Get information about current pregnancy week."""
        if not self.profile.get("current_week"):
            return None
        
        week = self.profile["current_week"]
        
        # Load week guide
        week_guide_file = "pregnancy_data/week_guide.json"
        if not os.path.exists(week_guide_file):
            return None
        
        try:
            with open(week_guide_file, 'r') as f:
                guide = json.load(f)
            
            # Find appropriate week range
            for week_range, info in guide["weeks"].items():
                start, end = map(int, week_range.split('-'))
                if start <= week <= end:
                    return {
                        "week": week,
                        "trimester": info["trimester"],
                        "baby_size": info["baby_size"],
                        "key_developments": info["key_developments"],
                        "common_symptoms": info["common_symptoms"],
                        "tips": info["tips"]
                    }
        except Exception as e:
            logger.error(f"Error loading week guide: {e}")
        
        return None
    
    def has_allergy(self, allergen: str) -> bool:
        """Check if user has specific allergy."""
        return allergen.lower() in self.profile["allergies"]
