#!/bin/bash

# Development startup script for Scholarship Agent

echo "🚀 Starting Scholarship Agent Development Environment"
echo "=================================================="

# Check if .env file exists and has API keys
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Copy this template and fill in your API keys
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
EOF
    echo "📝 Please edit .env file with your API keys before continuing"
    exit 1
fi

# Check if API keys are set
if grep -q "your_groq_api_key_here" .env || grep -q "your_tavily_api_key_here" .env; then
    echo "⚠️  Please update .env file with your actual API keys:"
    echo "   - GROQ_API_KEY: Get from https://console.groq.com/keys"
    echo "   - TAVILY_API_KEY: Get from https://tavily.com"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if Python dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Check if Node dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "✅ Dependencies installed"

# Start backend server in background
echo "🔧 Starting backend server..."
python server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend development server
echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Make sure to set your API keys in .env file!"
echo "   - GROQ_API_KEY: Get from https://console.groq.com/keys"
echo "   - TAVILY_API_KEY: Get from https://tavily.com"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit 0' INT
wait