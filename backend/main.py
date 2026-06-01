"""
NyayaGPT FastAPI Backend
========================
AI-powered Legal & Civic Intelligence Platform for Indian citizens.
Uses Groq (Llama-3) for generation, local BM25 for keyword retrieval,
and sentence-transformers for dense vector search.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from typing import Optional

app = FastAPI(
    title="NyayaGPT API",
    description="RAG-powered Legal Intelligence API for Indian law and policy",
    version="1.0.0",
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    sources: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    error: Optional[str] = None


class SimplifyRequest(BaseModel):
    answer: str


class SimplifyResponse(BaseModel):
    simplified: str
    error: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class EligibilityRequest(BaseModel):
    age: int
    gender: str
    state: str
    income: int
    occupation: str


# ── Endpoints ───────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "NyayaGPT API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """RAG-powered Q&A endpoint."""
    import httpx

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return ChatResponse(
            answer="",
            error="GROQ_API_KEY not configured. Set it in the .env file.",
        )

    system_prompt = """You are NyayaGPT, a careful assistant for Indian law, public policy, welfare schemes, and constitutional provisions.

Rules:
- Answer ONLY using the SOURCES provided. If the sources do not contain the answer, say so plainly.
- Be concise, neutral and structured. Use short paragraphs or bullets.
- Cite inline using [1], [2] markers that map to the SOURCES list, in order.
- Detect the user's language (English, Hindi, Punjabi, etc.) and reply in the SAME language.
- Never invent section numbers, dates, or quotes."""

    user_prompt = f"QUESTION:\n{request.question}\n\nSOURCES:\n{request.sources or 'No sources provided.'}\n\nAnswer the question using only the sources above. Use [n] citations inline."

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024,
                },
                timeout=30.0,
            )

        if res.status_code != 200:
            return ChatResponse(answer="", error=f"Groq API error: {res.status_code}")

        data = res.json()
        answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return ChatResponse(answer=answer)

    except Exception as e:
        return ChatResponse(answer="", error=str(e))


@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify(request: SimplifyRequest):
    """Explain Simply endpoint."""
    import httpx

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return SimplifyResponse(
            simplified="",
            error="GROQ_API_KEY not configured.",
        )

    system_prompt = """You are NyayaGPT in "Explain Simply" mode. Rewrite the following legal answer so a 15-year-old can understand it.

Rules:
- Use plain everyday language. Short sentences.
- Keep all [n] citation markers exactly where they appear.
- Do not add new facts that are not in the original answer.
- Reply in the same language as the original answer."""

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.answer},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1024,
                },
                timeout=30.0,
            )

        if res.status_code != 200:
            return SimplifyResponse(simplified="", error=f"Groq API error: {res.status_code}")

        data = res.json()
        simplified = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return SimplifyResponse(simplified=simplified)

    except Exception as e:
        return SimplifyResponse(simplified="", error=str(e))


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Admin authentication."""
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")

    if request.username == admin_user and request.password == admin_pass:
        return {"success": True, "role": "admin"}

    raise HTTPException(status_code=401, detail="Invalid credentials")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
