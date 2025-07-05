import os
import uuid
from typing import Dict, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import ScholarshipBot, ConversationState, UserProfile
import asyncio
from threading import Lock
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Scholarship Agent API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session storage (in-memory for MVP)
sessions: Dict[str, Dict[str, Any]] = {}
session_lock = Lock()

# Session cleanup configuration
SESSION_TIMEOUT = timedelta(hours=2)
LAST_CLEANUP = datetime.now()

class ChatRequest(BaseModel):
    message: str
    session_id: str = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    conversation_state: str
    user_profile: Dict[str, Any]
    message_id: str

class ProfileResponse(BaseModel):
    session_id: str
    user_profile: Dict[str, Any]
    conversation_state: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str

def cleanup_expired_sessions():
    """Remove expired sessions from memory"""
    global LAST_CLEANUP
    current_time = datetime.now()
    
    # Only cleanup every 30 minutes
    if current_time - LAST_CLEANUP < timedelta(minutes=30):
        return
    
    with session_lock:
        expired_sessions = []
        for session_id, session_data in sessions.items():
            if current_time - session_data['last_activity'] > SESSION_TIMEOUT:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del sessions[session_id]
    
    LAST_CLEANUP = current_time

def create_session() -> str:
    """Create a new session and return session ID"""
    cleanup_expired_sessions()
    
    session_id = str(uuid.uuid4())
    
    with session_lock:
        sessions[session_id] = {
            'bot': ScholarshipBot(),
            'created_at': datetime.now(),
            'last_activity': datetime.now(),
            'message_count': 0
        }
    
    return session_id

def get_session(session_id: str) -> Dict[str, Any]:
    """Get session data or raise HTTPException if not found"""
    cleanup_expired_sessions()
    
    with session_lock:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id]
        session_data['last_activity'] = datetime.now()
        return session_data

def user_profile_to_dict(profile: UserProfile) -> Dict[str, Any]:
    """Convert UserProfile dataclass to dictionary"""
    return {
        'field_of_study': profile.field_of_study,
        'education_level': profile.education_level,
        'gpa': profile.gpa,
        'location': profile.location,
        'citizenship': profile.citizenship,
        'financial_need': profile.financial_need,
        'extracurriculars': profile.extracurriculars,
        'research_interests': profile.research_interests,
        'career_goals': profile.career_goals,
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint that processes user messages"""
    try:
        # Create new session if not provided
        if not request.session_id:
            session_id = create_session()
        else:
            session_id = request.session_id
        
        # Get session data
        session_data = get_session(session_id)
        bot = session_data['bot']
        
        # Process message
        response = bot.process_message(request.message)
        
        # Update session
        with session_lock:
            sessions[session_id]['message_count'] += 1
            sessions[session_id]['last_activity'] = datetime.now()
        
        # Generate message ID
        message_id = f"{session_id}_{session_data['message_count']}"
        
        return ChatResponse(
            response=response,
            session_id=session_id,
            conversation_state=bot.state.value,
            user_profile=user_profile_to_dict(bot.user_profile),
            message_id=message_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/profile/{session_id}", response_model=ProfileResponse)
async def get_profile(session_id: str):
    """Get current user profile state"""
    try:
        session_data = get_session(session_id)
        bot = session_data['bot']
        
        return ProfileResponse(
            session_id=session_id,
            user_profile=user_profile_to_dict(bot.user_profile),
            conversation_state=bot.state.value
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/reset/{session_id}")
async def reset_session(session_id: str):
    """Reset conversation for existing session"""
    try:
        session_data = get_session(session_id)
        
        # Create new bot instance
        with session_lock:
            sessions[session_id]['bot'] = ScholarshipBot()
            sessions[session_id]['message_count'] = 0
            sessions[session_id]['last_activity'] = datetime.now()
        
        return {"status": "success", "message": "Session reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/sessions/stats")
async def get_session_stats():
    """Get current session statistics (for monitoring)"""
    cleanup_expired_sessions()
    
    with session_lock:
        active_sessions = len(sessions)
        total_messages = sum(session['message_count'] for session in sessions.values())
    
    return {
        "active_sessions": active_sessions,
        "total_messages": total_messages,
        "session_timeout_hours": SESSION_TIMEOUT.total_seconds() / 3600
    }

if __name__ == "__main__":
    import uvicorn
    
    # Validate environment variables
    if not os.environ.get('GROQ_API_KEY'):
        raise ValueError("GROQ_API_KEY environment variable is required")
    if not os.environ.get('TAVILY_API_KEY'):
        raise ValueError("TAVILY_API_KEY environment variable is required")
    
    print("🚀 Starting Scholarship Agent API Server...")
    print(f"📊 Health check: http://localhost:8002/health")
    print(f"📖 API docs: http://localhost:8002/docs")
    print(f"🔄 Session timeout: {SESSION_TIMEOUT}")
    
    uvicorn.run("server:app", host="0.0.0.0", port=8002, reload=True)