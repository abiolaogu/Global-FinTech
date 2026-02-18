from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

class FinancialQuery(BaseModel):
    user_id: str
    query: str = "Provide financial advice based on my recent activity."
    provider: str = "mock" # mock, gemini, openai, anthropic

class InsightResponse(BaseModel):
    insight: str
    confidence: float
    source: str

@app.get("/")
def read_root():
    return {"status": "AI Advisor Service Running", "providers": ["mock", "gemini", "openai", "anthropic"]}

@app.post("/advise", response_model=InsightResponse)
async def get_advice(query: FinancialQuery):
    try:
        if query.provider == "gemini":
            return await get_gemini_advice(query.query)
        elif query.provider == "openai":
            return await get_openai_advice(query.query)
        elif query.provider == "anthropic":
            return await get_anthropic_advice(query.query)
        else:
            return get_mock_advice()
    except Exception as e:
        # Fallback to mock if real provider fails
        print(f"Error with provider {query.provider}: {e}")
        return get_mock_advice(error=str(e))

def get_mock_advice(error: str = None):
    insights = [
        "Based on your spending habits, you could save 15% by switching to a high-yield savings account.",
        "Your portfolio is heavily weighted in tech. Consider diversifying into renewable energy ETFs.",
        "You've exceeded your dining out budget this month. Try cooking at home to stay on track.",
        "Market trends suggest a bullish run for crypto. Review your holdings in the custodial wallet."
    ]
    insight = random.choice(insights)
    if error:
        insight += f" (Note: Fallback to mock due to provider error: {error})"
    
    return InsightResponse(
        insight=insight,
        confidence=0.95,
        source="Global FinTech AI Engine (Mock)"
    )

async def get_gemini_advice(prompt: str):
    import google.generativeai as genai
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(f"You are a financial advisor. {prompt}")
    
    return InsightResponse(
        insight=response.text,
        confidence=0.9,
        source="Gemini Pro"
    )

async def get_openai_advice(prompt: str):
    from openai import AsyncOpenAI
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found")
        
    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful financial advisor."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return InsightResponse(
        insight=response.choices[0].message.content,
        confidence=0.9,
        source="OpenAI GPT-3.5"
    )

async def get_anthropic_advice(prompt: str):
    from anthropic import AsyncAnthropic
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not found")
        
    client = AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": f"You are a financial advisor. {prompt}"}
        ]
    )
    
    return InsightResponse(
        insight=response.content[0].text,
        confidence=0.9,
        source="Claude 3 Opus"
    )
