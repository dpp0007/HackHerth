"""Pregnancy nutrition recommendation engine."""

import json
import os
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger("nutrition_engine")


class NutritionEngine:
    """Provides pregnancy-safe nutrition recommendations."""
    
    def __init__(self, profile):
        self.profile = profile
        self.foods_data = self._load_foods_data()
    
    def _load_foods_data(self) -> dict:
        """Load foods database from JSON."""
        foods_file = "pregnancy_data/foods.json"
        if os.path.exists(foods_file):
            try:
                with open(foods_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading foods data: {e}")
        return {"safe_foods": {}, "foods_to_avoid": []}
    
    def get_recommendations(self, trimester: int) -> List[Dict]:
        """
        Get food recommendations for current trimester.
        
        Args:
            trimester: Current trimester (1, 2, or 3)
            
        Returns:
            List of food recommendations with allergy warnings
        """
        trimester_key = f"trimester_{trimester}"
        foods = self.foods_data.get("safe_foods", {}).get(trimester_key, [])
        
        recommendations = []
        user_allergies = self.profile.profile.get("allergies", [])
        
        for food in foods:
            food_copy = food.copy()
            
            # Check for allergen conflicts
            has_conflict = False
            for allergen in food.get("allergens", []):
                if allergen.lower() in user_allergies:
                    has_conflict = True
                    break
            
            if has_conflict:
                food_copy["warning"] = "⚠️ Contains allergen"
                food_copy["safe"] = False
            else:
                food_copy["safe"] = True
            
            recommendations.append(food_copy)
        
        return recommendations
    
    def get_safe_recommendations_text(self, trimester: int, limit: int = 5) -> str:
        """
        Get formatted text of safe food recommendations.
        
        Args:
            trimester: Current trimester
            limit: Maximum number of recommendations
            
        Returns:
            Formatted string of recommendations
        """
        recommendations = self.get_recommendations(trimester)
        safe_foods = [f for f in recommendations if f.get("safe", True)][:limit]
        
        if not safe_foods:
            return "I don't have specific recommendations right now, but focus on balanced meals with plenty of fruits, vegetables, and protein."
        
        food_list = []
        for food in safe_foods:
            food_list.append(f"{food['name']} - {food['benefit']}")
        
        return "Here are some great options for you: " + ", ".join(food_list) + "."
    
    def check_food_safety(self, food_name: str) -> Tuple[bool, str]:
        """
        Check if a food is safe during pregnancy.
        
        Args:
            food_name: Name of the food to check
            
        Returns:
            Tuple of (is_safe: bool, message: str)
        """
        food_lower = food_name.lower()
        
        # Check foods to avoid
        foods_to_avoid = self.foods_data.get("foods_to_avoid", [])
        for avoid_food in foods_to_avoid:
            if avoid_food.lower() in food_lower or food_lower in avoid_food.lower():
                return False, f"⚠️ {avoid_food} should be avoided during pregnancy."
        
        # Check if it's in safe foods
        for trimester_foods in self.foods_data.get("safe_foods", {}).values():
            for food in trimester_foods:
                if food["name"].lower() in food_lower or food_lower in food["name"].lower():
                    # Check allergens
                    user_allergies = self.profile.profile.get("allergies", [])
                    for allergen in food.get("allergens", []):
                        if allergen.lower() in user_allergies:
                            return False, f"⚠️ {food['name']} contains {allergen}, which you're allergic to."
                    
                    return True, f"✅ {food['name']} is great! {food['benefit']}"
        
        # Unknown food - provide general guidance
        return True, "I'm not sure about that specific food. When in doubt, check with your healthcare provider or a nutritionist."
