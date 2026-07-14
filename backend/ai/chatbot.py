"""
AI Chatbot for HomeCare Market — Powered by Google Gemini 2.0 Flash

Handles:
- Booking process guidance
- Payment and wallet questions
- Service discovery
- Provider-related queries
- General support
"""

import google.generativeai as genai
from decouple import config


SYSTEM_PROMPT = """
You are HomeCare AI — the smart assistant of HomeCare Market, a Pakistan-based home maintenance services marketplace.

Your personality: Friendly, helpful, professional, concise. You respond in clear English.
You only help with topics related to HomeCare Market. Do NOT answer unrelated questions.

Platform Overview:
- Customers can book home services (Plumbing, AC Repair, Electrical, Cleaning, Carpentry, Painting, Gardening, Appliance Repair)
- Service Providers accept jobs and complete them on-site
- Payment is CASH only — paid directly to the provider after service
- A 15% platform commission is deducted from provider earnings
- Providers must submit commission via bank transfer to remain active
- Bookings go through: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
- A 6-digit OTP (Service Code) is shared by the customer to confirm job completion

Key Features:
- AI-powered Smart Search ("Find me a plumber under Rs 2000")
- AI Chat Support (you, right now)
- AI Service Recommendations on the home screen
- Real-time booking status updates (no refresh needed)
- In-app chat between customer and provider
- Ratings and reviews after job completion

Rules:
- Keep responses SHORT and to the point (max 5-6 lines)
- Use bullet points for step-by-step guides
- If the user asks something unrelated to the platform, politely redirect them
- Always be helpful and warm
- Do NOT mention competitor platforms
- Prices are in PKR (Pakistani Rupees)
""".strip()


class Chatbot:
    """Gemini-powered AI chatbot for HomeCare Market"""

    @staticmethod
    def get_response(message: str) -> dict:
        """
        Get AI response for user message using AI.
        Supports both Google Gemini native API and OpenRouter.
        Falls back to rule-based responses if API key is invalid/missing.
        """
        api_key = config('GEMINI_API_KEY', default=None)

        if api_key:
            try:
                # Check if it's an OpenRouter key
                is_openrouter = api_key.startswith('sk-or-')
                
                reply = ""
                if is_openrouter:
                    from openai import OpenAI
                    client = OpenAI(
                        base_url="https://openrouter.ai/api/v1",
                        api_key=api_key,
                    )
                    
                    response = client.chat.completions.create(
                        model="google/gemini-2.0-flash-001",
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": message}
                        ]
                    )
                    if response.choices and response.choices[0].message.content:
                        reply = response.choices[0].message.content.strip()
                else:
                    # Native Google Gemini
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel(
                        model_name="gemini-2.0-flash",
                        system_instruction=SYSTEM_PROMPT
                    )
                    response = model.generate_content(message)
                    
                    # Safe check for text in response
                    if response and hasattr(response, 'text') and response.text:
                        reply = response.text.strip()
                    elif response and hasattr(response, 'candidates') and response.candidates:
                        # Sometimes text is nested or blocked
                        try:
                            reply = response.candidates[0].content.parts[0].text.strip()
                        except:
                            reply = ""
                
                if reply:
                    return {'response': reply, 'reply': reply, 'intent': 'ai_powered'}
                
                print("[AI Chatbot] Empty response from API, falling back.")
            except Exception as e:
                print(f"[AI Chatbot Error] {e}")
                # Fall through to rule-based fallback

        # Rule-based fallback
        reply = Chatbot._fallback_response(message)
        return {'response': reply, 'reply': reply, 'intent': 'fallback'}

    @staticmethod
    def _fallback_response(message: str) -> str:
        """Simple keyword-based fallback when Gemini is unavailable"""
        msg = message.lower()

        if any(w in msg for w in ['book', 'order', 'schedule', 'appointment']):
            return (
                "To book a service:\n"
                "1. Browse or search for a service\n"
                "2. Tap the service and select 'Book Now'\n"
                "3. Choose your date & time\n"
                "4. Wait for the provider to accept\n"
                "5. Share the 6-digit Service Code when they arrive"
            )
        if any(w in msg for w in ['pay', 'payment', 'cash', 'money', 'cost', 'price']):
            return (
                "Payment Info:\n"
                "• All payments are CASH — paid directly to the provider\n"
                "• No online payment needed\n"
                "• Providers pay a 15% platform commission via bank transfer"
            )
        if any(w in msg for w in ['otp', 'code', 'verify', 'complete', 'done']):
            return (
                "Service Code (OTP):\n"
                "• When the provider arrives, they'll ask for your Service Code\n"
                "• Find it in your Orders tab under the active booking\n"
                "• Share the 6-digit code to confirm job completion"
            )
        if any(w in msg for w in ['cancel', 'refund']):
            return (
                "Cancellations:\n"
                "• You can cancel a PENDING booking from your Orders tab\n"
                "• Once a provider starts the job (IN_PROGRESS), cancellation is not allowed\n"
                "• No online payment = no refund needed"
            )
        if any(w in msg for w in ['provider', 'professional', 'worker', 'become']):
            return (
                "Becoming a Service Provider:\n"
                "• Register as a Service Provider on the platform\n"
                "• Create your service listings\n"
                "• Accept jobs from customers\n"
                "• Complete jobs and maintain a good rating\n"
                "• Pay 15% commission to keep your account active"
            )
        if any(w in msg for w in ['hi', 'hello', 'hey', 'help']):
            return (
                "Hi! 👋 I'm HomeCare AI. I can help you with:\n"
                "• Booking services\n"
                "• Payment questions\n"
                "• Finding the right professional\n"
                "• Understanding service codes & completion\n\n"
                "What do you need help with?"
            )

        return (
            "I'm here to help with HomeCare Market! You can ask me about:\n"
            "• How to book a service\n"
            "• Payment & commission details\n"
            "• Service codes & job completion\n"
            "• Finding professionals"
        )
