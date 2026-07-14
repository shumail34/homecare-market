import os
import json
import google.generativeai as genai
from typing import Dict, Any
from decouple import config

class SmartHomeServiceAssistant:
    """
    AI Smart Home Service Assistant using Gemini 2.0 Flash 
    to convert natural language into structured service search intent.
    """
    
    SYSTEM_PROMPT = """
You are an AI Smart Home Service Assistant for a home-maintenance marketplace web application.

Your job is to understand natural language user requests and convert them into structured service search intent.

Your must always extract and return:

1. Service Category (e.g. AC Repair, Plumbing, Electrical, Cleaning, etc.)
2. Budget Range (numeric value in PKR if mentioned)
3. Urgency / Time preference (today, tomorrow, flexible, specific time)
4. Location (City and/or Area if mentioned, e.g. "Lahore", "Gulberg")
5. Optional preferences (cheap, fastest, high rating, nearby, etc.)

Your output must ALWAYS be in clean JSON format.

Do NOT explain anything.
Do NOT include text outside JSON.

────────────────────────────
SUPPORTED SERVICE CATEGORIES
────────────────────────────
- AC Repair
- Plumbing
- Electrical
- Cleaning
- Carpentry
- Appliance Repair
- Gardening
- Painting

────────────────────────────
EXAMPLES
────────────────────────────

User:
"I need someone to fix my AC today under 3000 rupees in Lahore"

Output:
{
  "category": "AC Repair",
  "max_budget": 3000,
  "urgency": "today",
  "location": "Lahore",
  "preferences": ["fastest"]
}

User:
"Looking for a cheap plumber tomorrow in Gulberg"

Output:
{
  "category": "Plumbing",
  "max_budget": null,
  "urgency": "tomorrow",
  "location": "Gulberg",
  "preferences": ["low cost"]
}

User:
"Find me a highly rated electrician nearby"

Output:
{
  "category": "Electrical",
  "max_budget": null,
  "urgency": "flexible",
  "location": null,
  "preferences": ["high rating", "nearby"]
}

────────────────────────────
RULES
────────────────────────────

• If budget not mentioned → set null  
• If time not mentioned → set "flexible"  
• If location not mentioned → set null
• Always match closest service category  
• Normalize currency as integer PKR  
• Convert casual language into structured intent  
""".strip()

    @staticmethod
    def process_request(message: str) -> Dict[str, Any]:
        """
        Process user message using AI and return structured JSON intent.
        Supports both Google Gemini native API and OpenRouter.
        """
        api_key = config('GEMINI_API_KEY', default=None)
        
        if not api_key:
            # Fallback to rule-based logic if no API key is provided
            print("Warning: GEMINI_API_KEY not found. Using fallback logic.")
            return SmartHomeServiceAssistant._fallback_logic(message)

        try:
            # Check if it's an OpenRouter key
            is_openrouter = api_key.startswith('sk-or-')
            
            if is_openrouter:
                from openai import OpenAI
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=api_key,
                )
                
                response = client.chat.completions.create(
                    model="google/gemini-2.0-flash-001",
                    messages=[
                        {"role": "system", "content": SmartHomeServiceAssistant.SYSTEM_PROMPT},
                        {"role": "user", "content": message}
                    ],
                    response_format={"type": "json_object"} if "gemini" in "google/gemini-2.0-flash-001" else None
                )
                raw_text = response.choices[0].message.content.strip()
            else:
                # Native Google Gemini
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    model_name="gemini-2.0-flash",
                    system_instruction=SmartHomeServiceAssistant.SYSTEM_PROMPT
                )
                response = model.generate_content(message)
                raw_text = response.text.strip()
            
            # Clean JSON response
            # Remove markdown code blocks if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:-3].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:-3].strip()
                
            return json.loads(raw_text)
            
        except Exception as e:
            print(f"AI API Error: {str(e)}")
            return SmartHomeServiceAssistant._fallback_logic(message)

    @staticmethod
    def _fallback_logic(message: str) -> Dict[str, Any]:
        """Simple rule-based logic as fallback"""
        import re
        message_lower = message.lower()
        
        # Very basic extraction logic
        category = "General"
        mapping = {
            'ac': 'AC Repair', 'plumb': 'Plumbing', 'elect': 'Electrical', 
            'clean': 'Cleaning', 'carpent': 'Carpentry', 'appliance': 'Appliance Repair',
            'garden': 'Gardening', 'paint': 'Painting'
        }
        for key, val in mapping.items():
            if key in message_lower:
                category = val
                break
                
        budget = None
        budget_match = re.search(r'(?:rs|pkr|under|below)?\s*(\d{3,})', message_lower)
        if budget_match:
            budget = int(budget_match.group(1))

        location = None
        # Very simple city/area detection
        cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'multan', 'peshawar', 'quetta', 'faisalabad']
        for city_name in cities:
            if city_name in message_lower:
                location = city_name.capitalize()
                break
            
        return {
            "category": category,
            "max_budget": budget,
            "urgency": "flexible",
            "location": location,
            "preferences": []
        }
