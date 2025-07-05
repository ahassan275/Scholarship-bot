# Scholarship Agent - Frontend-Backend Integration

## Overview
This project integrates a React frontend with a Python backend to create a functional AI scholarship agent with real-time chat capabilities, live web search, and intelligent user profiling.

## Architecture

### Backend (Python + FastAPI)
- **main.py**: Core ScholarshipBot with 3-agent architecture (Profiler → Research → Response)
- **server.py**: FastAPI web server wrapper with session management
- **APIs Used**: Groq (LLM), Tavily (Web Search)

### Frontend (React + TypeScript)
- **src/components/ScholarshipAgent.tsx**: Main component with API integration
- **src/utils/api.ts**: API client for backend communication
- **Real-time chat interface** with typing indicators and error handling

## Quick Start

### 1. Environment Setup
```bash
# Create .env file with your API keys
cp .env.example .env

# Edit .env with your keys:
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 2. Install Dependencies
```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
npm install
```

### 3. Start Development Servers
```bash
# Option 1: Use the dev script (recommended)
./start_dev.sh

# Option 2: Start manually
# Terminal 1 - Backend
python server.py

# Terminal 2 - Frontend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## API Endpoints

### Core Endpoints
- `POST /chat` - Send messages and get agent responses
- `GET /profile/{session_id}` - Get current user profile
- `POST /reset/{session_id}` - Reset conversation
- `GET /health` - Health check

### Example API Usage
```javascript
// Send a message
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "I'm studying Computer Science",
    session_id: "optional-session-id"
  })
});
```

## Features Implemented

### ✅ Backend Integration
- [x] FastAPI server wrapper around ScholarshipBot
- [x] Session management (in-memory)
- [x] CORS configuration for frontend access
- [x] Error handling and proper HTTP status codes
- [x] Real-time conversation state management

### ✅ Frontend Integration
- [x] Replace mock responses with real API calls
- [x] Session ID generation and persistence
- [x] Loading states and error handling
- [x] Real-time profile updates from backend
- [x] Error banner for API connection issues

### ✅ Conversation Flow
- [x] Profiling phase with intelligent question asking
- [x] Automatic transition to search phase
- [x] Live scholarship search with Tavily integration
- [x] Structured response with source attribution
- [x] Follow-up support and application guidance

## Session Management
- Sessions are created automatically on first message
- Session IDs are persisted in localStorage
- Sessions timeout after 2 hours of inactivity
- Each session maintains isolated conversation state

## Error Handling
- Network connection errors with retry suggestions
- API rate limiting with user feedback
- Session recovery on page refresh
- Graceful degradation when services are unavailable

## Development Notes

### Backend Changes
- Added FastAPI server wrapper (`server.py`)
- Session-based conversation state management
- Thread-safe session storage with cleanup
- Enhanced error handling and logging

### Frontend Changes
- Removed mock `simulateAgentResponse()` function
- Added real API integration via `src/utils/api.ts`
- Session persistence with localStorage
- Real-time profile updates from backend responses
- Error handling UI with dismissible banners

## Testing Checklist

### Manual Testing
1. **Start Conversation**: Welcome screen → Start chat
2. **Profile Building**: Answer questions about field of study, education, citizenship, location
3. **Search Phase**: Automatic transition when profile is complete
4. **Search Results**: Live Tavily search results with source attribution
5. **Follow-up**: Application support and additional questions
6. **Session Persistence**: Refresh page, session should continue
7. **Error Handling**: Disconnect backend, should show error banner

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Send message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I study Computer Science"}'
```

## Production Considerations

### Backend
- Replace in-memory sessions with Redis
- Add database persistence for user profiles
- Implement proper logging and monitoring
- Add rate limiting and API key management
- Configure production CORS settings

### Frontend
- Environment-based API URL configuration
- Production build optimization
- Error tracking and analytics
- Performance monitoring
- Mobile responsive improvements

## Troubleshooting

### Backend Issues
- **Module not found**: `pip install -r requirements.txt`
- **API key errors**: Check .env file and API key validity
- **Port already in use**: Kill process on port 8000 or change port

### Frontend Issues
- **API connection failed**: Ensure backend is running on port 8000
- **CORS errors**: Check CORS configuration in server.py
- **Session not persisting**: Check localStorage permissions

### Common Issues
- **Rate limiting**: Groq/Tavily API limits reached
- **Network errors**: Check internet connection
- **Session timeout**: Sessions expire after 2 hours

## Support
For issues or questions, check:
1. API documentation at http://localhost:8000/docs
2. Browser console for frontend errors
3. Backend logs for API errors
4. Session stats at http://localhost:8000/sessions/stats