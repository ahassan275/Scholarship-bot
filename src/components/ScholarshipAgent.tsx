import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import ChatInterface from './ChatInterface';
import ProfileProgress from './ProfileProgress';
import { ConversationState, UserProfile, Message } from '../types';

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

  // Simulate agent response (replace with actual API call)
  const simulateAgentResponse = async (userInput: string): Promise<string> => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Mock responses based on conversation state
    if (conversationState === 'profiling') {
      if (!userProfile.field_of_study) {
        return "Hello! I'm your AI scholarship advisor. I'm here to help you find personalized scholarship opportunities. Let's start by getting to know you better. What field of study are you interested in or currently pursuing?";
      } else if (!userProfile.education_level) {
        return "Great choice! What's your current education level? (e.g., High School, Undergraduate, Graduate, PhD)";
      } else if (!userProfile.citizenship) {
        return "What is your citizenship/nationality? This is crucial as scholarships have specific eligibility requirements based on citizenship.";
      } else if (!userProfile.location) {
        return "Where are you located or planning to study? This helps me find location-specific opportunities.";
      } else {
        setConversationState('searching');
        return "Perfect! I have enough information. Let me search for relevant scholarships for you...";
      }
    } else if (conversationState === 'searching') {
      setConversationState('responding');
      return `## 🎯 Scholarships for ${userProfile.citizenship} Citizens

**1. Global Excellence Scholarship**
- Amount: $15,000 - $25,000
- Deadline: March 15, 2024
- Eligibility: International students in ${userProfile.field_of_study}
- [Source: university-scholarships.org]

**2. Future Leaders Grant**
- Amount: $10,000
- Deadline: April 30, 2024
- Eligibility: ${userProfile.citizenship} citizens studying ${userProfile.field_of_study}
- [Source: education-foundation.org]

**3. Academic Merit Award**
- Amount: $5,000 - $12,000
- Deadline: May 15, 2024
- Eligibility: Students in ${userProfile.location} region
- [Source: regional-education.gov]

## 📋 Application Guidance
- Start with your personal statement highlighting your passion for ${userProfile.field_of_study}
- Gather transcripts and recommendation letters
- Prepare for potential interviews

## ⏰ Next Steps
1. Visit the official websites to verify eligibility
2. Start working on your personal statement
3. Contact your professors for recommendation letters

Would you like me to provide detailed application support for any of these scholarships? (Yes/No)`;
    }
    
    return "I'm here to help! Feel free to ask me anything about scholarships or your application process.";
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

    // Update user profile based on input (simplified extraction)
    updateProfileFromInput(content);

    // Get agent response
    try {
      const response = await simulateAgentResponse(content);
      setIsTyping(false);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        type: response.includes('##') ? 'scholarship_results' : 'text',
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const updateProfileFromInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Simple keyword-based profile extraction (replace with actual LLM extraction)
    if (!userProfile.field_of_study) {
      if (lowerInput.includes('computer science') || lowerInput.includes('cs')) {
        setUserProfile(prev => ({ ...prev, field_of_study: 'Computer Science' }));
      } else if (lowerInput.includes('engineering')) {
        setUserProfile(prev => ({ ...prev, field_of_study: 'Engineering' }));
      } else if (lowerInput.includes('business')) {
        setUserProfile(prev => ({ ...prev, field_of_study: 'Business' }));
      } else if (lowerInput.includes('medicine') || lowerInput.includes('medical')) {
        setUserProfile(prev => ({ ...prev, field_of_study: 'Medicine' }));
      }
    }
    
    if (!userProfile.education_level) {
      if (lowerInput.includes('undergraduate') || lowerInput.includes('bachelor')) {
        setUserProfile(prev => ({ ...prev, education_level: 'Undergraduate' }));
      } else if (lowerInput.includes('graduate') || lowerInput.includes('master')) {
        setUserProfile(prev => ({ ...prev, education_level: 'Graduate' }));
      } else if (lowerInput.includes('phd') || lowerInput.includes('doctorate')) {
        setUserProfile(prev => ({ ...prev, education_level: 'PhD' }));
      } else if (lowerInput.includes('high school')) {
        setUserProfile(prev => ({ ...prev, education_level: 'High School' }));
      }
    }
    
    if (!userProfile.citizenship) {
      const countries = ['canadian', 'american', 'indian', 'chinese', 'british', 'german', 'french'];
      countries.forEach(country => {
        if (lowerInput.includes(country)) {
          setUserProfile(prev => ({ ...prev, citizenship: country.charAt(0).toUpperCase() + country.slice(1) }));
        }
      });
    }
    
    if (!userProfile.location) {
      const locations = ['canada', 'usa', 'india', 'uk', 'germany', 'france', 'australia'];
      locations.forEach(location => {
        if (lowerInput.includes(location)) {
          setUserProfile(prev => ({ ...prev, location: location.charAt(0).toUpperCase() + location.slice(1) }));
        }
      });
    }
  };

  const handleStartChat = () => {
    setShowWelcome(false);
    // Add initial greeting message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hello! I'm your AI scholarship advisor. I'm here to help you find personalized scholarship opportunities. Let's start by getting to know you better. What field of study are you interested in or currently pursuing?",
      sender: 'agent',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="max-w-7xl mx-auto">
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