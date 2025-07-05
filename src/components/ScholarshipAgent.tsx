import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import ChatInterface from './ChatInterface';
import ProfileProgress from './ProfileProgress';
import { ConversationState, UserProfile, Message } from '../types';
import { api, ApiError } from '../utils/api';

const ScholarshipAgent: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [conversationState, setConversationState] = useState<ConversationState>('profiling');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    field_of_study: '',
    education_level: '',
    gpa: 0,
    location: '',
    citizenship: '',
    financial_need: '',
    extracurriculars: [],
    research_interests: [],
    career_goals: '',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // API call to get agent response
  const getAgentResponse = async (userInput: string): Promise<{ response: string; newSessionId?: string }> => {
    setIsTyping(true);
    setApiError(null);
    
    try {
      const result = await api.sendMessage(userInput, sessionId || undefined);
      
      // Update session ID if this is a new session
      if (!sessionId) {
        setSessionId(result.session_id);
      }
      
      // Update conversation state and user profile from API response
      const newState = result.conversation_state as ConversationState;
      setConversationState(newState);
      setUserProfile(result.user_profile);
      setIsConnected(true);
      
      // If the response indicates profile completion and transition to searching,
      // automatically trigger the search by sending a follow-up message
      if (newState === 'searching' && result.response.includes('PROFILE_COMPLETE')) {
        // Wait a moment then trigger search
        setTimeout(async () => {
          try {
            const searchResult = await api.sendMessage('search', result.session_id);
            setConversationState(searchResult.conversation_state as ConversationState);
            setUserProfile(searchResult.user_profile);
            setIsTyping(false);
            
            const searchMessage: Message = {
              id: (Date.now() + 2).toString(),
              content: searchResult.response,
              sender: 'agent',
              timestamp: new Date(),
              type: searchResult.response.includes('##') ? 'scholarship_results' : 'text',
            };
            setMessages(prev => [...prev, searchMessage]);
          } catch (error) {
            console.error('Auto-search failed:', error);
            setIsTyping(false);
          }
        }, 1000);
      }
      
      return {
        response: result.response,
        newSessionId: result.session_id
      };
    } catch (error) {
      console.error('API call failed:', error);
      setIsConnected(false);
      
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setApiError('Unable to connect to the scholarship service. Please ensure the backend server is running on port 8002.');
        } else {
          setApiError(`API Error (${error.status}): ${error.message}`);
        }
      } else {
        setApiError('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Get agent response
    try {
      const { response } = await getAgentResponse(content);
      setIsTyping(false);
      
      // Don't add the message if it contains PROFILE_COMPLETE (it will be replaced by search results)
      if (!response.includes('PROFILE_COMPLETE')) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'agent',
          timestamp: new Date(),
          type: response.includes('##') ? 'scholarship_results' : 'text',
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: apiError || 'I apologize, but I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Session persistence - save session ID to localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('scholarship-agent-session');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('scholarship-agent-session', sessionId);
    }
  }, [sessionId]);

  // Health check on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await api.healthCheck();
        setIsConnected(true);
        setApiError(null);
      } catch (error) {
        console.warn('API health check failed:', error);
        setIsConnected(false);
        setApiError('Unable to connect to the scholarship service. Please ensure the backend server is running.');
      }
    };
    
    checkApiHealth();
  }, []);

  const handleStartChat = async () => {
    setShowWelcome(false);
    
    // Get initial greeting from API if no session exists
    try {
      if (!sessionId) {
        const { response } = await getAgentResponse('Hello');
        setIsTyping(false);
        
        const welcomeMessage: Message = {
          id: 'welcome',
          content: response,
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        // If session exists, just show a generic greeting
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Welcome back! I'm your AI scholarship advisor. How can I help you today?",
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      // Fallback to generic greeting on error
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! I'm your AI scholarship advisor. I'm here to help you find personalized scholarship opportunities. Let's start by getting to know you better. What field of study are you interested in or currently pursuing?",
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleRetryConnection = async () => {
    setApiError(null);
    try {
      await api.healthCheck();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      setApiError('Still unable to connect. Please check if the backend server is running on port 8002.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* API Error Banner */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-5 h-5 text-red-500">⚠️</div>
              <div className="ml-3">
                <p className="text-sm font-medium">{apiError}</p>
                {!isConnected && (
                  <p className="text-xs mt-1">
                    Make sure to run: <code className="bg-red-200 px-1 rounded">python server.py</code>
                  </p>
                )}
              </div>
            </div>
            <div className="ml-auto pl-3 flex space-x-2">
              {!isConnected && (
                <button
                  onClick={handleRetryConnection}
                  className="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setApiError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 flex items-center justify-center"
      >
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span>{isConnected ? 'Connected to AI Service' : 'Disconnected from AI Service'}</span>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" onStartChat={handleStartChat} />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]"
          >
            {/* Profile Progress Sidebar */}
            <div className="lg:col-span-1">
              <ProfileProgress 
                userProfile={userProfile}
                conversationState={conversationState}
              />
            </div>
            
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                conversationState={conversationState}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScholarshipAgent;